-- ============================================================
-- aihealz.com — Super-Admin CMS & Dynamic Logic Layer
-- Translation cache, media assets, footer templates, SEO overrides
-- Run AFTER 001-008
-- ============================================================

-- ─── 1. TRANSLATION CACHE ──────────────────────────────────
-- Pay for a translation once, serve forever
CREATE TABLE translation_cache (
  id                SERIAL PRIMARY KEY,
  source_text_hash  VARCHAR(64) NOT NULL,           -- SHA-256 of source text
  source_language   VARCHAR(5) NOT NULL DEFAULT 'en',
  target_language   VARCHAR(5) NOT NULL,
  source_text       TEXT NOT NULL,
  translated_text   TEXT NOT NULL,
  translation_api   VARCHAR(50) NOT NULL,           -- 'sarvam', 'openrouter', 'deepseek', 'manual'
  model_used        VARCHAR(100),
  quality_score     DECIMAL(4,2),                   -- 0-1, from auditor
  is_audited        BOOLEAN DEFAULT false,
  audited_by        VARCHAR(255),
  audited_at        TIMESTAMPTZ,
  token_cost        INT DEFAULT 0,
  cost_usd          DECIMAL(8,6) DEFAULT 0,
  category          VARCHAR(50) DEFAULT 'medical',  -- 'medical', 'ui', 'meta', 'footer'
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(source_text_hash, target_language)
);

CREATE INDEX idx_tcache_hash ON translation_cache(source_text_hash, target_language);
CREATE INDEX idx_tcache_audit ON translation_cache(is_audited) WHERE is_audited = false;

-- ─── 2. MEDIA ASSETS ───────────────────────────────────────
-- AI-generated anatomical renders + CDN references
CREATE TABLE media_assets (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  condition_slug    VARCHAR(255),
  entity_type       VARCHAR(50) NOT NULL DEFAULT 'condition', -- 'condition', 'specialty', 'body_system'
  entity_id         INT,
  asset_type        VARCHAR(50) NOT NULL DEFAULT 'render',    -- 'render', 'diagram', 'icon', 'photo'
  prompt_used       TEXT,
  generation_api    VARCHAR(100),                  -- 'pollinations', 'stable-diffusion', 'manual'
  source_url        VARCHAR(1000),                 -- Original generation URL
  cdn_url           VARCHAR(1000),                 -- Stored CDN URL
  thumbnail_url     VARCHAR(1000),
  width             INT,
  height            INT,
  file_size_bytes   INT,
  alt_text          VARCHAR(500),
  style_preset      VARCHAR(50) DEFAULT 'clinical-blue', -- Consistent aesthetic
  is_active         BOOLEAN DEFAULT true,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_media_condition ON media_assets(condition_slug);
CREATE INDEX idx_media_entity    ON media_assets(entity_type, entity_id);

-- ─── 3. FOOTER TEMPLATES ───────────────────────────────────
-- Dynamic regional footer rules
CREATE TABLE footer_templates (
  id              SERIAL PRIMARY KEY,
  rule_name       VARCHAR(255) NOT NULL,
  match_type      VARCHAR(50) NOT NULL,             -- 'country', 'city', 'continent', 'default'
  match_value     VARCHAR(255),                     -- 'india', 'nairobi', 'africa', '*'
  geography_id    INT REFERENCES geographies(id),
  template_data   JSONB NOT NULL DEFAULT '{}',
  -- { links: [{label, href}], trending: [{condition, href}], guides: [{label, href, lang}] }
  priority        INT DEFAULT 0,                    -- Higher = preferred
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_footer_match ON footer_templates(match_type, match_value);

-- ─── 4. SEO OVERRIDES ──────────────────────────────────────
-- Manual SEO control for programmatic pages
CREATE TABLE seo_overrides (
  id              SERIAL PRIMARY KEY,
  url_pattern     VARCHAR(2000) NOT NULL UNIQUE,     -- Exact URL or glob pattern
  meta_title      VARCHAR(500),
  meta_description VARCHAR(500),
  h1_override     VARCHAR(500),
  json_ld_extra   JSONB,
  canonical_url   VARCHAR(2000),
  no_index        BOOLEAN DEFAULT false,
  no_follow       BOOLEAN DEFAULT false,
  og_image        VARCHAR(1000),
  priority_score  DECIMAL(3,1) DEFAULT 0.5,          -- For sitemap priority
  auto_generated  BOOLEAN DEFAULT false,
  last_checked    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_seo_url ON seo_overrides(url_pattern);

-- ─── 5. KEYWORD SEARCH LOGS ────────────────────────────────
-- Track what users search on-site for opportunity detection
CREATE TABLE keyword_search_logs (
  id              SERIAL PRIMARY KEY,
  query           VARCHAR(500) NOT NULL,
  normalized_query VARCHAR(500),                    -- Lowercased, trimmed
  session_hash    VARCHAR(64),
  country_code    VARCHAR(5),
  city_slug       VARCHAR(255),
  results_count   INT DEFAULT 0,
  clicked_result  VARCHAR(500),
  has_doctors     BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_kwsearch_query ON keyword_search_logs(normalized_query);
CREATE INDEX idx_kwsearch_city  ON keyword_search_logs(city_slug);
CREATE INDEX idx_kwsearch_gap   ON keyword_search_logs(has_doctors) WHERE has_doctors = false;

-- ─── 6. ICD-10 Specialty Mapping Cache ─────────────────────
CREATE TABLE icd10_specialty_map (
  icd_code        VARCHAR(20) PRIMARY KEY,
  condition_name  VARCHAR(500) NOT NULL,
  specialty       VARCHAR(100),
  body_system     VARCHAR(100),
  severity_level  VARCHAR(20) DEFAULT 'moderate',
  treatments      TEXT[],
  mapped_by       VARCHAR(50) DEFAULT 'llm',       -- 'llm', 'manual', 'icd_chapter'
  condition_id    INT REFERENCES medical_conditions(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Views for CMS alerts ──────────────────────────────────

-- Keyword opportunities: searches with no doctors
CREATE VIEW keyword_opportunities AS
  SELECT
    normalized_query,
    city_slug,
    country_code,
    COUNT(*) as search_count,
    MAX(created_at) as last_searched
  FROM keyword_search_logs
  WHERE has_doctors = false
    AND created_at > NOW() - INTERVAL '30 days'
  GROUP BY normalized_query, city_slug, country_code
  HAVING COUNT(*) >= 10
  ORDER BY search_count DESC;
