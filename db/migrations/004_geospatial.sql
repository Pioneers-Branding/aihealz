-- ============================================================
-- aihealz.com — Geospatial Intelligence Layer
-- PostGIS + locale_config + pinned conditions + analytics
-- Run AFTER 001, 002, 003
-- ============================================================

-- ─── 1. PostGIS Extension ───────────────────────────────────
CREATE EXTENSION IF NOT EXISTS postgis;

-- ─── 2. Expand geo_level enum with 'continent' ─────────────
ALTER TYPE geo_level ADD VALUE IF NOT EXISTS 'continent' BEFORE 'country';

-- ─── 3. Enhance geographies table ──────────────────────────
-- Add PostGIS geography column for radius searches
ALTER TABLE geographies
  ADD COLUMN IF NOT EXISTS coordinates  GEOGRAPHY(Point, 4326),
  ADD COLUMN IF NOT EXISTS iso_code     VARCHAR(5),        -- ISO 3166-1: 'IN', 'KE', 'US'
  ADD COLUMN IF NOT EXISTS locale_config JSONB DEFAULT '{}';

-- locale_config structure:
-- {
--   "currency": "INR",
--   "currency_symbol": "₹",
--   "date_format": "DD/MM/YYYY",
--   "measurement": "metric",
--   "primary_languages": ["en", "hi"],
--   "prevalent_conditions": ["back-pain", "diabetes-type-2", "hypertension"],
--   "emergency_number": "112",
--   "healthcare_system": "Mixed (Public + Private)"
-- }

-- Populate coordinates from existing lat/lng data
UPDATE geographies
SET coordinates = ST_SetSRID(ST_MakePoint(longitude::float, latitude::float), 4326)::geography
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- ─── 4. Pinned Conditions (Admin override per city) ────────
CREATE TABLE pinned_conditions (
  id              SERIAL PRIMARY KEY,
  geography_id    INT NOT NULL REFERENCES geographies(id) ON DELETE CASCADE,
  condition_id    INT NOT NULL REFERENCES medical_conditions(id) ON DELETE CASCADE,
  display_order   INT NOT NULL DEFAULT 0,
  pinned_by       VARCHAR(255),          -- admin username
  reason          TEXT,                   -- e.g. "Malaria is endemic in Lagos"
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(geography_id, condition_id)
);

CREATE INDEX idx_pinned_geo        ON pinned_conditions(geography_id);
CREATE INDEX idx_pinned_geo_active ON pinned_conditions(geography_id, is_active)
  WHERE is_active = true;
CREATE INDEX idx_pinned_order      ON pinned_conditions(geography_id, display_order);

-- ─── 5. Geo Analytics (User visit heatmap) ─────────────────
CREATE TABLE geo_analytics (
  id              SERIAL PRIMARY KEY,
  country_code    VARCHAR(5) NOT NULL,
  city_slug       VARCHAR(255),
  geography_id    INT REFERENCES geographies(id),
  visit_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  visit_count     INT NOT NULL DEFAULT 1,
  unique_visitors INT NOT NULL DEFAULT 1,
  top_conditions  VARCHAR(255)[],        -- most searched conditions that day
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(country_code, city_slug, visit_date)
);

-- Upsert-friendly: if same country+city+date exists, increment
CREATE INDEX idx_analytics_date    ON geo_analytics(visit_date);
CREATE INDEX idx_analytics_country ON geo_analytics(country_code);
CREATE INDEX idx_analytics_geo     ON geo_analytics(geography_id);

-- ─── 6. PostGIS Spatial Indexes ─────────────────────────────
CREATE INDEX idx_geo_coordinates ON geographies USING GIST(coordinates);
CREATE INDEX idx_geo_iso         ON geographies(iso_code);

-- ─── 7. Seed locale_config for existing geographies ────────

-- India
UPDATE geographies SET
  iso_code = 'IN',
  locale_config = '{
    "currency": "INR",
    "currency_symbol": "₹",
    "date_format": "DD/MM/YYYY",
    "measurement": "metric",
    "primary_languages": ["en", "hi"],
    "prevalent_conditions": ["diabetes-type-2", "hypertension", "back-pain"],
    "emergency_number": "112",
    "healthcare_system": "Mixed (Public + Private)"
  }'::jsonb
