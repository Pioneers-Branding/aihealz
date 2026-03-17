-- ============================================================
-- aihealz.com — Medical Intelligence Engine
-- Report analysis, health timelines, CMS enhancements
-- Run AFTER 001, 002, 003, 004
-- ============================================================

-- ─── NEW ENUMS ──────────────────────────────────────────────
CREATE TYPE urgency_level AS ENUM ('routine', 'urgent', 'emergency');
CREATE TYPE report_type   AS ENUM ('blood_work', 'imaging', 'pathology', 'prescription', 'other');
CREATE TYPE queue_status  AS ENUM ('pending', 'approved', 'rejected', 'needs_fix');

-- ─── 1. REPORT UPLOADS (Privacy-First) ─────────────────────
-- Zero-PII storage: files encrypted at rest, auto-deleted after 24h.
-- Linked by anonymous session_hash, NOT user accounts.
CREATE TABLE report_uploads (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_hash    VARCHAR(64) NOT NULL,         -- SHA-256 of session ID
  file_path       VARCHAR(500) NOT NULL,        -- encrypted file on disk
  file_type       report_type NOT NULL DEFAULT 'other',
  file_size_bytes INT,
  mime_type       VARCHAR(100),
  ocr_text        TEXT,                          -- extracted text (PII-stripped)
  is_sanitized    BOOLEAN DEFAULT false,
  encryption_iv   VARCHAR(64),                   -- AES-256 IV for decryption
  expires_at      TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_upload_session  ON report_uploads(session_hash);
CREATE INDEX idx_upload_expires  ON report_uploads(expires_at);

-- ─── 2. ANALYSIS RESULTS ───────────────────────────────────
-- Structured output from the AI pipeline including confidence scores.
CREATE TABLE analysis_results (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  upload_id         UUID NOT NULL REFERENCES report_uploads(id) ON DELETE CASCADE,
  session_hash      VARCHAR(64) NOT NULL,

  -- Clinical extraction
  primary_indicators JSONB NOT NULL DEFAULT '[]',
  -- e.g. [{"name": "Elevated Creatinine", "value": "2.8 mg/dL", "normal_range": "0.7-1.3", "severity": "high"}]

  specialty_required VARCHAR(100),               -- mapped to medical_conditions.specialist_type
  condition_slug     VARCHAR(255),               -- matched condition
  urgency_level      urgency_level DEFAULT 'routine',

  -- Dossier content
  plain_english      TEXT,                        -- "What this report says in plain English"
  questions_to_ask   JSONB DEFAULT '[]',          -- 3 specific questions
  lifestyle_factors  JSONB DEFAULT '[]',          -- lifestyle discussion points
  full_dossier       JSONB DEFAULT '{}',          -- complete structured dossier

  -- Confidence & QA
  confidence_score   DECIMAL(4,2) NOT NULL DEFAULT 0, -- 0.00 to 1.00
  needs_review       BOOLEAN DEFAULT false,       -- flagged if confidence < 0.80
  reviewed_by        VARCHAR(255),                -- admin who reviewed
  reviewed_at        TIMESTAMPTZ,
  review_notes       TEXT,

  -- Matched doctors
  matched_doctor_ids INT[] DEFAULT '{}',
  match_geography_id INT REFERENCES geographies(id),

  -- Meta
  model_used         VARCHAR(100),
  token_count        INT,
  processing_time_ms INT,
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analysis_session    ON analysis_results(session_hash);
CREATE INDEX idx_analysis_review     ON analysis_results(needs_review) WHERE needs_review = true;
CREATE INDEX idx_analysis_confidence ON analysis_results(confidence_score);
CREATE INDEX idx_analysis_condition  ON analysis_results(condition_slug);

-- ─── 3. HEALTH TIMELINES (Longitudinal Tracking) ───────────
-- Links multiple analysis results for trend detection.
-- Anonymous: uses session_hash only, no PII.
CREATE TABLE health_timelines (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_hash    VARCHAR(64) NOT NULL,
  analysis_id     UUID NOT NULL REFERENCES analysis_results(id) ON DELETE CASCADE,
  indicator_name  VARCHAR(255) NOT NULL,         -- e.g. "Cholesterol (LDL)"
  indicator_value DECIMAL(10,2),
  indicator_unit  VARCHAR(50),                   -- e.g. "mg/dL"
  recorded_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  trend_direction VARCHAR(20),                   -- 'improving', 'worsening', 'stable'
  trend_percent   DECIMAL(5,2),                  -- e.g. -10.5 (dropped 10.5%)
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_timeline_session    ON health_timelines(session_hash);
CREATE INDEX idx_timeline_indicator  ON health_timelines(session_hash, indicator_name);
CREATE INDEX idx_timeline_date       ON health_timelines(recorded_date);

-- ─── 4. WAITING TIME REPORTS (Crowdsourced E-E-A-T) ────────
CREATE TABLE waiting_time_reports (
  id              SERIAL PRIMARY KEY,
  doctor_id       INT NOT NULL REFERENCES doctors_providers(id) ON DELETE CASCADE,
  geography_id    INT REFERENCES geographies(id),
  wait_minutes    INT NOT NULL CHECK (wait_minutes >= 0 AND wait_minutes <= 480),
  visit_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  visit_type      VARCHAR(50) DEFAULT 'in-person',  -- 'in-person', 'video', 'phone'
  session_hash    VARCHAR(64),                   -- anonymous reporter
  is_verified     BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_wait_doctor ON waiting_time_reports(doctor_id);
CREATE INDEX idx_wait_date   ON waiting_time_reports(visit_date);

-- ─── 5. PROMPT LAB (CMS) ───────────────────────────────────
-- Test AI prompts against sample reports without redeployment.
CREATE TABLE prompt_lab_entries (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt_name     VARCHAR(255) NOT NULL,
  prompt_type     VARCHAR(100) NOT NULL DEFAULT 'clinical_extraction',
  -- 'clinical_extraction', 'dossier_generation', 'translation', 'content_generation'
  system_prompt   TEXT NOT NULL,
  sample_input    TEXT,
  expected_output JSONB,
  actual_output   JSONB,
  model_used      VARCHAR(100),
  token_count     INT,
  latency_ms      INT,
  score           DECIMAL(4,2),                  -- admin-rated quality (0-1)
  is_active       BOOLEAN DEFAULT false,         -- only one active per type
  created_by      VARCHAR(255),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_prompt_type   ON prompt_lab_entries(prompt_type);
CREATE INDEX idx_prompt_active ON prompt_lab_entries(prompt_type, is_active)
  WHERE is_active = true;

-- ─── 6. TRANSLATION QUEUE ──────────────────────────────────
-- Side-by-side master (English) vs AI translation for human review.
CREATE TABLE translation_queue (
  id                  SERIAL PRIMARY KEY,
  localized_content_id INT NOT NULL REFERENCES localized_content(id) ON DELETE CASCADE,
  source_language     VARCHAR(5) NOT NULL DEFAULT 'en',
  target_language     VARCHAR(5) NOT NULL REFERENCES languages(code),
  master_text         TEXT NOT NULL,              -- English original
  translated_text     TEXT NOT NULL,              -- AI translation
  corrected_text      TEXT,                       -- Human-fixed version
  status              queue_status DEFAULT 'pending',
  reviewed_by         VARCHAR(255),
  reviewed_at         TIMESTAMPTZ,
  ai_model_used       VARCHAR(100),
  quality_score       DECIMAL(4,2),               -- AI self-assessed quality
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_translation_status ON translation_queue(status);
CREATE INDEX idx_translation_lang   ON translation_queue(target_language);

-- ─── 7. SEASONAL TRIGGERS ──────────────────────────────────
-- Auto-highlight conditions based on environmental data.
CREATE TABLE seasonal_triggers (
  id                SERIAL PRIMARY KEY,
  geography_id      INT NOT NULL REFERENCES geographies(id) ON DELETE CASCADE,
  condition_id      INT NOT NULL REFERENCES medical_conditions(id) ON DELETE CASCADE,
  trigger_type      VARCHAR(50) NOT NULL,        -- 'aqi', 'flu_season', 'monsoon', 'heat_wave', 'cold_wave'
  trigger_threshold JSONB NOT NULL DEFAULT '{}',
  -- e.g. {"metric": "aqi", "operator": ">=", "value": 200}
  highlight_message TEXT,                        -- "Air quality alert: Respiratory specialists recommended"
  specialist_type   VARCHAR(100),
  is_active         BOOLEAN DEFAULT true,
  season_start      VARCHAR(5),                  -- "11-01" (Nov 1)
  season_end        VARCHAR(5),                  -- "02-28" (Feb 28)
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(geography_id, condition_id, trigger_type)
);

CREATE INDEX idx_seasonal_geo    ON seasonal_triggers(geography_id);
CREATE INDEX idx_seasonal_active ON seasonal_triggers(is_active) WHERE is_active = true;

-- ─── 8. Auto-cleanup: Delete expired uploads ────────────────
-- Schedule as a cron job: runs every hour, deletes expired files.
CREATE OR REPLACE FUNCTION cleanup_expired_uploads()
RETURNS INT AS $$
DECLARE
  deleted_count INT;
BEGIN
  WITH deleted AS (
    DELETE FROM report_uploads
    WHERE expires_at < NOW()
    RETURNING id
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ─── 9. Seed seasonal triggers ──────────────────────────────

-- Delhi: AQI-based respiratory alert
INSERT INTO seasonal_triggers (geography_id, condition_id, trigger_type, trigger_threshold, highlight_message, specialist_type, season_start, season_end) VALUES
  (2, 5, 'aqi', '{"metric": "aqi", "operator": ">=", "value": 200}',
   'Delhi air quality is hazardous. Consult a pulmonologist if experiencing breathing difficulty.',
   'Pulmonologist', '10-15', '02-28');

-- London: Flu season
INSERT INTO seasonal_triggers (geography_id, condition_id, trigger_type, trigger_threshold, highlight_message, specialist_type, season_start, season_end) VALUES
  (15, 2, 'flu_season', '{"metric": "flu_index", "operator": ">=", "value": 3}',
   'Flu season is active in London. Visit a GP if symptoms persist beyond 3 days.',
   'General Practitioner', '11-01', '03-31');

-- ─── 10. Seed prompt lab with default clinical prompt ───────
INSERT INTO prompt_lab_entries (prompt_name, prompt_type, system_prompt, is_active, created_by) VALUES
(
  'Clinical Extraction v1',
  'clinical_extraction',
  'You are a medical report analysis assistant for aihealz.com. You are NOT a doctor. You provide INFORMATIONAL summaries only, NEVER diagnoses.

TASK: Analyze the provided medical report text and extract structured data.

OUTPUT FORMAT (JSON):
{
  "primary_indicators": [
    {"name": "indicator name", "value": "measured value", "normal_range": "expected range", "severity": "normal|borderline|high|critical"}
  ],
  "specialty_required": "specialist type (e.g., Nephrologist, Orthopedic Surgeon)",
  "condition_slug": "mapped-condition-slug",
  "urgency_level": "routine|urgent|emergency",
  "confidence_score": 0.85,
  "plain_english": "A 2-3 sentence summary of what this report means in simple language",
  "questions_to_ask": ["question 1", "question 2", "question 3"],
  "lifestyle_factors": ["factor 1", "factor 2", "factor 3"]
}

RULES:
1. NEVER provide a diagnosis. Use phrases like "This may indicate..." or "Your doctor should evaluate..."
2. Map findings to medical specialties accurately.
3. Set urgency to "emergency" ONLY for immediately life-threatening values.
4. Confidence score: 1.0 = all values clearly extractable, 0.5 = partial/ambiguous, <0.5 = insufficient data.
5. Questions should be specific to the findings, not generic.
6. Lifestyle factors should be actionable and culturally sensitive.',
  true,
  'system'
),
(
  'Dossier Generation v1',
  'dossier_generation',
  'You are a patient communication specialist for aihealz.com. Generate a clear, empathetic "Pre-Consultation Dossier" from the clinical extraction data.

TONE: Warm, reassuring, professional. Avoid medical jargon. No emojis.

SECTIONS:
1. "What Your Report Shows" — 3-4 sentences, plain language, no technical terms.
2. "Questions for Your Doctor" — 3 specific, personalized questions based on the findings.
3. "Lifestyle Considerations" — 3 actionable suggestions tied to the findings.
4. "What to Expect at Your Visit" — Brief description of what the specialist will likely do.

RULES:
1. NEVER say "you have [condition]." Say "your results suggest your doctor should check for..."
2. Include the normal range context: "Your [X] is [value], while the typical range is [range]."
3. Be culturally aware — avoid Western-centric dietary advice.
4. End with: "This summary is for informational purposes only and does not replace professional medical advice."',
  true,
  'system'
);
