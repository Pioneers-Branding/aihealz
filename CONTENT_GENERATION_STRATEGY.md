# AIHealz Content Generation Strategy
## E-E-A-T Compliant, AEO & GEO Optimized Medical Content

---

## Current State Analysis

| Metric | Count |
|--------|-------|
| Total Active Conditions | 24,282 |
| Conditions with Content | ~1,366 (5.6%) |
| Conditions Needing Content | ~22,916 |
| Languages Supported | 10 (en, hi, ta, te, kn, ml, mr, gu, bn, pa) |
| Media Assets | 0 |

---

## Phase 1: API Requirements

### Required APIs

| API | Purpose | Cost Estimate | Priority |
|-----|---------|---------------|----------|
| **OpenRouter/DeepSeek** | Content generation | ~$0.001/1K tokens | HAVE |
| **Anthropic Claude** | High-quality medical content | ~$0.003/1K tokens | RECOMMENDED |
| **Unsplash API** | Free medical stock images | Free | HIGH |
| **Pexels API** | Free medical stock images | Free | HIGH |
| **BioRender API** | Medical illustrations | $299/mo | MEDIUM |
| **DALL-E 3 / Midjourney** | Custom medical diagrams | ~$0.04/image | OPTIONAL |
| **Lottie/Rive** | Animated medical content | Free tier available | OPTIONAL |
| **ElevenLabs** | Audio explanations | $5-22/mo | OPTIONAL |

### API Keys Needed

```env
# Content Generation
OPENROUTER_API_KEY=xxx          # Already configured
ANTHROPIC_API_KEY=xxx           # For high-quality content

# Image APIs
UNSPLASH_ACCESS_KEY=xxx         # Free - 50 requests/hour
PEXELS_API_KEY=xxx              # Free - 200 requests/hour
PIXABAY_API_KEY=xxx             # Free - backup option

# Optional Premium
BIORENDER_API_KEY=xxx           # Professional medical illustrations
OPENAI_API_KEY=xxx              # For DALL-E medical diagrams
```

---

## Phase 2: Content Architecture

### E-E-A-T Framework

```
EXPERIENCE
├── Patient testimonials & recovery stories
├── Real treatment timelines
├── Community Q&A integration
└── User-submitted symptom data

EXPERTISE
├── Medical reviewer credentials (name, specialty, license)
├── Last reviewed date (< 6 months)
├── Peer-reviewed source citations
├── ICD-10/ICD-11 code mapping
└── Clinical guidelines references

AUTHORITATIVENESS
├── Citations from WHO, NIH, Mayo Clinic
├── Published medical journal references
├── Expert contributor profiles
├── Institutional partnerships
└── Medical board certifications

TRUSTWORTHINESS
├── Clear medical disclaimers
├── Transparent review process
├── Source attribution for all claims
├── Regular content audits
├── Conflict of interest disclosure
└── HIPAA/data privacy compliance
```

### Page Content Structure (per condition)

