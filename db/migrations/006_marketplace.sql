-- ============================================================
-- aihealz.com — Global Provider Marketplace
-- Subscriptions, leads, onboarding, verification, teleconsult
-- Run AFTER 001-005
-- ============================================================

-- ─── ENUMS ──────────────────────────────────────────────────
CREATE TYPE subscription_status AS ENUM ('trial', 'active', 'past_due', 'cancelled', 'expired');
CREATE TYPE onboarding_status   AS ENUM ('pending', 'in_progress', 'completed', 'abandoned');
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected', 'inconclusive', 'expired');
CREATE TYPE lead_intent         AS ENUM ('high', 'medium', 'low');
CREATE TYPE teleconsult_status  AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show');

-- ─── 1. SUBSCRIPTION PLANS (Dynamic Pricing) ───────────────
CREATE TABLE subscription_plans (
  id               SERIAL PRIMARY KEY,
  plan_name        VARCHAR(100) NOT NULL,          -- 'Free', 'Premium', 'Enterprise'
  plan_slug        VARCHAR(50) NOT NULL UNIQUE,    -- 'free', 'premium', 'enterprise'
  tier             subscription_tier NOT NULL,

  -- Limits
  max_conditions   INT NOT NULL DEFAULT 2,          -- Free=2, Premium=15, Enterprise=1000
  max_lead_credits INT NOT NULL DEFAULT 0,          -- Monthly lead reveal credits
  has_ai_bio       BOOLEAN DEFAULT false,
  has_lead_scoring BOOLEAN DEFAULT false,
  has_telelink     BOOLEAN DEFAULT false,
  has_priority_listing BOOLEAN DEFAULT false,
  has_analytics    BOOLEAN DEFAULT false,

  -- Base pricing (USD)
  base_price_usd   DECIMAL(10,2) NOT NULL DEFAULT 0,
  billing_interval VARCHAR(20) DEFAULT 'monthly',   -- 'monthly', 'yearly'

  -- Stripe
  stripe_price_id  VARCHAR(255),                    -- Stripe Price ID (prod)
  stripe_price_id_test VARCHAR(255),                -- Stripe Price ID (test)

  is_active        BOOLEAN DEFAULT true,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 2. REGIONAL PRICING ───────────────────────────────────
-- Dynamic pricing per country so $99 USD = ₹2000 INR = £79 GBP
CREATE TABLE regional_pricing (
  id              SERIAL PRIMARY KEY,
  plan_id         INT NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
  country_code    VARCHAR(5) NOT NULL,              -- 'IN', 'US', 'GB'
  currency        VARCHAR(3) NOT NULL,              -- 'INR', 'USD', 'GBP'
  price           DECIMAL(10,2) NOT NULL,
  stripe_price_id VARCHAR(255),
  is_active       BOOLEAN DEFAULT true,
  UNIQUE(plan_id, country_code)
);

-- ─── 3. PROVIDER SUBSCRIPTIONS ─────────────────────────────
CREATE TABLE provider_subscriptions (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id           INT NOT NULL REFERENCES doctors_providers(id) ON DELETE CASCADE,
  plan_id             INT NOT NULL REFERENCES subscription_plans(id),
  status              subscription_status DEFAULT 'trial',

  -- Billing
  stripe_customer_id  VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  current_period_start TIMESTAMPTZ,
  current_period_end   TIMESTAMPTZ,
  trial_ends_at       TIMESTAMPTZ,
  cancelled_at        TIMESTAMPTZ,

  -- Usage
  conditions_used     INT DEFAULT 0,
  lead_credits_used   INT DEFAULT 0,
  lead_credits_total  INT DEFAULT 0,

  -- Meta
  country_code        VARCHAR(5),
  currency            VARCHAR(3) DEFAULT 'USD',
  amount_paid         DECIMAL(10,2) DEFAULT 0,
  tax_amount          DECIMAL(10,2) DEFAULT 0,
  tax_type            VARCHAR(20),                  -- 'VAT', 'GST', 'Sales Tax'

  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(doctor_id)
);

CREATE INDEX idx_sub_doctor ON provider_subscriptions(doctor_id);
CREATE INDEX idx_sub_status ON provider_subscriptions(status);
CREATE INDEX idx_sub_stripe ON provider_subscriptions(stripe_customer_id);

-- ─── 4. ONBOARDING STEPS ───────────────────────────────────
CREATE TABLE onboarding_steps (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id       INT NOT NULL REFERENCES doctors_providers(id) ON DELETE CASCADE,
  status          onboarding_status DEFAULT 'pending',

  -- Step completion
  step_profile    BOOLEAN DEFAULT false,            -- Basic profile + geo
  step_license    BOOLEAN DEFAULT false,            -- License verification
  step_bio        BOOLEAN DEFAULT false,            -- AI bio generated
  step_conditions BOOLEAN DEFAULT false,            -- Conditions selected
  step_subscription BOOLEAN DEFAULT false,          -- Plan selected
  current_step    INT DEFAULT 1,                    -- 1-5

  -- Data
  raw_bio_input   TEXT,                             -- Doctor's raw bio text
  ai_enhanced_bio TEXT,                             -- LLM-beautified bio
  selected_conditions INT[] DEFAULT '{}',

  started_at      TIMESTAMPTZ DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_onboard_doctor ON onboarding_steps(doctor_id);

-- ─── 5. LICENSE VERIFICATIONS ──────────────────────────────
CREATE TABLE license_verifications (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id         INT NOT NULL REFERENCES doctors_providers(id) ON DELETE CASCADE,
  registry_type     VARCHAR(50) NOT NULL,           -- 'NPI', 'NMC', 'GMC', 'HPCSA', 'manual'
  license_number    VARCHAR(100) NOT NULL,
  country_code      VARCHAR(5) NOT NULL,
  status            verification_status DEFAULT 'pending',

  -- API response
  api_response      JSONB DEFAULT '{}',
  verified_name     VARCHAR(500),                   -- Name from registry
  verified_specialty VARCHAR(200),
  verified_status   VARCHAR(100),                   -- 'Active', 'Expired', etc.
  match_confidence  DECIMAL(4,2),                   -- 0.00-1.00 name match

  -- Admin review
  reviewed_by       VARCHAR(255),
  reviewed_at       TIMESTAMPTZ,
  review_notes      TEXT,
  rejection_reason  TEXT,

  verified_at       TIMESTAMPTZ,
  expires_at        TIMESTAMPTZ,                    -- Re-verification date
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_verify_doctor ON license_verifications(doctor_id);
CREATE INDEX idx_verify_status ON license_verifications(status);
CREATE INDEX idx_verify_pending ON license_verifications(status) WHERE status = 'pending';

-- ─── 6. LEAD LOGS ──────────────────────────────────────────
CREATE TABLE lead_logs (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id         INT NOT NULL REFERENCES doctors_providers(id) ON DELETE CASCADE,
  analysis_id       UUID REFERENCES analysis_results(id),
  session_hash      VARCHAR(64),

  -- Lead data (anonymized until contact reveal)
  condition_slug    VARCHAR(255),
  specialty_matched VARCHAR(100),
  geography_id      INT REFERENCES geographies(id),

  -- AI scoring
  intent_level      lead_intent DEFAULT 'medium',
  intent_score      DECIMAL(4,2) DEFAULT 0.5,       -- 0.00-1.00
  scoring_factors   JSONB DEFAULT '{}',
  -- e.g. {"has_report": true, "urgency": "urgent", "seeking_specialist": true, "has_insurance": null}

  -- Status
  is_viewed         BOOLEAN DEFAULT false,
  viewed_at         TIMESTAMPTZ,
  is_contacted      BOOLEAN DEFAULT false,
  contacted_at      TIMESTAMPTZ,
  contact_revealed  BOOLEAN DEFAULT false,          -- Lead credit spent
  credits_spent     INT DEFAULT 0,

  -- Outcome
  outcome           VARCHAR(50),                    -- 'booked', 'no_response', 'not_interested'
  outcome_notes     TEXT,

  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lead_doctor    ON lead_logs(doctor_id);
CREATE INDEX idx_lead_intent    ON lead_logs(intent_level);
CREATE INDEX idx_lead_condition ON lead_logs(condition_slug);
CREATE INDEX idx_lead_unviewed  ON lead_logs(doctor_id, is_viewed) WHERE is_viewed = false;

-- ─── 7. LEAD CREDITS ───────────────────────────────────────
CREATE TABLE lead_credits (
  id              SERIAL PRIMARY KEY,
  doctor_id       INT NOT NULL REFERENCES doctors_providers(id) ON DELETE CASCADE,
  transaction_type VARCHAR(20) NOT NULL,            -- 'grant', 'spend', 'refund', 'expire'
  amount          INT NOT NULL,                     -- positive=credit, negative=debit
  balance_after   INT NOT NULL DEFAULT 0,
  lead_log_id     UUID REFERENCES lead_logs(id),
  description     VARCHAR(255),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_credit_doctor ON lead_credits(doctor_id);

-- ─── 8. PROVIDER ANALYTICS ─────────────────────────────────
CREATE TABLE provider_analytics (
  id                  SERIAL PRIMARY KEY,
  doctor_id           INT NOT NULL REFERENCES doctors_providers(id) ON DELETE CASCADE,
  date                DATE NOT NULL DEFAULT CURRENT_DATE,
  profile_views       INT DEFAULT 0,
  search_appearances  INT DEFAULT 0,                -- Times appeared in condition pages
  condition_slug      VARCHAR(255),                 -- Which condition page
  geography_id        INT REFERENCES geographies(id),
  lead_count          INT DEFAULT 0,
  contact_reveals     INT DEFAULT 0,
  teleconsult_count   INT DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(doctor_id, date, condition_slug)
);

CREATE INDEX idx_panalytics_doctor ON provider_analytics(doctor_id);
CREATE INDEX idx_panalytics_date   ON provider_analytics(date);

-- ─── 9. TELECONSULTATIONS ──────────────────────────────────
CREATE TABLE teleconsultations (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id         INT NOT NULL REFERENCES doctors_providers(id) ON DELETE CASCADE,
  lead_log_id       UUID REFERENCES lead_logs(id),
  session_hash      VARCHAR(64),

  -- Scheduling
  scheduled_at      TIMESTAMPTZ NOT NULL,
  duration_minutes  INT DEFAULT 15,
  status            teleconsult_status DEFAULT 'scheduled',

  -- Video provider
  video_provider    VARCHAR(50) DEFAULT 'daily',    -- 'daily', 'agora', 'jitsi'
  room_url          VARCHAR(500),
  room_token        TEXT,

  -- Billing
  consultation_fee  DECIMAL(10,2) DEFAULT 0,
  platform_fee      DECIMAL(10,2) DEFAULT 0,         -- aihealz convenience fee
  currency          VARCHAR(3) DEFAULT 'USD',
  is_paid           BOOLEAN DEFAULT false,
  stripe_payment_id VARCHAR(255),

  -- Outcome
  started_at        TIMESTAMPTZ,
  ended_at          TIMESTAMPTZ,
  doctor_notes      TEXT,

  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_telecon_doctor   ON teleconsultations(doctor_id);
CREATE INDEX idx_telecon_schedule ON teleconsultations(scheduled_at);

-- ─── 10. TOP 1% BADGE SCORES ──────────────────────────────
-- Calculated weekly via cron; stored for fast lookups
ALTER TABLE doctors_providers
  ADD COLUMN IF NOT EXISTS badge_score    DECIMAL(5,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS badge_rank     INT,
  ADD COLUMN IF NOT EXISTS badge_label    VARCHAR(50),         -- 'Top 1%', 'Top 5%', 'Rising'
  ADD COLUMN IF NOT EXISTS badge_city_id  INT REFERENCES geographies(id),
  ADD COLUMN IF NOT EXISTS badge_updated  TIMESTAMPTZ;

-- ─── 11. Seed Subscription Plans ────────────────────────────

INSERT INTO subscription_plans (plan_name, plan_slug, tier, max_conditions, max_lead_credits, has_ai_bio, has_lead_scoring, has_telelink, has_priority_listing, has_analytics, base_price_usd, billing_interval) VALUES
  ('Free',       'free',       'free',       2,    0,   false, false, false, false, false, 0,      'monthly'),
  ('Premium',    'premium',    'premium',    15,   50,  true,  true,  true,  true,  true,  99.00,  'monthly'),
  ('Enterprise', 'enterprise', 'enterprise', 1000, 500, true,  true,  true,  true,  true,  499.00, 'monthly'),
  ('Premium Annual', 'premium-annual', 'premium', 15, 600, true, true, true, true, true, 990.00, 'yearly');

-- Regional pricing
INSERT INTO regional_pricing (plan_id, country_code, currency, price) VALUES
  -- Premium monthly
  (2, 'IN', 'INR', 2000.00),
  (2, 'GB', 'GBP', 79.00),
  (2, 'NG', 'NGN', 25000.00),
  (2, 'KE', 'KES', 5000.00),
  (2, 'ZA', 'ZAR', 1500.00),
  (2, 'AE', 'AED', 350.00),
  (2, 'DE', 'EUR', 89.00),
  -- Enterprise monthly
  (3, 'IN', 'INR', 10000.00),
  (3, 'GB', 'GBP', 399.00),
  (3, 'NG', 'NGN', 120000.00),
  (3, 'DE', 'EUR', 449.00);

-- ─── 12. Condition Locking Trigger ──────────────────────────
-- Enforces max conditions per subscription tier

CREATE OR REPLACE FUNCTION enforce_condition_limit()
RETURNS TRIGGER AS $$
DECLARE
  current_count INT;
  max_allowed INT;
  doctor_tier subscription_tier;
BEGIN
  -- Get the doctor's tier
  SELECT subscription_tier INTO doctor_tier
  FROM doctors_providers WHERE id = NEW.doctor_id;

  -- Get the max allowed from their active subscription (or plan defaults)
  SELECT COALESCE(sp.max_conditions, 
    CASE doctor_tier
      WHEN 'free' THEN 2
      WHEN 'premium' THEN 15
      WHEN 'enterprise' THEN 1000
    END)
  INTO max_allowed
  FROM provider_subscriptions ps
  JOIN subscription_plans sp ON ps.plan_id = sp.id
  WHERE ps.doctor_id = NEW.doctor_id AND ps.status IN ('active', 'trial')
  LIMIT 1;

  -- Fallback to tier defaults
  IF max_allowed IS NULL THEN
    max_allowed := CASE doctor_tier
      WHEN 'free' THEN 2
      WHEN 'premium' THEN 15
      WHEN 'enterprise' THEN 1000
    END;
  END IF;

  -- Count current specialties
  SELECT COUNT(*) INTO current_count
  FROM doctor_specialties WHERE doctor_id = NEW.doctor_id;

  IF current_count >= max_allowed THEN
    RAISE EXCEPTION 'Condition limit reached (% of %). Upgrade your plan to add more conditions.', current_count, max_allowed;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Replace existing trigger if it exists
DROP TRIGGER IF EXISTS check_specialty_limit ON doctor_specialties;
CREATE TRIGGER check_specialty_limit
  BEFORE INSERT ON doctor_specialties
  FOR EACH ROW EXECUTE FUNCTION enforce_condition_limit();

-- ─── 13. Badge Score Calculator ─────────────────────────────
-- Run weekly via cron to recalculate Top 1% badges

CREATE OR REPLACE FUNCTION calculate_badge_scores()
RETURNS void AS $$
BEGIN
  -- Score = weighted sum of: profile completeness, rating, reviews, response rate, lead outcomes
  UPDATE doctors_providers d SET
    badge_score = (
      -- Profile completeness (0-25)
      (CASE WHEN d.bio IS NOT NULL AND LENGTH(d.bio) > 100 THEN 10 ELSE 0 END) +
      (CASE WHEN d.profile_image IS NOT NULL THEN 5 ELSE 0 END) +
      (CASE WHEN d.qualifications IS NOT NULL AND array_length(d.qualifications, 1) > 0 THEN 5 ELSE 0 END) +
      (CASE WHEN d.contact_info != '{}' THEN 5 ELSE 0 END) +
      -- Rating (0-25)
      COALESCE(d.rating * 5, 0) +
      -- Reviews (0-25, logarithmic)
      LEAST(LOG(GREATEST(d.review_count, 1) + 1) * 10, 25) +
      -- Lead outcomes (0-25)
      COALESCE((
        SELECT LEAST(COUNT(*) * 5, 25)
        FROM lead_logs l
        WHERE l.doctor_id = d.id AND l.outcome = 'booked' AND l.created_at > NOW() - INTERVAL '90 days'
      ), 0)
    ),
    badge_updated = NOW()
  WHERE d.is_verified = true;

  -- Assign ranks per city
  WITH ranked AS (
    SELECT id, geography_id,
           PERCENT_RANK() OVER (PARTITION BY geography_id ORDER BY badge_score DESC) as pct_rank
    FROM doctors_providers
    WHERE is_verified = true AND geography_id IS NOT NULL
  )
  UPDATE doctors_providers d SET
    badge_rank = CASE
      WHEN r.pct_rank <= 0.01 THEN 1
      WHEN r.pct_rank <= 0.05 THEN 5
      WHEN r.pct_rank <= 0.10 THEN 10
      ELSE NULL
    END,
    badge_label = CASE
      WHEN r.pct_rank <= 0.01 THEN 'Top 1%'
      WHEN r.pct_rank <= 0.05 THEN 'Top 5%'
      WHEN r.pct_rank <= 0.10 THEN 'Rising'
      ELSE NULL
    END,
    badge_city_id = r.geography_id
  FROM ranked r
  WHERE d.id = r.id;
END;
$$ LANGUAGE plpgsql;
