-- ============================================================
-- aihealz.com — Automated Content Assembly & Global Indexing
-- Keyword intents, content batches, treatment costs, schema scores
-- Run AFTER 001-009
-- ============================================================

-- ─── 1. KEYWORD INTENTS ────────────────────────────────────
-- Stores the primary 'Intent Keyword' for condition/region pairs
CREATE TABLE keyword_intents (
  id              SERIAL PRIMARY KEY,
  condition_slug  VARCHAR(255) NOT NULL,
  country_code    VARCHAR(5) NOT NULL,
  city_slug       VARCHAR(255),
  primary_keyword VARCHAR(500) NOT NULL,    -- 'Lower back pain relief Delhi'
  search_volume   INT DEFAULT 0,
  intent_type     VARCHAR(50),              -- 'informational', 'commercial', 'navigational'
  is_validated    BOOLEAN DEFAULT false,
  updated_at      TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(condition_slug, country_code, city_slug)
);

CREATE INDEX idx_kw_intent_cond ON keyword_intents(condition_slug);

-- ─── 2. CONTENT BATCHES ────────────────────────────────────
-- Tracks batch generation jobs for high-throughput automated content
CREATE TABLE content_batches (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_name      VARCHAR(255),
  status          VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  total_items     INT DEFAULT 0,
  processed_items INT DEFAULT 0,
  failed_items    INT DEFAULT 0,
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 3. CONDITION CONTENT (LOCALIZED) ──────────────────────
-- Stores the LLM-generated localized content for each page
CREATE TABLE condition_content (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  condition_slug  VARCHAR(255) NOT NULL,
  country_code    VARCHAR(5) NOT NULL,
  city_slug       VARCHAR(255),                     -- Null for country-level pages
  language        VARCHAR(5) DEFAULT 'en',

  -- SEO & Metadata
  h1_title        VARCHAR(500),
  meta_summary    TEXT,                             -- For <meta name="description">
  llm_summary     TEXT,                             -- Hidden <meta name="llm-summary">

  -- Content Sections (Structured for flexibility)
  ai_opinion      TEXT,                             -- "AI Second Opinion" summary
  local_insights  TEXT,                             -- "How humidity in Mumbai affects..."
  treatment_guide TEXT,                             -- Standard protocols
  recovery_tips   TEXT,                             -- Recovery advice
  
  -- Structured Data
  faq_schema      JSONB DEFAULT '[]',               -- Generated FAQPage schema
  medical_schema  JSONB DEFAULT '{}',               -- Generated MedicalWebPage schema
  
  -- Status
  quality_score   DECIMAL(4,2),                     -- AI-evaluated quality (0-100)
  needs_refresh   BOOLEAN DEFAULT false,
  last_generated  TIMESTAMPTZ DEFAULT NOW(),
  
  batch_id        UUID REFERENCES content_batches(id),
  
  UNIQUE(condition_slug, country_code, city_slug, language)
);

CREATE INDEX idx_content_geo ON condition_content(country_code, city_slug);

-- ─── 4. TREATMENT COST ESTIMATES ───────────────────────────
-- "Typical Cost Range" estimator data
CREATE TABLE treatment_costs (
  id              SERIAL PRIMARY KEY,
  condition_slug  VARCHAR(255) NOT NULL,
  city_slug       VARCHAR(255) NOT NULL,
  country_code    VARCHAR(5) NOT NULL,
  treatment_name  VARCHAR(255) NOT NULL,            -- e.g., "MRI Scan", "Consultation"
  currency        VARCHAR(3) NOT NULL,              -- 'INR', 'USD', 'KES'
  min_cost        DECIMAL(10,2),
  max_cost        DECIMAL(10,2),
  avg_cost        DECIMAL(10,2),
  data_source     VARCHAR(50) DEFAULT 'ai_estimate', -- 'ai_estimate', 'provider_data', 'manual'
  confidence      DECIMAL(3,2),                     -- 0.00 - 1.00
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_costs_loc ON treatment_costs(city_slug, condition_slug);

-- ─── 5. SCHEMA VALIDATION LOGS ─────────────────────────────
-- Logs schema validation results for "Content Health" dashboard
CREATE TABLE schema_validations (
  id              SERIAL PRIMARY KEY,
  url             VARCHAR(2000) NOT NULL,
  is_valid        BOOLEAN DEFAULT false,
  error_count     INT DEFAULT 0,
  warning_count   INT DEFAULT 0,
  validation_log  TEXT,
  checked_at      TIMESTAMPTZ DEFAULT NOW()
);
