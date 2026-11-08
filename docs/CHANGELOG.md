# CHANGELOG.md
Add one line per task: date, task id, what changed, doc updates.

## Animated Login & ChopWise Preloader (2026-11-08)
- Added animated authenticating state to the Login page submit button (`Authenticating...` with spinner and animated bouncing dots).
- Created branded animated `Preloader.jsx` featuring dynamic app name, animated simmering logo emblem, progress shimmer bar, and bouncing dots.
- Integrated `Preloader` into `ProtectedRoute`, `ProfileGate`, and post-login route transition for a seamless, branded loading experience.
- Added animated state to the Register button for consistent authentication UX.

## Backend Migration to Supabase (2026-11-07)
- Migrated Database and Authentication from Firebase/Firestore to Supabase (PostgreSQL + Supabase Auth with Row Level Security).
- Generated complete SQL database schema with RLS policies and automatic profile creation trigger in `supabase/schema.sql`.
- Created browser Supabase client `src/lib/supabase.js` and server admin client `api/_lib/supabaseAdmin.js`.
- Updated AuthContext, login/register flows, apiClient token attachment, profile management, saved meals, and meal detail queries to use Supabase.
- Migrated serverless functions (`api/_lib/auth.js`, `api/_lib/configStore.js`, `api/_lib/integrations.js`, `api/_lib/services/rateLimit.js`, `api/_lib/services/nutritionService.js`, `api/_lib/services/recommendationService.js`, `api/admin.js`) to read/write PostgreSQL tables (`profiles`, `saved_meals`, `latest_recs`, `nutrition_cache`, `rate_limits`, `admin_config`).
- Updated BootstrapChecklist, `.env.example`, and `docs/DATABASE.md`.

## UI & Landing Page Upgrades (2026-11-07)
- Removed the “AI Nutrition | Tailored for Nigerian Health & Wallets” badge from the landing-page hero.
- Dynamic Project Identity & Branding: added Admin card (`BrandingSettingsCard.jsx`) and `ConfigContext.jsx` allowing administrators to customize the project name, website icon/emoji (with quick presets `🍲`, `🥘`, `🇳🇬`, `🌿`, `🥗`, `🥑`, or custom image URL), tagline, and hero image. Changes immediately reflect across the site header, logo, footer, mobile drawer, document title, and browser tab favicon via public server configuration (`action: 'publicConfig'`) and reactive state.
- Codebase compliance: extracted `MealIngredientsAndSteps.jsx`, `evaluationCsv.js`, `validateOnboardingStep`, and `BrandingSettingsCard.jsx` to ensure 100% of files across `src/` adhere strictly to the <= 250 lines rule.
- Hero section and recipe imagery: added configurable `heroImageUrl` setting in Admin portal (`/admin`) and server config store (`api/_lib/configStore.js`, `settingsSchema`) with quick Nigerian culinary presets and live preview; upgraded Landing page hero into a 2-column responsive layout showcasing the configured meal image with nutritional badge overlay; added images to sample recipes.
- Header styling: changed top site header from semi-transparent blur to a solid, opaque darker green (`--color-header-bg: #034430` light, `#05261B` dark) with high-contrast text (`--color-header-fg`), soft mint secondary accents (`--color-header-muted`), and inverted ChopWise logo mark.
- Dashboard optimization: extracted `DashboardError.jsx` to keep `Dashboard.jsx` under 250 lines (now 240 lines).
- Mobile sidebar navigation: updated the hamburger menu into an off-canvas drawer (`MobileDrawer.jsx`) that smoothly flows in from the right (`translate-x-full` to `translate-x-0` with `duration-300 ease-out`), accompanied by a semi-transparent `bg-overlay/60` backdrop blur scrim, explicit close button, user profile info, navigation links, and theme toggle.
- Added `--color-overlay` theme token to `src/styles/theme.css` for consistent modal and drawer backdrop styling across light and dark modes.
- Login page now has Test User and Test Admin shortcuts that prefill the shared `password1` test credential for deployed testing; docs warn to use disposable accounts and clarify that Firebase authentication and UID-based admin authorization remain required.
- Landing page overhaul: set Hero section to 98%vh (`min-h-[98vh]`), standard content sections to 60%vh (`min-h-[60vh]`), and detailed sample recipes section to natural height; applied subtle alternating background gradients across all landing page sections using semantic theme tokens (`from-page`, `via-surface-muted`, `to-surface`).
- Extracted `landingData.js` and `Footer.jsx` to adhere to the <= 250 line limit per file.
- Header refinements: removed Sign Up button before login, displaying only "Log in" and upgraded tactile pill `ThemeToggle`; implemented responsive mobile hamburger drawer menu.
- Auth & Admin styling: single-page headerless and footerless views for `/login`, `/register`, and `/admin`; direct text links between login and sign-up (no tabs); password visibility toggles; floating theme toggle; and streamlined admin header with back navigation.

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
## Day 3 — Final Audit & Architecture Documentation (2026-11-07)
- P15: Completed full repository audit against all specification docs, verified all FR1–FR10 and AR1–AR9 acceptance criteria, verified security controls and Firestore rules, authored docs/CHAPTER_3_DEVIATIONS.md documenting the 8 architectural enhancements made to Chapter 3 methodology, and created release tag mvp-final.

## Day 2 — Deploy, evaluation, and evidence (2026-11-07)
- P14: Built automated 10-profile evaluation runner for Chapter 4 research evidence (api/_lib/data/evaluationProfiles.js, api/admin.js runEvaluationCase action, and src/features/admin/EvaluationRunner.jsx with progress bar, summary metrics, and CSV export).

## Block 7 (2026-11-07)
- P12: Added global React ErrorBoundary, verified zero console.log in runtime code, audited touch target sizes (44px min targets), verified 375 px mobile responsiveness, verified security against key leakage in src/ and dist/, and added unit test suite for server schemas (55 passing tests).
- P13: Generated comprehensive docs/DEPLOYMENT_GUIDE.md detailing Vercel project linking, all client/server environment variables (names only, no values), CONFIG_ENCRYPTION_KEY generation, service account base64 encoding, firestore.rules deployment instructions, and post-deploy smoke test verification.

## Branding and theme (2026-11-07)
- Product named ChopWise; green and white palette with light/dark/system modes.
- Colours defined as semantic tokens in one file (`src/styles/theme.css`); starter/ holds ready-made theme, toggle, logo, favicon and `check-colors.mjs`.
- Contrast verified (WCAG AA) for all token pairs in both themes; primary button colour is emerald-700 equivalent (#047857) because emerald-600 failed AA with white text.
- `npm run verify` added (colour check + tests + build).
