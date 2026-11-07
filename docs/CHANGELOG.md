# CHANGELOG.md
Add one line per task: date, task id, what changed, doc updates.

## Unreleased — planning decisions (2026-11-07)
- Stack locked to Chapter 3: React, Firebase, Gemini, Edamam, Vercel.
- Added server-side proxy (3 Vercel functions) so keys never reach the browser.
- Added Admin page: all functions/APIs, key entry with how-to links, settings, thresholds, price table, tests.
- Admin identity by UID (`ADMIN_UIDS`), not email.
- Admin-saved secrets encrypted with AES-256-GCM (`CONFIG_ENCRYPTION_KEY`); env fallback for keys.
- Nutrition endpoint takes only `mealId`; ingredients resolved server-side.
- Nutrition cache keyed by ingredient hash.
- Gender field, Save meal, consent checkbox, safety flags, AI-estimate fallback added.

## Schedule change (2026-11-07)
- Whole MVP built on Day 1 in 7 blocks (P1–P13); Days 2–3 reserved for deploy, evidence and debugging. P14/P15 moved to the debug days.
- Added docs/DEBUGGING.md and docs/KNOWN_ISSUES.md; AGENTS.md now allows ordered multi-task blocks with a 2-attempt stop rule.

## Block 1 (2026-11-07)
- P1: Scaffolded ChopWise app with React, Vite, Tailwind v4, Router, Firebase SDK, starter brand tokens, base components, and Landing page.
- P2: Implemented scripts/edamam-probe.mjs and documented Edamam API findings and fallback necessity in docs/AI_AND_NUTRITION_SPEC.md.

## Block 2 (2026-11-07)
- P3: Built authentication features (AuthContext, useAuth, authErrors mapping), Login and Register pages with required medical consent checkbox, route guards (ProtectedRoute, ProfileGate), and dynamic navbar state.
- P4: Created firestore.rules, reusable onboarding step components (Demographics, Conditions, Preferences, Budget), Zod profile schemas, progress bar, and profile persistence with real confirmation flow.

## Block 3 (2026-11-07)
- P5: Implemented server foundation and Admin API (api/admin.js, _lib/http.js, _lib/auth.js, _lib/crypto.js AES-256-GCM, _lib/configStore.js with 60s cache and secret masking, _lib/integrations.js registry with healthchecks, and clients for Gemini and Edamam).

## Block 4 (2026-11-07)
- P6: Built the single Admin page (/admin) with AdminRoute guard (non-admins see NotFound), dynamic navbar Admin link, FunctionsTable, generic IntegrationCards (Gemini, Edamam with masked write-only secrets and help links), SettingsForm, SafetyForm, PriceTableEditor, and BootstrapChecklist.

## Block 5 (2026-11-07)
- P7: Built recommendation service and endpoint (api/recommend.js, _lib/services/prompt.js with prompt injection sanitization, _lib/services/budget.js with deterministic unit conversion, _lib/services/safety.js with medical condition rules, _lib/services/rateLimit.js with Firestore atomic transactions, _lib/services/recommendationService.js with SHA-1 profile caching, Gemini JSON structured outputs, budget recalculation, and over-budget retry). Added recommend pipeline test to Admin registry.
- P8: Built Dashboard UI (pages/Dashboard.jsx, features/meals/useRecommendations.js, features/meals/MealCard.jsx, features/meals/SafetyBadge.jsx) with skeleton loading, NOT_CONFIGURED and RATE_LIMITED error states, meal-type filtering, rate limit confirmation dialog on regenerate, and updated onboarding completion to redirect to /dashboard.

## Block 6 (2026-11-07)
- P9: Built nutrition service and endpoint (api/nutrition.js, _lib/services/nutritionService.js with buildIngredientLines, SHA-1 ingredients hashing, Firestore nutritionCache, Edamam analysis with seamless AI-estimate fallback, and real-value safety screening). Added nutrition pipeline test to Admin registry.
- P10: Built MealDetail page (/meal/:id) and NutritionPanel component with full ingredient cost breakdown, cooking steps, safety badges, caution notes, Edamam attribution, AI estimate explanation, and Firestore users/{uid}/savedMeals/{mealId} toggle persistence.
- P11: Built FilterBar (client-side meal-type, health condition, and budget range filtering with empty-state regenerate prompt), Profile page (/profile) reusing onboarding steps to update Firestore profile and invalidate cached recommendations, SavedMealsList with quick recipe navigation and deletion, and 3-click navigation navbar links.
- P12: Added global React ErrorBoundary, verified zero console.log in runtime code, audited touch target sizes (44px min targets), verified 375 px mobile responsiveness, verified security against key leakage in src/ and dist/, and added unit test suite for server schemas (55 passing tests).

## Branding and theme (2026-11-07)
- Product named ChopWise; green and white palette with light/dark/system modes.
- Colours defined as semantic tokens in one file (`src/styles/theme.css`); starter/ holds ready-made theme, toggle, logo, favicon and `check-colors.mjs`.
- Contrast verified (WCAG AA) for all token pairs in both themes; primary button colour is emerald-700 equivalent (#047857) because emerald-600 failed AA with white text.
- `npm run verify` added (colour check + tests + build).
