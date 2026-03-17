-- ============================================================
-- aihealz.com — Health Vault & Communication Bridge
-- Vault storage, encounters, chat, notifications
-- Run AFTER 001-007
-- ============================================================

-- ─── ENUMS ──────────────────────────────────────────────────
CREATE TYPE encounter_status AS ENUM ('pending', 'accepted', 'in_progress', 'completed', 'declined', 'expired');
CREATE TYPE message_type     AS ENUM ('text', 'file', 'system', 'ai_summary', 'translation');
CREATE TYPE notification_type AS ENUM ('smart_match', 'enquiry', 'chat', 'report_ready', 'badge_earned');

-- ─── 1. HEALTH VAULT (User Cloud Storage) ──────────────────
CREATE TABLE health_vaults (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_hash     VARCHAR(64) NOT NULL UNIQUE,
  country_code     VARCHAR(5),
  drive_folder_id  VARCHAR(255),                    -- Google Drive folder ID
  drive_folder_path VARCHAR(500),                   -- /aihealz_Vault/{Country}/{UserHash}
  storage_used_bytes BIGINT DEFAULT 0,
  max_storage_bytes  BIGINT DEFAULT 524288000,      -- 500MB default
  encryption_key_hash VARCHAR(128),                 -- Client-side encryption key hash
  is_active        BOOLEAN DEFAULT true,
  last_accessed    TIMESTAMPTZ DEFAULT NOW(),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vault_session ON health_vaults(session_hash);

-- ─── 2. VAULT FILES ────────────────────────────────────────
CREATE TABLE vault_files (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vault_id         UUID NOT NULL REFERENCES health_vaults(id) ON DELETE CASCADE,
  file_name        VARCHAR(500) NOT NULL,
  file_type        report_type DEFAULT 'other',
  mime_type        VARCHAR(100),
  file_size_bytes  INT,
  drive_file_id    VARCHAR(255),                    -- Google Drive file ID
  drive_web_link   VARCHAR(1000),
  thumbnail_url    VARCHAR(1000),

  -- AI processing
  analysis_id      UUID REFERENCES analysis_results(id),
  ai_summary       TEXT,                            -- LLM-simplified version
  ocr_text         TEXT,
  is_processed     BOOLEAN DEFAULT false,

  -- Access control
  shared_with_doctors INT[] DEFAULT '{}',            -- Doctor IDs with temp access
  access_expires_at   TIMESTAMPTZ,
  is_archived      BOOLEAN DEFAULT false,
  upload_date      TIMESTAMPTZ DEFAULT NOW(),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vfile_vault ON vault_files(vault_id);
CREATE INDEX idx_vfile_analysis ON vault_files(analysis_id);

-- ─── 3. ENCOUNTERS (Patient-Doctor Interaction) ────────────
CREATE TABLE encounters (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_hash     VARCHAR(64) NOT NULL,
  doctor_id        INT NOT NULL REFERENCES doctors_providers(id) ON DELETE CASCADE,
  vault_id         UUID REFERENCES health_vaults(id),
  analysis_id      UUID REFERENCES analysis_results(id),
  lead_log_id      UUID REFERENCES lead_logs(id),

  -- Context
  condition_slug   VARCHAR(255),
  geography_id     INT REFERENCES geographies(id),
  enquiry_type     VARCHAR(50) DEFAULT 'opinion',   -- 'opinion', 'consultation', 'referral'
  urgency          urgency_level DEFAULT 'routine',
  patient_language VARCHAR(5) DEFAULT 'en',
  doctor_language  VARCHAR(5) DEFAULT 'en',

  -- Status
  status           encounter_status DEFAULT 'pending',
  case_dossier     JSONB DEFAULT '{}',              -- AI-generated case summary for doctor
  doctor_notes     TEXT,
  doctor_opinion   TEXT,
  ai_second_opinion TEXT,

  -- Timing
  responded_at     TIMESTAMPTZ,
  completed_at     TIMESTAMPTZ,
  expires_at       TIMESTAMPTZ,
  response_time_ms INT,                             -- For CMS monitoring

  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_encounter_session ON encounters(session_hash);
CREATE INDEX idx_encounter_doctor  ON encounters(doctor_id);
CREATE INDEX idx_encounter_status  ON encounters(status);
CREATE INDEX idx_encounter_pending ON encounters(doctor_id, status) WHERE status = 'pending';

-- ─── 4. CHAT MESSAGES ──────────────────────────────────────
CREATE TABLE chat_messages (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  encounter_id      UUID NOT NULL REFERENCES encounters(id) ON DELETE CASCADE,
  sender_type       VARCHAR(20) NOT NULL,            -- 'patient', 'doctor', 'ai', 'system'
  sender_id         VARCHAR(100),                    -- session_hash or doctor_id

  -- Content
  content           TEXT NOT NULL,
  content_type      message_type DEFAULT 'text',
  file_url          VARCHAR(1000),

  -- Translation overlay
  original_language VARCHAR(5),
  translated_text   TEXT,
  translated_to     VARCHAR(5),
  translation_model VARCHAR(100),

  -- Meta
  is_read           BOOLEAN DEFAULT false,
  read_at           TIMESTAMPTZ,
  is_deleted        BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_encounter ON chat_messages(encounter_id);
CREATE INDEX idx_chat_unread    ON chat_messages(encounter_id, is_read) WHERE is_read = false;

-- ─── 5. SMART MATCH NOTIFICATIONS ─────────────────────────
CREATE TABLE smart_match_notifications (
  id                SERIAL PRIMARY KEY,
  session_hash      VARCHAR(64) NOT NULL,
  doctor_id         INT NOT NULL REFERENCES doctors_providers(id),
  condition_slug    VARCHAR(255),
  geography_id      INT REFERENCES geographies(id),
  notification_type notification_type DEFAULT 'smart_match',
  title             VARCHAR(500),
  message           TEXT,
  is_sent           BOOLEAN DEFAULT false,
  is_read           BOOLEAN DEFAULT false,
  sent_at           TIMESTAMPTZ,
  read_at           TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_smartmatch_session ON smart_match_notifications(session_hash);

-- ─── 6. ENQUIRY LOGS (CMS Monitoring) ─────────────────────
CREATE TABLE enquiry_logs (
  id                  SERIAL PRIMARY KEY,
  encounter_id        UUID REFERENCES encounters(id),
  geography_id        INT REFERENCES geographies(id),
  condition_slug      VARCHAR(255),
  doctor_tier         subscription_tier,
  response_time_ms    INT,
  ai_confidence_score DECIMAL(4,2),
  outcome             VARCHAR(50),                  -- 'converted', 'expired', 'declined'
  revenue_generated   DECIMAL(10,2) DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_enqlog_geo ON enquiry_logs(geography_id);
CREATE INDEX idx_enqlog_date ON enquiry_logs(created_at);