```json
{
  "core_content": {
    "h1_title": "SEO-optimized, keyword-rich title",
    "hero_overview": "2-3 sentence AI summary (150-200 words)",
    "definition": "Medical definition with simple explanation",
    "simple_name": "Layman term (e.g., 'Sugar Disease' for Diabetes)",
    "regional_names": ["Hindi: मधुमेह", "Tamil: நீரிழிவு"],
    "icd_codes": ["E11.9", "E11.65"]
  },

  "clinical_content": {
    "primary_symptoms": ["symptom1", "symptom2"],
    "early_warning_signs": ["sign1", "sign2"],
    "emergency_signs": ["red_flag1", "red_flag2"],
    "causes": [{"cause": "", "description": "", "evidence_level": ""}],
    "risk_factors": [{"factor": "", "category": "lifestyle|genetic|environmental", "relative_risk": ""}],
    "affected_demographics": {"age_groups": [], "gender_prevalence": "", "geographic_distribution": []},
    "diagnosis_pathway": {"initial_tests": [], "confirmatory_tests": [], "differential_diagnosis": []},
    "staging_classification": "If applicable (cancer staging, etc.)"
  },

  "treatment_content": {
    "treatment_overview": "Comprehensive treatment approach",
    "first_line_treatments": [{"name": "", "mechanism": "", "effectiveness": "", "side_effects": []}],
    "surgical_options": [{"procedure": "", "indication": "", "success_rate": "", "recovery_time": ""}],
    "alternative_treatments": [{"therapy": "", "evidence_level": "", "when_appropriate": ""}],
    "emerging_treatments": ["Clinical trials, new drugs"],
    "treatment_cost_range": {"min": 0, "max": 0, "currency": "INR", "includes": []}
  },

  "lifestyle_content": {
    "prevention_strategies": [],
    "lifestyle_modifications": [],
    "diet_recommendations": {"recommended": [], "avoid": [], "meal_plan_link": ""},
    "exercise_guidelines": {"type": "", "frequency": "", "precautions": []},
    "mental_health_support": "Psychological aspects of living with condition"
  },

  "prognosis_content": {
    "prognosis_overview": "",
    "survival_rates": "If applicable",
    "quality_of_life_impact": "",
    "recovery_timeline": "",
    "complications": [{"complication": "", "prevention": "", "management": ""}],
    "long_term_outlook": ""
  },

  "specialist_content": {
    "specialist_type": "Cardiologist",
    "why_see_specialist": "",
    "doctor_selection_criteria": [],
    "questions_to_ask_doctor": [],
    "second_opinion_guidance": ""
  },

  "hospital_content": {
    "hospital_selection_criteria": [],
    "key_facilities_needed": [],
    "accreditations_to_look_for": ["NABH", "JCI"],
    "insurance_considerations": ""
  },

  "seo_content": {
    "meta_title": "Under 60 chars",
    "meta_description": "Under 160 chars",
    "keywords": ["primary", "secondary", "long-tail"],
    "search_intent_mapping": {"informational": [], "transactional": [], "navigational": []},
    "featured_snippet_content": "Direct answer for Google snippets",
    "voice_search_phrases": ["How do I know if I have...", "What causes..."]
  },

  "aeo_content": {
    "llm_summary": "Concise summary for AI assistants (500 words max)",
    "structured_facts": [{"fact": "", "source": "", "confidence": ""}],
    "entity_relationships": [{"entity": "", "relationship": "", "target": ""}],
    "citation_ready_statements": ["Statement with [source]"],
    "question_answer_pairs": [{"q": "", "a": ""}]
  },

  "media_content": {
    "feature_image": {"url": "", "alt": "", "source": "", "license": ""},
    "anatomy_diagram": {"url": "", "labels": []},
    "symptom_infographic": {"url": "", "data_points": []},
    "treatment_flowchart": {"url": "", "steps": []},
    "video_explainer": {"youtube_id": "", "duration": "", "transcript": ""},
    "3d_model": {"url": "", "format": "glb", "interactive": true}
  },

  "trust_signals": {
    "reviewed_by": {"name": "", "credentials": "", "license": "", "photo": ""},
    "last_reviewed": "2026-03-01",
    "sources": [{"title": "", "url": "", "publication": "", "year": ""}],
    "medical_disclaimer": "Standard disclaimer",
    "fact_check_status": "verified"
  },

  "schema_markup": {
    "medical_condition_schema": {},
    "faq_schema": {},
    "how_to_schema": {},
    "breadcrumb_schema": {},
    "article_schema": {},
    "medical_organization_schema": {}
  }
}
```

---

## Phase 3: Generation Pipeline

### Batch Processing Strategy

```
Total: 24,282 conditions
├── Priority 1 (High Traffic): 500 conditions
│   └── Common conditions: diabetes, hypertension, cancer, etc.
│   └── Generate: Full content + all languages + media
│   └── Timeline: Week 1-2
│
├── Priority 2 (Medium Traffic): 2,000 conditions
│   └── Specialty conditions by body system
│   └── Generate: Full content + EN/HI + basic media
│   └── Timeline: Week 3-6
│
├── Priority 3 (Long Tail): 10,000 conditions
│   └── Less common but searchable conditions
│   └── Generate: Core content + EN only
│   └── Timeline: Week 7-14
│
└── Priority 4 (Comprehensive): 11,782 conditions
    └── Rare conditions, ICD variants
    └── Generate: Basic content template
    └── Timeline: Week 15-20
```

