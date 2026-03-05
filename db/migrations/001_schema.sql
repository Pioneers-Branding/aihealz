-- ============================================================
-- aihealz.com — Master Schema
-- PostgreSQL 15+ | Normalized 3NF | E-E-A-T Compliant
-- ============================================================

-- ─── ENUMS ──────────────────────────────────────────────────
CREATE TYPE geo_level        AS ENUM ('country','state','city','locality');
CREATE TYPE subscription_tier AS ENUM ('free','premium','enterprise');
CREATE TYPE content_status    AS ENUM ('ai_draft','under_review','verified','published');

-- ─── LANGUAGES ──────────────────────────────────────────────
CREATE TABLE languages (
  code  VARCHAR(5) PRIMARY KEY,          -- ISO 639-1: 'en', 'hi', 'ta'
  name  VARCHAR(100) NOT NULL,
  native_name VARCHAR(100),              -- e.g. 'हिन्दी' for Hindi
  is_active   BOOLEAN DEFAULT true
);

-- ─── MEDICAL CONDITIONS (The "Golden Record") ──────────────
CREATE TABLE medical_conditions (
  id               SERIAL PRIMARY KEY,
  slug             VARCHAR(255) NOT NULL UNIQUE,
  scientific_name  VARCHAR(500) NOT NULL,
  common_name      VARCHAR(500) NOT NULL,
  description      TEXT,
  symptoms         JSONB NOT NULL DEFAULT '[]',
  treatments       JSONB NOT NULL DEFAULT '[]',
  faqs             JSONB NOT NULL DEFAULT '[]',
  specialist_type  VARCHAR(100) NOT NULL,
  severity_level   VARCHAR(20) CHECK (severity_level IN ('low','medium','high','critical')),
  icd_code         VARCHAR(20),
  body_system      VARCHAR(100),         -- e.g. 'Musculoskeletal', 'Neurological'
  schema_markup    JSONB,                -- Pre-built JSON-LD for SEO
  is_active        BOOLEAN DEFAULT true,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─── GEOGRAPHIES (Hierarchical Location Tree) ──────────────
CREATE TABLE geographies (
  id                  SERIAL PRIMARY KEY,
  name                VARCHAR(255) NOT NULL,
  slug                VARCHAR(255) NOT NULL,
  level               geo_level NOT NULL,
  parent_id           INT REFERENCES geographies(id) ON DELETE CASCADE,
  latitude            DECIMAL(10,7),
  longitude           DECIMAL(10,7),
  supported_languages VARCHAR(5)[] NOT NULL DEFAULT '{en}',
  population          BIGINT,
  timezone            VARCHAR(50),
  is_active           BOOLEAN DEFAULT true,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(slug, level, parent_id)
);

-- ─── DOCTORS / PROVIDERS ────────────────────────────────────
CREATE TABLE doctors_providers (
  id                 SERIAL PRIMARY KEY,
  slug               VARCHAR(255) NOT NULL UNIQUE,
  name               VARCHAR(500) NOT NULL,
  license_number     VARCHAR(100),
  licensing_body     VARCHAR(200),        -- e.g. 'MCI', 'GMC', 'AMA'
  bio                TEXT,
  qualifications     TEXT[],
  experience_years   INT,
  contact_info       JSONB NOT NULL DEFAULT '{}',
  profile_image      VARCHAR(500),
  geography_id       INT REFERENCES geographies(id),
  is_verified        BOOLEAN DEFAULT false,
  verification_date  TIMESTAMPTZ,
  subscription_tier  subscription_tier DEFAULT 'free',
  rating             DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),
  review_count       INT DEFAULT 0,
  consultation_fee   DECIMAL(10,2),
  fee_currency       VARCHAR(3) DEFAULT 'INR',
  available_online   BOOLEAN DEFAULT false,
  schema_markup      JSONB,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ─── DOCTOR ↔ CONDITION JUNCTION ────────────────────────────
CREATE TABLE doctor_specialties (
  id              SERIAL PRIMARY KEY,
  doctor_id       INT NOT NULL REFERENCES doctors_providers(id) ON DELETE CASCADE,
  condition_id    INT NOT NULL REFERENCES medical_conditions(id) ON DELETE CASCADE,
  is_primary      BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(doctor_id, condition_id)
);

-- ─── LOCALIZED CONTENT (AI-generated, human-verified) ──────
CREATE TABLE localized_content (
  id               SERIAL PRIMARY KEY,
  condition_id     INT NOT NULL REFERENCES medical_conditions(id) ON DELETE CASCADE,
  language_code    VARCHAR(5) NOT NULL REFERENCES languages(code),
  geography_id     INT REFERENCES geographies(id),
  title            VARCHAR(500) NOT NULL,
  description      TEXT NOT NULL,
  localized_advice TEXT,
  local_factors    JSONB DEFAULT '{}',   -- weather, lifestyle, diet
  consultation_tips TEXT,                 -- "What to expect at a consultation in [City]"
  meta_title       VARCHAR(160),
  meta_description VARCHAR(300),
  status           content_status DEFAULT 'ai_draft',
  reviewed_by      INT REFERENCES doctors_providers(id),
  reviewed_at      TIMESTAMPTZ,
  ai_model_used    VARCHAR(100),
  word_count       INT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(condition_id, language_code, geography_id)
);

-- ─── CONDITION REVIEWERS (E-E-A-T "Fact-checked by") ───────
CREATE TABLE condition_reviewers (
  id              SERIAL PRIMARY KEY,
  condition_id    INT NOT NULL REFERENCES medical_conditions(id) ON DELETE CASCADE,
  doctor_id       INT NOT NULL REFERENCES doctors_providers(id) ON DELETE CASCADE,
  geography_id    INT REFERENCES geographies(id),
  is_primary      BOOLEAN DEFAULT true,
  review_date     TIMESTAMPTZ DEFAULT NOW(),
  review_notes    TEXT,
  UNIQUE(condition_id, doctor_id, geography_id)
);

-- ─── AI ANALYSIS CACHE ─────────────────────────────────────
CREATE TABLE ai_analysis_cache (
  id               SERIAL PRIMARY KEY,
  input_hash       VARCHAR(64) NOT NULL UNIQUE,  -- SHA-256 of input
  condition_slug   VARCHAR(255),
  extracted_data   JSONB NOT NULL,
  summary_text     TEXT,
  specialist_type  VARCHAR(100),
  severity_level   VARCHAR(20),
  matched_doctors  INT[],                         -- doctor IDs matched
  model_used       VARCHAR(100),
  token_count      INT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  expires_at       TIMESTAMPTZ
);

-- ─── PAGE CACHE ─────────────────────────────────────────────
CREATE TABLE page_cache (
  id             SERIAL PRIMARY KEY,
  cache_key      VARCHAR(500) NOT NULL UNIQUE,
  html_fragment  TEXT NOT NULL,
  etag           VARCHAR(64),
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  expires_at     TIMESTAMPTZ NOT NULL
);

-- ─── UI TRANSLATIONS (Key-Value i18n for 90% of page) ──────
CREATE TABLE ui_translations (
  id            SERIAL PRIMARY KEY,
  language_code VARCHAR(5) NOT NULL REFERENCES languages(code),
  namespace     VARCHAR(100) NOT NULL DEFAULT 'common',  -- 'common', 'condition', 'doctor'
  key           VARCHAR(255) NOT NULL,
  value         TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(language_code, namespace, key)
);

-- ─── SITEMAP REGISTRY ───────────────────────────────────────
CREATE TABLE sitemap_entries (
  id            SERIAL PRIMARY KEY,
  url_path      VARCHAR(500) NOT NULL UNIQUE,
  sitemap_index INT NOT NULL DEFAULT 0,    -- which sub-sitemap (0..N)
  changefreq    VARCHAR(20) DEFAULT 'weekly',
  priority      DECIMAL(2,1) DEFAULT 0.7,
  last_modified TIMESTAMPTZ DEFAULT NOW(),
  language_code VARCHAR(5) REFERENCES languages(code),
  condition_id  INT REFERENCES medical_conditions(id),
  geography_id  INT REFERENCES geographies(id)
);

-- ============================================================
-- TRIGGER: Enforce specialty limits per subscription tier
-- Free = 2 | Premium = 15 | Enterprise = 1000
-- ============================================================
CREATE OR REPLACE FUNCTION enforce_specialty_limit()
RETURNS TRIGGER AS $$
DECLARE
  current_count INT;
  tier subscription_tier;
  max_allowed INT;
BEGIN
  SELECT d.subscription_tier INTO tier
  FROM doctors_providers d WHERE d.id = NEW.doctor_id;

  SELECT COUNT(*) INTO current_count
  FROM doctor_specialties WHERE doctor_id = NEW.doctor_id;

  max_allowed := CASE
    WHEN tier = 'free'       THEN 2
    WHEN tier = 'premium'    THEN 15
    WHEN tier = 'enterprise' THEN 1000
  END;

  IF current_count >= max_allowed THEN
    RAISE EXCEPTION 'Doctor (id=%) has reached maximum specialties (%) for tier "%"',
      NEW.doctor_id, max_allowed, tier;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_doctor_specialty_limit
  BEFORE INSERT ON doctor_specialties
  FOR EACH ROW EXECUTE FUNCTION enforce_specialty_limit();

-- ============================================================
-- TRIGGER: Auto-update updated_at timestamp
-- ============================================================
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_condition_updated
  BEFORE UPDATE ON medical_conditions
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_doctor_updated
  BEFORE UPDATE ON doctors_providers
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_content_updated
  BEFORE UPDATE ON localized_content
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();