WHERE slug = 'india' AND level = 'country';

-- Delhi region
UPDATE geographies SET
  locale_config = '{
    "primary_languages": ["en", "hi"],
    "prevalent_conditions": ["back-pain", "hypertension", "migraine"],
    "local_factors": ["Air pollution (AQI frequently > 300)", "Extreme summer heat (45°C+)", "Dense population stress"],
    "top_hospitals": ["AIIMS", "Safdarjung Hospital", "Max Hospital"]
  }'::jsonb
WHERE slug = 'delhi' AND level = 'state';

UPDATE geographies SET
  locale_config = '{
    "primary_languages": ["en", "hi"],
    "prevalent_conditions": ["back-pain", "sciatica", "hypertension"],
    "local_factors": ["Sedentary IT workforce", "Long Metro commutes"],
    "top_hospitals": ["Max Super Specialty, Saket", "Apollo Hospital, Saket"]
  }'::jsonb
WHERE slug = 'saket' AND level = 'locality';

-- Chennai / T. Nagar
UPDATE geographies SET
  locale_config = '{
    "primary_languages": ["en", "ta"],
    "prevalent_conditions": ["kidney-stones", "diabetes-type-2", "hypertension"],
    "local_factors": ["Tropical heat causing dehydration", "High calcium dairy consumption"],
    "top_hospitals": ["Apollo Hospital", "Kauvery Hospital"]
  }'::jsonb
WHERE slug = 't-nagar' AND level = 'locality';

-- USA
UPDATE geographies SET
  iso_code = 'US',
  locale_config = '{
    "currency": "USD",
    "currency_symbol": "$",
    "date_format": "MM/DD/YYYY",
    "measurement": "imperial",
    "primary_languages": ["en", "es"],
    "prevalent_conditions": ["hypertension", "diabetes-type-2", "back-pain"],
    "emergency_number": "911",
    "healthcare_system": "Insurance-based (Private)"
  }'::jsonb
WHERE slug = 'usa' AND level = 'country';

-- Manhattan
UPDATE geographies SET
  locale_config = '{
    "primary_languages": ["en", "es"],
    "prevalent_conditions": ["hypertension", "migraine", "back-pain"],
    "local_factors": ["High-stress financial district lifestyle", "Cold winters", "Walkable city with high air quality variance"],
    "top_hospitals": ["Mount Sinai", "NYU Langone", "NewYork-Presbyterian"]
  }'::jsonb
WHERE slug = 'manhattan' AND level = 'locality';

-- UK
UPDATE geographies SET
  iso_code = 'GB',
  locale_config = '{
    "currency": "GBP",
    "currency_symbol": "£",
    "date_format": "DD/MM/YYYY",
    "measurement": "metric",
    "primary_languages": ["en"],
    "prevalent_conditions": ["back-pain", "migraine", "hypertension"],
    "emergency_number": "999",
    "healthcare_system": "NHS (Public)"
  }'::jsonb
WHERE slug = 'uk' AND level = 'country';

-- Nigeria
UPDATE geographies SET
  iso_code = 'NG',
  locale_config = '{
    "currency": "NGN",
    "currency_symbol": "₦",
    "date_format": "DD/MM/YYYY",
    "measurement": "metric",
    "primary_languages": ["en", "yo"],
    "prevalent_conditions": ["hypertension", "diabetes-type-2", "kidney-stones"],
    "emergency_number": "112",
    "healthcare_system": "Mixed (Limited Public, Growing Private)"
  }'::jsonb
WHERE slug = 'nigeria' AND level = 'country';