### Daily Generation Capacity

```
With DeepSeek via OpenRouter:
- Cost: ~$0.14/1M input + $0.28/1M output tokens
- Per condition: ~4,000 tokens input + 8,000 tokens output
- Cost per condition: ~$0.003
- Daily budget $50 = ~16,000 conditions/day

With Claude Sonnet (higher quality):
- Cost: ~$3/1M input + $15/1M output tokens
- Per condition: ~4,000 tokens input + 8,000 tokens output
- Cost per condition: ~$0.13
- Daily budget $50 = ~380 conditions/day

RECOMMENDED: Hybrid approach
- Priority 1-2: Claude for quality ($0.13 × 2,500 = $325)
- Priority 3-4: DeepSeek for volume ($0.003 × 21,782 = $65)
- Total estimated cost: ~$400-500
```

---

## Phase 4: Image Generation Strategy

### Image Types Needed

| Type | Source | Count per Condition |
|------|--------|---------------------|
| Feature/Hero Image | Unsplash/Pexels | 1 |
| Anatomy Diagram | BioRender/Custom | 1 |
| Symptom Icons | Icon library | 3-5 |
| Treatment Infographic | Canva API / AI | 1 |
| Doctor/Hospital Stock | Unsplash | 2-3 |

### Image API Integration

```typescript
// Proposed image sourcing pipeline
async function getConditionImages(condition: string, bodySystem: string) {
  // 1. Search Unsplash for medical images
  const unsplashImages = await searchUnsplash(`${condition} medical health`);

  // 2. Search Pexels as backup
  const pexelsImages = await searchPexels(`${bodySystem} anatomy doctor`);

  // 3. Generate custom diagram with DALL-E if needed
  if (!unsplashImages.length) {
    const customImage = await generateDallE(`Medical diagram of ${condition}, clinical illustration style`);
  }

  // 4. Store in media_assets table
  await saveMediaAsset({
    conditionId,
    type: 'feature_image',
    url: imageUrl,
    alt: `Medical illustration of ${condition}`,
    source: 'unsplash',
    license: 'unsplash-license'
  });
}
```

---

## Phase 5: AEO (Answer Engine Optimization)

### Optimization for AI Search Engines

```
Target Platforms:
├── Google AI Overview (SGE)
├── Bing Chat / Copilot
├── Perplexity AI
├── ChatGPT Browse
├── Claude Search
└── Meta AI
```

### AEO Content Requirements

1. **Structured Data**
   - MedicalCondition schema
   - FAQPage schema
   - HowTo schema for treatments
   - Article schema with author credentials

2. **Citation-Ready Content**
   ```
   "Type 2 diabetes affects approximately 422 million people worldwide
   [WHO, 2023]. The condition is characterized by insulin resistance
   and is typically managed through lifestyle modifications and
   medication [American Diabetes Association Guidelines, 2024]."
   ```

3. **Direct Answer Format**
   ```
   Q: What is the main cause of Type 2 diabetes?
   A: The main cause of Type 2 diabetes is insulin resistance,
   where the body's cells don't respond effectively to insulin.
   This is often linked to obesity, physical inactivity, and
   genetic factors.
   ```

4. **Entity Markup**
   ```html
   <span itemscope itemtype="https://schema.org/MedicalCondition">
     <meta itemprop="name" content="Type 2 Diabetes"/>
     <meta itemprop="code" content="E11"/>
   </span>
   ```

---

## Phase 6: GEO (Generative Engine Optimization)

### Making Content AI-Friendly

