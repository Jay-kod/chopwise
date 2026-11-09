# CHANGELOG.md
Add one line per task: date, task id, what changed, doc updates.

## Single Unified Admin Sidebar and Dedicated Modular Subpages (2026-11-09)
- Unified the admin sidebar into a single navigation group (`Admin Portal`), removing the redundant duplicate "Customer View" group that caused two sidebars.
- Added a streamlined "Customer App" switch link in the sidebar footer for quick access back to the customer area.
- Converted all admin sections from in-page hash anchors (`#functions`, `#gemini`, etc.) into dedicated, standalone page routes under `/admin/*`:
  - Overview: `/admin/dashboard` (and `/admin`)
  - Functions & APIs: `/admin/functions`
  - Gemini AI: `/admin/gemini`
  - Edamam Nutrition: `/admin/edamam`
  - Recommendation & Branding Settings: `/admin/settings`
  - Medical Safety Thresholds: `/admin/safety`
  - Ingredient Market Prices: `/admin/prices`
  - Setup & Readiness Checklist: `/admin/checklist`
  - Evaluation Suite: `/admin/evaluation`
- Created `AdminLayout.jsx` with shared state management via `useAdminApi()` and `useAdminContext()`, caching status across transitions.
- Created `AdminPageHeader.jsx` with consistent title, description, and status refresh actions.
- Updated `ROUTES.admin` definitions in `src/lib/routes.js`, active path detection in `src/components/nav-group.jsx`, and test assertions in `src/lib/routes.test.js`.
- Updated `docs/ADMIN_PAGE_SPEC.md` and `docs/CHANGELOG.md`.

## Intelligent Gemini Model Auto-Discovery and Selection (2026-11-09)
- Added live model fetching endpoint (`action: "listGeminiModels"`) in `api/admin.js` leveraging `@google/genai` `ai.models.list()`.
- Implemented `parseGeminiModels` and `sortGeminiModels` in `api/_lib/clients/gemini.js` with comprehensive Vitest unit tests in `api/_lib/clients/gemini.test.js`.
- Created `useGeminiModels` hook (`src/features/admin/useGeminiModels.js`) that automatically queries live models when an API key is entered (debounced) or if already configured, with fallback resilience.
- Built `GeminiModelField` (`src/features/admin/GeminiModelField.jsx`) replacing the plain text model input with a rich, intelligent `<Select>` dropdown displaying live model names, Flash-tier recommendations, refresh button, and optional manual entry toggle.
- Integrated `GeminiModelField` into `src/features/admin/IntegrationCard.jsx` at `/admin/dashboard#gemini`.
- Updated `api/_lib/data/integrationsRegistry.js` and `docs/ADMIN_PAGE_SPEC.md` setup instructions.

## Skeletal Preloading for User and Admin Dashboards (2026-11-09)
- Implemented comprehensive skeletal preloading for User Dashboard (`src/components/dashboard-skeleton.jsx`), replacing raw spinners with animated placeholders for stat cards, metrics charts, filter bar, and meal recommendation cards.
- Created reusable `MealCardSkeleton` (`src/features/meals/MealCardSkeleton.jsx`) matching the exact layout, tags, badges, and proportions of `MealCard`.
- Integrated `MealCardSkeleton` into the recommendations section during meal regeneration or filtering so the UI updates smoothly without layout shift.
- Created `AdminSkeleton` (`src/features/admin/AdminSkeleton.jsx`) for the Admin Dashboard, displaying full-page animated skeletons for the Functions Table, API Integration cards, Configuration forms, Price Table, and Verification checklist.
- Updated `Skeleton` primitive in `src/components/ui/skeleton.jsx` to use theme semantic token `bg-surface-muted`.

## Dashboard Text Contrast and Clarity Enhancement (2026-11-09)
- Resolved dark-mode text invisibility where `--color-muted` in `@theme inline` had overwritten secondary text with the dark background color `#182B22`.
- Upgraded `.dark` `--color-fg` to `#FFFFFF` and `--color-muted` to luminous, high-contrast `#B8D9C8` (11.3:1 contrast against surface).
- Enforced explicit utilities `.text-muted`, `.text-muted-foreground`, and recharts tick fills to always resolve to `var(--color-muted)`.
- Enhanced stat card titles and footnotes in `src/components/stats.jsx` with clear, legible text styles.
- Updated `Delta` neutral values (`0.0%`) in `src/components/delta.jsx` to render with readable `text-muted`.
- Styled unselected sidebar menu items and section labels in `src/components/nav-group.jsx` with crisp `text-fg` and `text-muted`.
- Enhanced rate-limit warning banner subtitle in `src/features/meals/DashboardError.jsx` with high-contrast text.

