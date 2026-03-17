-- ============================================================
-- aihealz.com — SEO & Indexing Infrastructure
-- Indexing logs, keyword gaps, content freshness tracking
-- Run AFTER 001-006
-- ============================================================

-- ─── 1. INDEXING LOGS ──────────────────────────────────────
-- Tracks which URLs have been submitted to Google/Bing for indexing
CREATE TABLE indexing_logs (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url             VARCHAR(2000) NOT NULL,
  index_api       VARCHAR(50) NOT NULL,             -- 'google', 'indexnow', 'manual'
  action          VARCHAR(50) NOT NULL DEFAULT 'URL_UPDATED',
  -- 'URL_UPDATED', 'URL_DELETED'
  status          VARCHAR(50) NOT NULL DEFAULT 'submitted',
  -- 'submitted', 'indexed', 'failed', 'deindexed'
  response_code   INT,
  response_body   JSONB DEFAULT '{}',
  submitted_at    TIMESTAMPTZ DEFAULT NOW(),
  indexed_at      TIMESTAMPTZ,
  last_checked_at TIMESTAMPTZ,
  error_message   TEXT,
  retry_count     INT DEFAULT 0,
  country_code    VARCHAR(5),
  page_type       VARCHAR(50),                      -- 'condition', 'doctor', 'city', 'content'
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_indexlog_url    ON indexing_logs(url);
CREATE INDEX idx_indexlog_status ON indexing_logs(status);
CREATE INDEX idx_indexlog_api    ON indexing_logs(index_api);
CREATE INDEX idx_indexlog_country ON indexing_logs(country_code);

-- ─── 2. KEYWORD GAPS ──────────────────────────────────────
-- Competitive keyword analysis results
CREATE TABLE keyword_gaps (
  id                SERIAL PRIMARY KEY,
  keyword           VARCHAR(500) NOT NULL,
  search_volume     INT,
  difficulty_score  DECIMAL(4,2),                   -- 0-100
  current_rank      INT,                            -- Our current ranking (null = not ranked)
  competitor        VARCHAR(255),                   -- 'practo', 'zocdoc', etc.
  competitor_rank   INT,
  country_code      VARCHAR(5) NOT NULL,
  geography_id      INT REFERENCES geographies(id),
  condition_slug    VARCHAR(255),
  opportunity_score DECIMAL(5,2),                   -- Higher = more opportunity
  status            VARCHAR(50) DEFAULT 'new',
  -- 'new', 'content_created', 'optimizing', 'ranked', 'dismissed'
  suggested_action  TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_kwgap_country ON keyword_gaps(country_code);
CREATE INDEX idx_kwgap_score   ON keyword_gaps(opportunity_score DESC);
CREATE INDEX idx_kwgap_status  ON keyword_gaps(status);

-- ─── 3. CONTENT FRESHNESS ──────────────────────────────────
-- Tracks when content was last updated for freshness signals
CREATE TABLE content_freshness (
  id                SERIAL PRIMARY KEY,
  url               VARCHAR(2000) NOT NULL UNIQUE,
  page_type         VARCHAR(50) NOT NULL,
  content_hash      VARCHAR(64),                    -- SHA-256 of content
  last_modified     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_crawled      TIMESTAMPTZ,
  freshness_score   DECIMAL(4,2) DEFAULT 1.00,      -- 1.00 = fresh, decays over time
  needs_refresh     BOOLEAN DEFAULT false,
  refresh_reason    TEXT,
  country_code      VARCHAR(5),
  condition_slug    VARCHAR(255),
  geography_slug    VARCHAR(255),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fresh_url     ON content_freshness(url);
CREATE INDEX idx_fresh_needs   ON content_freshness(needs_refresh) WHERE needs_refresh = true;
CREATE INDEX idx_fresh_score   ON content_freshness(freshness_score);

-- ─── 4. SITEMAP GENERATION LOGS ────────────────────────────
CREATE TABLE sitemap_logs (
  id              SERIAL PRIMARY KEY,
  sitemap_name    VARCHAR(255) NOT NULL,            -- 'sitemap-india-mumbai.xml'
  url_count       INT NOT NULL DEFAULT 0,
  file_size_bytes INT,
  generated_at    TIMESTAMPTZ DEFAULT NOW(),
  generation_ms   INT,
  country_code    VARCHAR(5),
  is_index        BOOLEAN DEFAULT false             -- true for sitemap index files
);

-- ─── 5. Freshness decay function ────────────────────────────
-- Run daily via cron to decay freshness scores
CREATE OR REPLACE FUNCTION decay_freshness_scores()
RETURNS INT AS $$
DECLARE
  updated_count INT;
BEGIN
  -- Decay: lose 0.5% per day since last modification
  UPDATE content_freshness SET
    freshness_score = GREATEST(
      0.10,
      1.0 - (EXTRACT(EPOCH FROM (NOW() - last_modified)) / 86400.0) * 0.005
    ),
    needs_refresh = CASE
      WHEN 1.0 - (EXTRACT(EPOCH FROM (NOW() - last_modified)) / 86400.0) * 0.005 < 0.50 THEN true
      ELSE needs_refresh
    END;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;
