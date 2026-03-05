-- ============================================================
-- aihealz.com — Performance Indexes
-- ============================================================

-- Geography tree traversal & lookups
CREATE INDEX idx_geo_parent       ON geographies(parent_id);
CREATE INDEX idx_geo_slug         ON geographies(slug);
CREATE INDEX idx_geo_level        ON geographies(level);
CREATE INDEX idx_geo_level_parent ON geographies(level, parent_id);
CREATE INDEX idx_geo_active       ON geographies(is_active) WHERE is_active = true;

-- Condition lookups
CREATE INDEX idx_condition_slug       ON medical_conditions(slug);
CREATE INDEX idx_condition_specialist ON medical_conditions(specialist_type);
CREATE INDEX idx_condition_system     ON medical_conditions(body_system);
CREATE INDEX idx_condition_symptoms   ON medical_conditions USING GIN(symptoms);
CREATE INDEX idx_condition_active     ON medical_conditions(is_active) WHERE is_active = true;

-- Doctor queries (hot path for page rendering)
CREATE INDEX idx_doctor_geo          ON doctors_providers(geography_id);
CREATE INDEX idx_doctor_verified     ON doctors_providers(is_verified) WHERE is_verified = true;
CREATE INDEX idx_doctor_tier         ON doctors_providers(subscription_tier);
CREATE INDEX idx_doctor_slug         ON doctors_providers(slug);
CREATE INDEX idx_doctor_tier_rating  ON doctors_providers(subscription_tier DESC, rating DESC);
CREATE INDEX idx_doctor_geo_tier     ON doctors_providers(geography_id, subscription_tier DESC, rating DESC);

-- Doctor specialties (join performance)
CREATE INDEX idx_ds_doctor    ON doctor_specialties(doctor_id);
CREATE INDEX idx_ds_condition ON doctor_specialties(condition_id);

-- Localized content resolution (primary hot path)
CREATE INDEX idx_lc_condition_lang_geo ON localized_content(condition_id, language_code, geography_id);
CREATE INDEX idx_lc_status             ON localized_content(status);
CREATE INDEX idx_lc_published          ON localized_content(status) WHERE status = 'published';

-- AI cache
CREATE INDEX idx_ai_cache_hash      ON ai_analysis_cache(input_hash);
CREATE INDEX idx_ai_cache_condition  ON ai_analysis_cache(condition_slug);
CREATE INDEX idx_ai_cache_expiry     ON ai_analysis_cache(expires_at);

-- Page cache
CREATE INDEX idx_page_cache_key    ON page_cache(cache_key);
CREATE INDEX idx_page_cache_expiry ON page_cache(expires_at);

-- Reviewer lookups
CREATE INDEX idx_reviewer_condition     ON condition_reviewers(condition_id);
CREATE INDEX idx_reviewer_condition_geo ON condition_reviewers(condition_id, geography_id);

-- UI Translations
CREATE INDEX idx_ui_trans_lang_ns ON ui_translations(language_code, namespace);

-- Sitemap entries
CREATE INDEX idx_sitemap_index ON sitemap_entries(sitemap_index);
CREATE INDEX idx_sitemap_lang  ON sitemap_entries(language_code);