## Dedicated Saved Meals Page, Full-Screen Onboarding, and Unified Sidebar (2026-11-09)
- Isolated `/onboarding` as a full-screen, 4-step profile wizard with minimal header and no sidebar before profile completion.
- Added dedicated `/saved` route and page (`src/pages/Saved.jsx`) for bookmarked Nigerian meals with search filter and removal confirmation dialog.
- Configured customer sidebar navigation to contain: Dashboard (`/dashboard`), Saved meals (`/saved`), and My profile (`/profile`).
- Configured admin sidebar navigation to include quick section jump anchors: Functions & APIs (`#functions`), Gemini (`#gemini`), Edamam (`#edamam`), Recommendation settings (`#settings`), Safety thresholds (`#safety`), Ingredient prices (`#prices`), Setup checklist (`#checklist`), and Evaluation (`#evaluation`).
- Integrated Theme Toggle and Log Out (with `ConfirmModal`) directly into the sidebar footer across all dashboard views.

## Strict Customer and Admin Route Namespaces (2026-11-09)
- Moved customer pages under `/customer/<page-name>` and the admin console to `/admin/dashboard`, retaining `/admin/login`; updated route-aware navigation, sign-in redirects, guards, legacy URL redirects, and route documentation.
- Updated docs/PROJECT_CONTEXT.md, docs/ADMIN_PAGE_SPEC.md, docs/ARCHITECTURE.md, docs/REQUIREMENTS.md, docs/DEPLOYMENT_GUIDE.md, docs/CHAPTER_3_DEVIATIONS.md, and docs/UI_GUIDELINES.md.

## Remove Admin Portal from User Sidebar & Contrast Fixes (2026-11-09)
- Removed "Admin Portal" from the user dashboard sidebar by decoupling `userNavGroups` and `adminNavGroups` in `src/components/app-shared.jsx` and `src/components/app-sidebar.jsx`.
- Removed `/admin` links from user footer navigation (`userFooterNavLinks = []`); admin links only render when navigating within `/admin`.
- Fixed unreadable black text on green backgrounds in dark mode by updating `.dark` `--color-on-primary` from `#052E1F` to `#FFFFFF` and `--color-primary` from `#34D399` to `#059669` in `src/styles/theme.css` and `docs/UI_GUIDELINES.md`.
- Updated active sidebar navigation items in `src/components/nav-group.jsx` and `src/components/app-sidebar.jsx` to use high-contrast solid `bg-primary text-on-primary` with pure white text and icons (`data-active:text-on-primary`, `hover:text-on-primary`), eliminating black text on active green items.
- Fixed `Delta` badge and arrow indicator contrast in `src/components/delta.jsx` by using `text-on-primary` instead of `text-background` in `FilledShell` and `bg-primary text-on-primary` on positive delta badges.
- Updated `ChannelBreakdownChart` in `src/components/channel-breakdown-chart.jsx` to render slice text labels in `var(--color-on-primary)` (white) instead of `currentColor` (black) inside green chart slices.
- Updated user avatar fallback initials in `src/components/nav-user.jsx` to use `bg-primary text-on-primary`.

## Sidebar and Active Classes on Profile, Meal Detail, and Onboarding Pages (2026-11-08)
- Upgraded the Profile page (`/profile`), Meal Detail page (`/meal/:id`), and Onboarding/Budget update page (`/onboarding`) to use the responsive `AppShell` with the sidebar.
- Added URL search parameter synchronization for Profile tabs (`/profile` for Dietary Profile, `/profile?tab=saved` for Saved Recipes).
- Implemented smart path-aware route matching and active state styling in `NavGroup` and `AppSidebar` using ChopWise brand semantic tokens (`bg-primary-soft text-on-primary-soft font-semibold [&>svg]:text-primary`).
- Integrated logout confirmation dialog into `NavUser` dropdown menu.

## Confirmation Dialogs for Logout and Critical Actions (2026-11-08)
- Created reusable `ConfirmModal` component (`src/components/ConfirmModal.jsx`) with backdrop overlay, keyboard navigation (Escape to cancel), auto-focus on cancel, and theme-compliant semantic styling.
- Added confirmation dialog when clicking "Log out" across Desktop Header navigation, Mobile drawer (`Layout.jsx`), and Profile page (`Profile.jsx`).
- Added confirmation dialog before removing a saved recipe from the user profile (`Profile.jsx`).
- Upgraded meal plan regeneration confirmation on User Dashboard (`Dashboard.jsx`) to use the unified modal.
- Added confirmation dialogs before resetting settings, safety thresholds, or ingredient price tables to defaults in the Admin console (`SettingsForm.jsx`, `SafetyForm.jsx`, `PriceTableEditor.jsx`).

## Apply Efferd Dashboard Template to User & Admin Dashboards (2026-11-08)
- Transitioned User Dashboard (`/dashboard`) to use the `@efferd/dashboard-3` template with `AppShell`, stat cards (`DashboardStats`), responsive filters, Nigerian meal recommendations grid, and saved recipes section.
- Integrated `AppShell` with the mobile-responsive sidebar, header breadcrumbs, live theme toggle, and authenticated user dropdown.
- Updated Admin Dashboard (`/admin`) to share the same responsive `AppShell` layout.

## Install Efferd Dashboard-3 Template (2026-11-08)
- Installed shadcn UI skill and initialized shadcn with Radix UI and Vite `@` path alias support (`jsconfig.json`, `vite.config.js`).
- Registered `@efferd` registry in `components.json` and installed `@efferd/dashboard-3` and its responsive app shell (`@efferd/app-shell-3`).
- Added semantic CSS variable mappings to `src/styles/theme.css` so shadcn and dashboard components automatically inherit ChopWise brand colors and dark mode tokens.
- Configured responsive sidebar overlay and single-column mobile wrapping for all screens down to 375px.

