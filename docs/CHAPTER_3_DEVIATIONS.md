# Chapter 3 Deviations and Architectural Enhancements

This document catalogs all architectural enhancements and design adjustments made during implementation that deviate from or expand upon the original Chapter 3 methodology. Use these notes for the Chapter 3 and Chapter 4 thesis updates.

---

## 1. Demographic Specification: Inclusion of Biological Sex (Gender)
* **Chapter 3 Proposal**: Demographics originally included only age and weight.
* **Implementation Reality**: Caloric estimation formulas (Harris-Benedict and Mifflin-St Jeor) require biological sex to calculate accurate Basal Metabolic Rate (BMR).
* **Enhancement**: Added a required `gender` field (`female` | `male`) in Step 1 of onboarding, profile schema, and AI prompt context.

---

## 2. Regulatory Compliance: Explicit Health Data Consent
* **Chapter 3 Proposal**: Standard email/password registration with immediate onboarding.
* **Implementation Reality**: Under the Nigeria Data Protection Act (NDPA) and global health data governance standards, medical conditions (hypertension, diabetes, obesity, ulcers) constitute sensitive personal data.
* **Enhancement**: Added a mandatory opt-in consent checkbox at registration ("I agree to ChopWise storing my dietary health information to personalise my meals"), recorded with ISO timestamp `consentAt` in `users/{uid}`.

---

## 3. Security Architecture: Serverless Proxy Pattern
* **Chapter 3 Proposal**: Client application communicating directly with external AI and nutrition APIs (Figure 3.4).
* **Implementation Reality**: Client-side API calls would expose Google Gemini and USDA API keys in browser network traffic.
* **Enhancement**: Implemented a secure 3-endpoint serverless backend deployed on Vercel Functions:
  - `POST /api/recommend`: Validates Firebase ID tokens, checks atomic Firestore rate limits, constructs sanitized prompts, queries Gemini, and reconciles ingredient pricing.
  - `POST /api/nutrition`: Resolves meal ingredients strictly on the server by `mealId`, performs hash lookup in `nutrition_cache`, queries USDA FoodData Central, and falls back to AI estimates.
  - `POST /api/admin`: Authenticates admin UIDs from `ADMIN_UIDS`, manages encrypted secrets with AES-256-GCM, and executes diagnostic health checks.

---

## 4. Nutrition Engine: USDA Food-Composition Lookup and AI Fallback
* **Chapter 3 Proposal**: Edamam Nutrition Analysis API specified as the nutrition provider.
* **Implementation Reality**: USDA FoodData Central provides food-composition records, not recipe parsing. Ingredient names may not have a usable match, and current recipes can use non-gram units for which a safe weight conversion is unavailable.
* **Enhancement**: The server searches each ingredient and calculates USDA totals only when every ingredient has a usable match and gram quantity. Disabled/unconfigured USDA, unmatched ingredients, unsupported units, timeouts, rate limits, or other upstream errors use Gemini's structured `aiNutritionEstimate` with `source: 'ai-estimate'` and empty vitamins. Successful responses use `source: 'usda'` and show USDA attribution.

---

## 5. Performance & Cost Optimization: Dual Hash-Based Caching
* **Chapter 3 Proposal**: Fresh generation on every request.
* **Implementation Reality**: Repeated AI calls incur financial quota costs and response latencies (3–6 seconds).
* **Enhancement**:
  - `profileHash`: SHA-1 hash of canonical user profile JSON cached at `users/{uid}/latestRecs/current`. Repeated visits return cached plans in < 150 ms; editing the profile alters the hash and automatically triggers fresh recommendations.
  - `ingredientsHash`: SHA-1 hash of normalized ingredient lines cached in MySQL `nutrition_cache` to avoid duplicate USDA lookups.

---

## 6. Centralized Administration & Credential Management
* **Chapter 3 Proposal**: Static hardcoded settings and environment variables.
* **Implementation Reality**: Rotating credentials or tuning clinical thresholds (e.g. hypertension sodium limit) would require full redeployment.
* **Enhancement**: Created a single administrative portal at `/admin/dashboard` protected by `ADMIN_UIDS` and AES-256-GCM encryption (`CONFIG_ENCRYPTION_KEY`). Allows dynamic key rotation, setting adjustments, price table edits, and health checks with a 60-second in-memory cache.

---

## 7. Recipe Bookmarking: Saved Meals Feature
* **Chapter 3 Proposal**: Single-session recommendation viewing.
* **Implementation Reality**: Users require the ability to save favorite recipes before regenerating a new weekly meal plan.
* **Enhancement**: Added `users/{uid}/savedMeals/{mealId}` in Firestore with real-time sync, allowing users to save, view, and remove favorite recipes from the Profile page.

---

## 8. Automated Evidence Suite: Evaluation Runner (P14 / AR9)
* **Chapter 3 Proposal**: Manual data collection for Chapter 4 results.
* **Enhancement**: Integrated an automated batch test runner in `/admin/evaluation` that runs 10 profiles sequentially through the live AI pipelines, generating budget adherence percentages, safety flag totals, USDA vs. AI fallback ratios, and downloadable CSV evidence (`chopwise_chapter4_evaluation.csv`).