1. **LLM Summary Block**
   ```
   <!-- AI-SUMMARY -->
   Type 2 Diabetes (ICD-10: E11) is a chronic metabolic disorder
   characterized by high blood sugar levels due to insulin resistance.
   Affects 422M globally. Treated by Endocrinologists. Key symptoms:
   increased thirst, frequent urination, fatigue. First-line treatment:
   Metformin. Prevention: healthy diet, regular exercise, weight management.
   <!-- /AI-SUMMARY -->
   ```

2. **Fact Blocks**
   ```json
   {
     "condition": "Type 2 Diabetes",
     "facts": [
       {"fact": "Affects 422 million people globally", "source": "WHO 2023", "confidence": 0.95},
       {"fact": "Can be prevented in 58% of cases with lifestyle changes", "source": "DPP Study", "confidence": 0.90}
     ]
   }
   ```

3. **robots.txt for AI**
   ```
   User-agent: GPTBot
   Allow: /

   User-agent: Google-Extended
   Allow: /

   User-agent: CCBot
   Allow: /
   ```

---

## Phase 7: Implementation Roadmap

### Week 1-2: Infrastructure Setup
- [ ] Configure all API keys
- [ ] Set up image CDN (Cloudflare R2 or S3)
- [ ] Create batch processing queue (BullMQ/Redis)
- [ ] Build admin dashboard for content monitoring

### Week 3-4: Priority 1 Content
- [ ] Generate content for top 500 conditions
- [ ] All 10 languages
- [ ] Feature images + anatomy diagrams
- [ ] Manual quality review

### Week 5-8: Priority 2 Content
- [ ] Generate content for 2,000 specialty conditions
- [ ] English + Hindi
- [ ] Basic images
- [ ] Automated quality scoring

### Week 9-16: Priority 3-4 Content
- [ ] Generate remaining 21,782 conditions
- [ ] English only initially
- [ ] Template-based images
- [ ] AI quality validation

### Week 17-20: Polish & Optimize
- [ ] Add medical reviewer attribution
- [ ] Generate missing translations
- [ ] A/B test page layouts
- [ ] Submit to Google Search Console

---

## Phase 8: API Implementation

### New API Endpoints Needed

```
POST /api/admin/content-generator/batch
  - Queue bulk content generation
  - Priority, language, limit params

POST /api/admin/images/generate
  - Generate/fetch images for conditions
  - Save to media_assets table

POST /api/admin/content/review
  - Mark content as reviewed
  - Add medical reviewer info

GET /api/admin/content/stats
  - Coverage statistics
  - Quality metrics
  - Generation queue status

POST /api/admin/aeo/optimize
  - Generate AEO-specific content
  - Create schema markup
  - Extract citation-ready facts
```

---

## Cost Estimate Summary

| Item | One-Time | Monthly |
|------|----------|---------|
| Content Generation (all conditions) | $400-500 | - |
| Translation (9 languages × 24K) | $200-300 | - |
| Image APIs (Unsplash/Pexels) | Free | Free |
| Premium Images (BioRender) | - | $299 |
| AI Image Generation | $100-200 | $50 |
| CDN/Storage | - | $20-50 |
| **Total** | **$700-1,000** | **$370-400** |

---

## Required Environment Variables

```env
# Content Generation
OPENROUTER_API_KEY=your_key
ANTHROPIC_API_KEY=your_key            # For high-quality content

# Image APIs
UNSPLASH_ACCESS_KEY=your_key          # https://unsplash.com/developers
PEXELS_API_KEY=your_key               # https://www.pexels.com/api/
PIXABAY_API_KEY=your_key              # https://pixabay.com/api/docs/

# Storage
CLOUDFLARE_R2_ACCESS_KEY=your_key     # Or AWS S3
CLOUDFLARE_R2_SECRET_KEY=your_key
CLOUDFLARE_R2_BUCKET=aihealz-media

# Optional Premium
BIORENDER_API_KEY=your_key
OPENAI_API_KEY=your_key               # For DALL-E
```

---

## Next Steps

1. **Immediate**: Get Unsplash and Pexels API keys (free)
2. **This Week**: Build batch content generation pipeline
3. **Next Week**: Generate Priority 1 content (500 conditions)
4. **Ongoing**: Monitor quality, iterate on prompts