-- ─── 8. Seed coordinates for key cities ─────────────────────
UPDATE geographies SET coordinates = ST_SetSRID(ST_MakePoint(77.2090, 28.6139), 4326)::geography WHERE slug = 'new-delhi' AND level = 'city';
UPDATE geographies SET coordinates = ST_SetSRID(ST_MakePoint(77.2167, 28.5244), 4326)::geography WHERE slug = 'saket' AND level = 'locality';
UPDATE geographies SET coordinates = ST_SetSRID(ST_MakePoint(77.0266, 28.5921), 4326)::geography WHERE slug = 'dwarka' AND level = 'locality';
UPDATE geographies SET coordinates = ST_SetSRID(ST_MakePoint(80.2707, 13.0827), 4326)::geography WHERE slug = 'chennai' AND level = 'city';
UPDATE geographies SET coordinates = ST_SetSRID(ST_MakePoint(80.2342, 13.0418), 4326)::geography WHERE slug = 't-nagar' AND level = 'locality';
UPDATE geographies SET coordinates = ST_SetSRID(ST_MakePoint(72.8777, 19.0760), 4326)::geography WHERE slug = 'mumbai' AND level = 'city';
UPDATE geographies SET coordinates = ST_SetSRID(ST_MakePoint(72.8697, 19.1197), 4326)::geography WHERE slug = 'andheri' AND level = 'locality';
UPDATE geographies SET coordinates = ST_SetSRID(ST_MakePoint(-118.2437, 34.0522), 4326)::geography WHERE slug = 'los-angeles' AND level = 'city';
UPDATE geographies SET coordinates = ST_SetSRID(ST_MakePoint(-118.4003, 34.0736), 4326)::geography WHERE slug = 'beverly-hills' AND level = 'locality';
UPDATE geographies SET coordinates = ST_SetSRID(ST_MakePoint(-73.9857, 40.7484), 4326)::geography WHERE slug = 'new-york-city' AND level = 'city';
UPDATE geographies SET coordinates = ST_SetSRID(ST_MakePoint(-73.9712, 40.7831), 4326)::geography WHERE slug = 'manhattan' AND level = 'locality';
UPDATE geographies SET coordinates = ST_SetSRID(ST_MakePoint(-0.1278, 51.5074), 4326)::geography WHERE slug = 'london' AND level = 'city';
UPDATE geographies SET coordinates = ST_SetSRID(ST_MakePoint(3.3958, 6.4541), 4326)::geography WHERE slug = 'ikeja' AND level = 'city';

-- ─── 9. Seed pinned conditions ──────────────────────────────

-- Pin Malaria-related conditions for Nigerian cities (example with existing conditions)
-- In production you'd add a 'malaria' condition; for now pin hypertension as top concern
INSERT INTO pinned_conditions (geography_id, condition_id, display_order, pinned_by, reason) VALUES
  -- Delhi: Air pollution conditions
  (2, 5, 1, 'admin', 'Hypertension prevalence in Delhi due to pollution and stress'),
  (2, 1, 2, 'admin', 'Back pain is #1 complaint in Delhi due to commute lifestyle'),
  -- Chennai: Kidney stones due to heat
  (7, 3, 1, 'admin', 'Kidney stones endemic in Chennai due to tropical dehydration'),
  (7, 4, 2, 'admin', 'Type 2 Diabetes prevalence in Tamil Nadu among highest in India'),
  -- Manhattan: Stress-related
  (26, 5, 1, 'admin', 'Hypertension is leading cardiovascular concern in Manhattan'),
  (26, 2, 2, 'admin', 'Migraine prevalence high in Manhattan financial district');

-- ─── 10. Function: Find doctors within radius ──────────────

CREATE OR REPLACE FUNCTION find_doctors_near(
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION,
  p_radius_km INT DEFAULT 10,
  p_condition_slug VARCHAR DEFAULT NULL,
  p_limit INT DEFAULT 20
)
RETURNS TABLE (
  doctor_id INT,
  doctor_name VARCHAR,
  doctor_slug VARCHAR,
  distance_km DOUBLE PRECISION,
  subscription_tier subscription_tier,
  rating DECIMAL,
  geography_name VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.name,
    d.slug,
    ROUND((ST_Distance(
      g.coordinates,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography
    ) / 1000)::numeric, 2)::double precision AS dist_km,
    d.subscription_tier,
    d.rating,
    g.name AS geo_name
  FROM doctors_providers d
  JOIN geographies g ON d.geography_id = g.id
  LEFT JOIN doctor_specialties ds ON ds.doctor_id = d.id
  LEFT JOIN medical_conditions mc ON ds.condition_id = mc.id
  WHERE
    d.is_verified = true
    AND g.coordinates IS NOT NULL
    AND ST_DWithin(
      g.coordinates,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
      p_radius_km * 1000  -- meters
    )
    AND (p_condition_slug IS NULL OR mc.slug = p_condition_slug)
  ORDER BY d.subscription_tier DESC, dist_km ASC, d.rating DESC NULLS LAST
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;