## Direct Customer Sign-In Navigation (2026-11-08)
- Updated the header and mobile drawer login buttons to navigate straight to the customer/user login page (`/login`) across both mobile and desktop screens.
- Updated `Login.jsx` to explicitly label the customer login view, auto-redirect already-authenticated users directly to `/dashboard`, and automatically navigate logged-in customers with completed profiles straight to `/dashboard` instead of onboarding.

## Separate User and Admin Sign-In (2026-11-08)
- Added `/admin/login` as a separate admin sign-in page, validates admin access through the existing server endpoint, and redirects signed-out `/admin` visitors there; split the user and admin test shortcuts between their respective sign-in pages.
- Kept the admin sign-in form available to users with an existing non-admin session so they can switch accounts.
- Updated docs/ADMIN_PAGE_SPEC.md, docs/REQUIREMENTS.md, and docs/SECURITY.md.

## Admin Sign-In Retry (2026-11-08)
- Restored the missing `useEffect` import and prevented an already-authenticated non-admin from being redirected away from `/admin/login`, so they can switch to an admin account.

## Registration Crash Fix (2026-11-08)
- Removed lingering `isSupabaseConfigured` reference from `<Register />` submit button `disabled` prop in `src/pages/Register.jsx` that triggered a `ReferenceError` unhandled render crash caught by `ErrorBoundary`.

## Local Test User and Admin Seeding (2026-11-08)
- Created `scripts/seed-users.mjs` and added `npm run seed` script to populate MySQL with active test accounts:
  - User: `chop1@test.com` (password: `password1`), completed onboarding profile (hypertension, no-pork, ₦21,000 budget), 3 pre-cached Nigerian meals, and a saved recipe.
  - Admin: `adminchop@test.com` (password: `password1`), completed profile, and full admin privileges to `/admin` and system functions.
- Updated `checkIsAdmin` in `api/_lib/auth.js` and `api/auth.js` to authorize `adminchop@test.com` and `test-admin-001`.
- Made `updatedAt` in `pricesSchema` nullable-optional to allow empty timestamps during initial bootstrap.

## Local XAMPP MySQL Database & Auth Migration (2026-11-08)
- Migrated database and authentication from cloud services to local XAMPP MySQL / MariaDB and local scrypt/JWT authentication.
- Created `mysql/schema.sql` defining `users`, `saved_meals`, `latest_recs`, `nutrition_cache`, `rate_limits`, and `admin_config` tables with utf8mb4 charset.
- Created `api/_lib/mysql.js` with `mysql2/promise` connection pooling and automatic database and table initialization on first query.
- Implemented `api/_lib/authTokens.js` using Node.js built-in `crypto.scryptSync` (salted password hashing) and HMAC-SHA256 JWT signing/verification.
- Created `api/auth.js` serving `register`, `login`, `me`, `update-profile`, `get-saved-meals`, `save-meal`, `delete-saved-meal`, and `get-meal` actions.
- Migrated server services `nutritionService.js`, `recommendationService.js`, `rateLimit.js`, `configStore.js`, `integrations.js`, and `admin.js` to execute queries directly on MySQL.
- Updated client `AuthContext.jsx`, `apiClient.js`, `Onboarding.jsx`, `Profile.jsx`, and `MealDetail.jsx` to communicate through `/api/auth` without cloud database SDKs.
- Updated `vite.config.js` local API middleware to handle `/api/auth`, enabling complete local execution with `npm run dev`.
- Updated `docs/DATABASE.md`, `src/features/admin/BootstrapChecklist.jsx`, and `.env.example`.

## Login Viewport Height (2026-11-08)
- Set the login page content to a 100vh minimum height and removed the shared layout's outer padding so the full page fits the viewport without clipping content on short screens.

## Registration & Supabase Email Confirmation Handling (2026-11-08)
- Fixed user registration flow to handle both Supabase email verification modes (confirmation required vs auto-confirm):
  - In `AuthContext.jsx`: eliminated unauthenticated client profile upsert that caused RLS permission violations when `session` was null upon sign-up; safeguarded client upserts to active sessions and relied on PostgreSQL `SECURITY DEFINER` trigger for base profile creation.
  - In `VerificationNotice.jsx`: added dedicated inline verification card presented upon registration when Supabase requires email confirmation, showing the target email, instructions to check inbox, and quick dashboard guidance to disable email confirmation for testing if desired.
  - In `authErrors.js`: added friendly error messages for `Email not confirmed`, `over_email_send_rate_limit`, and duplicate user identities.
  - In `supabase/schema.sql`: enhanced `handle_new_user()` trigger to automatically record `consent_at = now()`.
  - In `AuthIcons.jsx`: extracted reusable `PasswordToggle`, `MailIcon`, and `CheckCircleIcon` components.
  - All files strictly adhere to <= 250 lines, functions <= 40 lines, and semantic theme tokens.


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
