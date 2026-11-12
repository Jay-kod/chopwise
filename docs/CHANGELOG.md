# CHANGELOG.md
Add one line per task: date, task id, what changed, doc updates.

## Mobile Responsiveness & Header Viewport Polish (2026-11-12)
- Fixed mobile header overflow in `src/components/app-header.jsx` and `src/components/LiveClock.jsx`:
  - Hid header `LiveClock` on mobile/tablet viewports (`hidden lg:flex`) to eliminate squished 3-line clock wrapping and prevent pushing `NavUser` (avatar menu) off-screen.
  - Added `whitespace-nowrap shrink-0` and `cn()` utility to `LiveClock.jsx` so clock timestamps never wrap internally.
  - Enhanced `ThemeToggle.jsx` with responsive label hiding (`hidden sm:inline`) and compact mobile padding, turning it into a neat icon button on mobile screens.
- Polished customer dashboard mobile layout:
  - In `src/features/dashboard/DashboardHero.jsx`: top-aligned avatar with multi-line greetings (`items-start`), tuned font sizes and line heights for long names, compacted status pills (`text-[10px] sm:text-[11px]`), and reorganized action buttons into a full-width primary CTA with a 3-column secondary link grid (`🍲 Meals`, `📊 Analysis`, `⚙️ Profile`).
  - In `src/features/dashboard/DashboardMetrics.jsx`: updated grid to single column on mobile screens (`grid-cols-1 md:grid-cols-2 xl:grid-cols-4`) to prevent 2-column squeezing of weekly pacing bars and curated dish chips.
  - In `src/features/dashboard/HealthAdvisoryBanner.jsx`: adjusted clinical advisory cards to single-column on mobile (`grid-cols-1 md:grid-cols-2`).
  - In `src/features/dashboard/DashboardMealTabs.jsx`: tuned tab padding and gaps (`px-2.5 sm:px-3.5 py-1.5`) for seamless fit on small mobile screens.
- Full verification passed (`npm run verify`: 20 test files, 104 tests, 0 color check errors, clean production build).

## Display User Name Instead of Email & Add Full Name to Registration (2026-11-12)
- Added Full Name input field to customer registration (`src/pages/Register.jsx`) with `UserIcon` and distinct `MailIcon` for email.
- Updated registration flow and MySQL persistence (`users.name`, `users.profile.displayName`) via additive schema migration `addNameColumnMigration`.
- Updated all UI user touchpoints (`DashboardHero`, `Dashboard`, `nav-user`, `Layout`, `MobileDrawer`, `AdminCustomers`, `AdminRoute`) to display the user's name across the application instead of raw email address.
- Updated seed data (`scripts/seed-users.mjs`) to seed `Chinedu Okafor` for test user `chop1@test.com` and `System Administrator` for `adminchop@test.com`.
- Preserved `displayName` during onboarding profile completion (`src/pages/Onboarding.jsx`).
- Full verification passed (`npm run verify`: 20 test files, 104 tests, 0 color check errors, clean production build).

## Clarify Local Authentication Connection Errors (2026-11-12)
- Replaced the stale Supabase-specific fetch failure message with guidance for the current Vite API middleware and MySQL runtime.

## Add Customer Display Name Editing (2026-11-12)
- Added an editable customer display name and read-only email field to `/customer/profile`; the name is validated and persisted in the authenticated profile JSON, and auth responses expose it for display.

## Isolate Gemini Client Validation Test (2026-11-12)
- Prevented the Gemini model-list validation test from reading persisted Admin configuration or making a real upstream request; runtime configuration behavior is unchanged.

## Removal of Preloader Overlays and Skeleton Screen Blocking (2026-11-12)
- Removed active preloader overlays and full-screen blocking states across route guards and customer dashboard:
  - `src/routes/ProtectedRoute.jsx`: Removed `Preloader` overlay during authentication session checks; returns `null` so route transitions are seamless without intrusive simmering logo/bouncing dots.
  - `src/routes/ProfileGate.jsx`: Removed `Preloader` overlay during health profile loading; returns `null` for smooth client-side routing.
  - `src/pages/Login.jsx`: Removed `redirecting && <Preloader fullScreen />` overlay on successful authentication submission.
  - `src/pages/Dashboard.jsx`: Removed premature full-page `<DashboardSkeleton />` blocking return; the dashboard shell, hero, metrics, and meal tabs mount immediately while meals display inline `MealCardSkeleton` cards during recommendation fetching.
- Full verification passed (`npm run verify`: 20 test files, 103 tests, 0 color check errors, clean production build).

## Customer Dashboard Light Mode Text & Contrast Polish (2026-11-11)
- Resolved Light Mode text visibility, contrast, and empty states on `http://localhost:5174/customer/dashboard`:
  - **Avatar & Greeting Contrast**: Enhanced `AvatarDisplay` in `src/features/auth/preworkedAvatars.jsx` to render fallback letter initials in bold, high-contrast `text-on-primary-soft text-base` centered in the container, eliminating unstyled/faint letter fallbacks in `DashboardHero`.
  - **Tactile Metrics & Visual Gauges**:
    - Extracted `DashboardMetricsWidgets.jsx` to decouple `CapDonutMeter`, `WeeklyPacingBars`, and `MealTypeDistribution` from `DashboardMetrics.jsx`, keeping both files <= 214 lines.
    - Fixed `CapDonutMeter` perimeter track: replaced washed-out `stroke-surface-muted` with crisp `stroke-line` (`#C6DDD0`) for defined tactile circular track boundary on white cards in Light Mode.
    - Elevated `WeeklyPacingBars`: added defined `border border-line` to the daily bar tracks, and upgraded weekday letter labels (`M`, `T`, `W`, etc.) to crisp `text-fg` (`#0A2117`) instead of muted.
    - Upgraded `MealTypeDistribution`: wrapped breakfast, lunch, and dinner count chips in dedicated category border and background pills (`bg-cat-meals-bg border-cat-meals-line`, `bg-cat-planning-bg border-cat-planning-line`, `bg-cat-engine-bg border-cat-engine-line`) for prominent visual definition on light mode cards.
    - Standardized telemetry chips and footers across all 4 metric cards (`Target per Meal`, `Weekly Budget`, `Curated Dishes`, `Health Guardrails`) with `shadow-2xs` and crisp semantic font weights.
  - **Meal Tabs & Filter Pills Contrast**:
    - In `DashboardMealTabs.jsx`, enhanced inactive tab counts to display with defined `border border-line bg-surface-muted text-fg font-bold`, replacing faint text; upgraded the filter toggle button to bold `text-fg`.
    - In `FilterBar.jsx`, updated `<select>` options to explicitly set `bg-surface text-fg font-medium`, preventing OS/browser dropdown text rendering glitches in Light Mode; strengthened filter summaries and reset buttons.
  - **Meal Cards & Health Advisories**:
    - In `MealCard.jsx`, elevated cost subtitle (`text-[11px] font-semibold text-muted`), cost source tags (`border border-line bg-surface-muted px-2 py-0.5 text-[11px] font-semibold text-fg shadow-2xs`), and health tips.
    - In `SafetyBadge.jsx`, upgraded `MealTypeChip` and `SuitableForChip` to `font-bold text-fg shadow-2xs`.
    - In `HealthAdvisoryBanner.jsx`, elevated condition protocol badges with `border border-line bg-primary-soft text-on-primary-soft shadow-2xs`.
  - **Zero-Meals Empty State**: Added friendly empty state card in `src/pages/Dashboard.jsx` when meals list is empty and not loading, offering a direct action button to generate the first Nigerian meal plan instead of a blank layout.
  - Full verification suite passed (`npm run verify`: 20 test files, 103 tests, 0 color violations, clean production build).

## Add Temporary Docker Share Setup (2026-11-11)
- Added Docker Compose for the app, a local MySQL database, and a temporary Cloudflare Quick Tunnel; published app port `5190` (container port `5173`) for a distinct Docker Desktop local link and documented that remote testers need the tunnel URL. Added a PowerShell helper that generates ignored local test credentials and corrected local API runtime instructions to reflect Vite middleware.

## Admin Dashboard Light Mode Polish & Tactile Meter Elevation (2026-11-11)
- Elevated Light Mode tactile contours, card boundaries, and contrast across `/admin/dashboard` and admin page headers:
  - Enhanced `HealthDonutMeter` in `src/features/admin/AdminDashboardOverview.jsx`: replaced low-contrast `stroke-surface-muted` background track with crisp `stroke-line` (`#C6DDD0`), giving the radial diagnostic progress meter a clear, high-definition perimeter in light mode.
  - Enhanced `AdminPageHeader.jsx`: added tactile border contour and subtle elevation (`border border-line shadow-2xs`) to page badges across all admin subpages.
  - Verified Light Mode high-contrast typography, interactive active tab indicators, and tactile hover states across `AdminDashboardHero.jsx`, `AdminDashboardOverview.jsx`, `AdminDashboardDiagnostics.jsx`, `AdminDashboardSidebar.jsx`, and `AdminModulesGrid.jsx`.
  - Full verification suite passed (`npm run verify` passed: 20 test files, 103 tests, 0 color violations, clean production build).

## Customer Sidebar Light Mode Overhaul & Bento Architecture Unification (2026-11-11)
- Audited and elevated all 6 pages across the customer sidebar navigation in Light Mode:
  - **1. Dashboard (`/customer/dashboard`)**:
    - Polished `src/features/dashboard/DashboardHero.jsx` button labels and direct routes (`🍲 All Meals` -> `/customer/meals`, `📊 Analysis` -> `/customer/analysis`, `⚙️ Preferences` -> `/customer/profile`).
    - Verified high-contrast typography, crisp borders, and status pills in light mode.
  - **2. Meal Analysis (`/customer/analysis`)**:
    - Verified light mode readability on `AnalysisHero.jsx`, `MealSelectorTabs.jsx`, `SelectedMealSummary.jsx`, `ClinicalThresholdsCard.jsx`, and `NutritionPanel.jsx`.
  - **3. Approved Meals (`/customer/meals`)**:
    - Created `src/features/meals/MealsHero.jsx`: Bento hero header with live clock, telemetry pills (total approved dishes, quick prep options, and favourites saved count), and quick navigation actions.
    - Created `src/features/meals/MealsFilters.jsx`: Interactive filter bar with period tabs (`All Dishes`, `Breakfast`, `Lunch`, `Dinner`), health suitability condition pills (`Low Sodium`, `Low GI`, `Calorie Managed`, `Gentle & Mild`), prep time select, and instant search with clear button.
    - Re-architected `src/pages/CustomerMeals.jsx` to modularize rendering and maintain all functions <= 40 lines and file <= 236 lines.
  - **4. Favourite Meals (`/customer/saved`)**:
    - Created `src/features/meals/SavedHero.jsx`: Bento hero banner with live clock, personal favourites telemetry (total saved, breakfast/lunch/dinner breakdown), and quick action links.
    - Created `src/features/meals/SavedMealCard.jsx`: Tactile Bento recipe cards with prep time, formatted Naira ingredient cost, title, description, condition chips, and remove action.
    - Re-architected `src/pages/Saved.jsx` into modular helper components with period tabs, search filtering, and confirmation modals.
  - **5. Recipe Catalogue (`/customer/recipes`)**:
    - Verified light mode styling across `CatalogHero.jsx`, `CatalogFilters.jsx`, and `CatalogRecipeCard.jsx`.
  - **6. Profile & Preferences (`/customer/profile`)**:
    - Fixed badge variant bug in `src/features/profile/ProfileOverviewCard.jsx` (`variant="ok"` instead of invalid `"success"`).
    - Verified light mode contrast on onboarding step forms (`Step1Demographics`, `Step2Conditions`, `Step3Preferences`, `Step4Budget`).
  - Full verification suite passed (`npm run verify` passed: 20 test files, 103 tests, 0 color violations, clean production build).

## Fix Light Mode Text Invisibility on Recipe Catalogue and Across Application (2026-11-11)
- Resolved CSS custom property circular dependency bug in `src/styles/theme.css`:
  - Removed accidental self-referencing and circular property definitions from `@theme inline`:
    - `--color-muted: var(--color-muted);` (was self-referencing, causing `text-muted` and `text-muted-foreground` to resolve to unset/invalid at computed-value time in light mode).
    - `--color-primary: var(--primary);` (was circularly dependent with `:root { --primary: var(--color-primary); }`, breaking `.bg-primary` and `.text-primary` in light mode).
    - `--color-ring: var(--ring);` (was circularly dependent with `:root { --ring: var(--color-ring); }`).
  - Restored static theme definitions from `@theme static` in light mode (`--color-muted: #2A4838`, `--color-primary: #047857`, `--color-ring: #047857`), allowing all headings, descriptions, buttons, filter chips, prices, and recipe text on `/customer/recipes` and across the application to render with crisp, high-contrast typography in light mode.
  - Full verification suite passed (`npm run verify` passed: 20 test files, 103 tests, 0 color violations, clean production build).

## Redesign Admin Dashboard into an Executive Operations Center (2026-11-11)
- Re-architected `/admin/dashboard` into an executive-grade, tactile operations hub adhering strictly to semantic design tokens, WCAG AAA contrast, and file/function line limits:
  - Overhauled `src/features/admin/AdminDashboardHero.jsx`:
    - Replaced decorative SVG rings with a sleek, high-density operations command header.
    - Integrated live ticking telemetry clock, pulsing health status indicator, environment badges, and quick-action telemetry refresh and diagnostic suite runners.
    - Enhanced failing services triage banner with immediate remediation links.
  - Re-engineered `src/features/admin/AdminDashboardOverview.jsx`:
    - Refactored into a high-impact executive KPI matrix (System Health Index with SVG radial meter, Real Calculated Response Latency, Bootstrap Security Credentials status pills, and Nigerian Market Ingredient Pricing index).
    - Reduced from 304 lines to 218 lines, ensuring all sub-functions remain <= 40 lines.
  - Upgraded `src/features/admin/AdminDashboardDiagnostics.jsx`:
    - Added interactive category filters (`All Checks`, `APIs & Data`, `Pipelines`).
    - Added dedicated service iconography (Database, Gemini Brain, USDA Leaf, Pipeline Engine, Nutrition Scale).
    - Added one-click individual service re-testing directly from each service card, latency indicators, and last-tested timestamp.
  - Created `src/features/admin/AdminDashboardSidebar.jsx`:
    - Dedicated infrastructure companion column consolidating Bootstrap Security Credentials, Quick Operations triage shortcuts (Cache flush, Rate limits, Evaluation runner, Audit logs), and Platform Stack specification.
  - Redesigned `src/features/admin/AdminModulesGrid.jsx`:
    - Grouped all 11 admin modules into clean, logical categories (`AI & Integrations`, `Clinical & Prices`, `Governance & Ops`).
    - Added interactive category filter tabs, category badges, tactile elevated containers, and directional affordances.
  - Updated `src/pages/admin/AdminDashboard.jsx`:
    - Orchestrated the new executive layout into a cohesive 2-column bento architecture with clean section headers.
  - Verified full test suite (`npm run verify` passed: 20 test files, 103 tests, 0 color violations, clean production build).

## Rename Sidebar Link from "Approved Meals" to "Meals" (2026-11-10)
- Renamed the customer sidebar navigation item for `/customer/meals` from "Approved Meals" to "Meals" in `src/components/app-shared.jsx`.
- Updated navigation route unit tests in `src/lib/routes.test.js` to assert that `ROUTES.customer.meals` displays with title `"Meals"`.
- Full verification suite passed (20 test files, 103 tests, 0 color violations, clean production build).

## Redesign Shared Recipe Catalogue with Professional Tactile Bento Architecture (2026-11-09)
- Redesigned the Shared Recipe Catalogue (`/customer/recipes`) into an interactive, high-fidelity tactile Bento Grid workspace matching the neo-skeuomorphic design system:
  - Created `src/features/catalog/CatalogHero.jsx`:
    - Tactile hero banner with live clock, live portfolio telemetry pills (total published recipes, Nigerian staples, USDA & AI verified cost breakdowns), and quick action links (`My Meal Plan`, `Saved Favourites`, and `+ Manage Catalogue` for administrators).
  - Created `src/features/catalog/CatalogFilters.jsx`:
    - Responsive search input with 1-click clear button.
    - Meal period tab bar (`All Dishes`, `Breakfast`, `Lunch`, `Dinner`) with active tactile pills.
    - Health & Clinical profile quick-filter chips (`All Profiles`, `Low Sodium`, `Low GI / Diabetes`, `Calorie Managed`, `Gentle & Mild`).
  - Created `src/features/catalog/CatalogRecipeCard.jsx`:
    - Tactile Bento recipe cards featuring meal type badges, prep time metrics, interactive favourite heart toggle connected to `/api/auth` (`save-meal` / `delete-saved-meal`), formatted Naira ingredient cost estimate, description, caution notes, macro badges (calories, protein, carbs), clinical suitability tags, collapsible ingredient & instruction steps quick-view, and direct link to full recipe details.
  - Re-architected `src/pages/RecipeCatalog.jsx`:
    - Modularized page layout with stateful search, period filtering, health tag filtering, real-time favourites toggling with optimistic UI updates, tactile pagination controls, empty search states, and cost disclaimer.
  - Full verification suite passed (20 test files, 103 tests, 0 color violations, clean production build).

## Redesign Customer Meal Analysis with Professional Tactile Bento Architecture (2026-11-09)
- Transformed the Customer Meal Analysis page (`/customer/analysis`) from a plain select dropdown into a comprehensive, professional clinical nutrition workspace matching the tactile Bento design system:
  - Created `src/features/analysis/AnalysisHero.jsx`:
    - Bento hero banner with live clock, quick-navigation actions, and portfolio indexing telemetry pills (Active Plan, Saved Favourites, and Catalogue recipes).
  - Created `src/features/analysis/MealSelectorTabs.jsx`:
    - Multi-source filter tabs (`All Dishes`, `Current Plan`, `Favourites`, `Catalogue`) with live count badges.
    - Instant dish search input filtering by meal name or description.
    - Tactile Bento meal card picker grid with meal type icons, prices, source indicators, and tactile active selection highlights.
    - Clean accessible fallback dropdown for rapid keyboard navigation.
  - Created `src/features/analysis/SelectedMealSummary.jsx`:
    - Tactile overview card displaying dish title, description, meal type chip, estimated preparation time, ingredient cost in Naira, caution notes, condition suitability tags, and direct recipe links.
  - Created `src/features/analysis/ClinicalThresholdsCard.jsx`:
    - Evidence-based clinical nutrition reference card outlining sodium limits for hypertension, glycemic controls for diabetes, calorie management for obesity, gastric-soothing protocols for ulcers, and USDA vs AI estimation standards.
  - Re-architected `src/pages/CustomerAnalysis.jsx` into a balanced, responsive 2-column workspace layout with sticky reference panels and non-blocking error handling.
  - Full verification suite passed (20 test files, 103 tests, 0 color violations, clean production build).


## Confirm Onboarding Completion and Return to Sign-In (2026-11-09)
- After a successful profile save, show a setup-complete toast, sign the customer out, and return to `/customer/login`; updated FR2 acceptance criteria.

## Integrate Real-Time Date and Live Day Tracking (2026-11-09)
- Integrated dynamic real-time date and clock tracking across the application, eliminating hardcoded day states:
  - Added pure date/time calculation and formatting utilities in `src/lib/format.js` (`getDayOfWeekIndex`, `formatCurrentDate`) with full test coverage in `src/lib/format.test.js`.
  - Created `src/components/LiveClock.jsx`: a tactile, live-ticking pill component showing real-time formatted date, day of week, and live clock with a subtle pulsing activity indicator.
  - Replaced the static Friday highlight in `WeeklyPacingBars` (`src/features/dashboard/DashboardMetrics.jsx`) with dynamic real-time day tracking (`todayIndex`):
    - Automatically highlights the real current day of the week (e.g. `M` on Monday) with active accent coloring (`bg-cat-meals-dot`), bold day letter, and an indicator dot.
    - Updated the "Weekly Budget" tile header tag to display the live current day (`Mon · Active`) and footer to show the current calendar date (`9 Nov`).
  - Added live date and clock displays to:
    - Global sticky top navigation header (`src/components/app-header.jsx`).
    - Customer Dashboard hero greeting (`src/features/dashboard/DashboardHero.jsx`).
    - Admin Dashboard hero header (`src/features/admin/AdminDashboardHero.jsx`).
  - Full verification suite passed (20 test files, 103 tests, 0 color violations, clean production build).


## Remove Plan and Guardrail Chips from Customer Dashboard (2026-11-09)
- Removed the "ChopWise Nutrition Plan" and "Health Guardrails Active · Manage" chips from the customer dashboard hero while preserving the customer's profile and health-advisory functionality elsewhere on the page.

## Configure Bootstrap Administrator IDs Directly From Frontend (2026-11-09)
- Added capability to configure and persist bootstrap administrator IDs (`ADMIN_UIDS`) directly from the frontend without manual `.env` file editing or server restarts:
  - Added `BootstrapConfigCard` in `src/pages/admin/AdminAccess.jsx` (`/admin/access`):
    - Real-time indicator displaying configuration status (`Configured (database)`, `Configured (environment)`, or `Missing`).
    - Comma-separated input for bootstrap administrator account IDs.
    - 1-click quick-add buttons (e.g. `⚡ test-admin-001 (Test Admin)`).
    - Save action calling `/api/admin` with action `'saveBootstrapAdminIds'`.
  - Added database persistence in `admin_config` section `'bootstrap'` and dynamic synchronization in `api/_lib/auth.js` (`setDynamicBootstrapAdminIds`).
  - Added direct **"Configure in Frontend →"** button on the `ADMIN_UIDS` item in `src/features/admin/BootstrapChecklist.jsx` linking directly to `/admin/access`.
  - Updated `handleStatus()` in `api/admin.js` to recognize database-configured bootstrap IDs as satisfying `adminUidsSet: true`.
  - Full verification suite passed (20 test files, 100 tests, 0 color violations, clean production build).

## Transform Status and Error Alerts into Actionable Destination Links (2026-11-09)
- Converted passive status warnings, diagnostic alert badges, and condition banners into actionable direct links pointing to the exact configuration or triage screen:
  - `src/features/admin/AdminDashboardHero.jsx`:
    - Linked the hero status badge (`overallStatus`) to relevant resolution screens:
      - `Setup in progress` / `Action required` $\to$ `/admin/integrations` (or `/admin/checklist` if credentials incomplete) with hover CTA (`· Configure API keys →` / `· Complete setup checklist →`).
      - `System operational` $\to$ `/admin/checklist` (`· View readiness checklist →`).
  - `src/features/admin/AdminDashboardOverview.jsx`:
    - Made all 4 Bento overview metric tiles clickable navigation links:
      - `System Checks` $\to$ `/admin/analysis`
      - `Diagnostic Health` $\to$ `/admin/integrations`
      - `Review Attention` $\to$ `/admin/integrations` (or `/admin/analysis`)
      - `Bootstrap Security` $\to$ `/admin/checklist`
    - Linked each row in `BootstrapReadiness` directly to `/admin/checklist` so clicking missing credentials takes the administrator directly to the configuration guidance.
  - `src/features/admin/AdminDashboardDiagnostics.jsx`:
    - Mapped each service diagnostic card to its specific configuration screen (`gemini` $\to$ `/admin/gemini`, `usda` $\to$ `/admin/usda`, `mysql` $\to$ `/admin/checklist`, pipelines $\to$ `/admin/integrations`).
    - Added direct "Resolve issue →" / "Configure →" links and clickable status badges.
  - `src/features/dashboard/DashboardHero.jsx` & `HealthAdvisoryBanner.jsx`:
    - Linked customer health guardrail alerts directly to `/customer/profile` ("Manage health guardrails in Preferences →").
  - `src/features/meals/DashboardError.jsx`:
    - Updated `NotConfiguredCard` to link directly to `/admin/gemini` for immediate API key configuration.
  - Full verification suite passed (20 test files, 100 tests, 0 color violations, clean production build).


## Enhance Hourly Rate Limit Error Display with Live Retry & Quota Diagnostics (2026-11-09)
- Transformed the static "Hourly Request Limit Reached" alert into an interactive diagnostic and recovery center in `src/features/meals/DashboardError.jsx`:
  - Added a 1-click **Refresh / Try Again** button with animated checking spinner that re-probes `/api/recommend` via `onRetry`.
  - Added a live countdown badge displaying remaining reset time (`Reset in Xm Ys`) using real-time countdown against `error.details.retryAfterSeconds`.
  - Added an interactive **Why am I seeing this?** details toggle that expands a clear diagnostic card explaining:
    - Why the quota exists (protects Gemini AI budget, maintains server responsiveness).
    - Quota specifications (up to 10 live meal generations per rolling 60-minute window).
    - Unrestricted features (Recipe Catalogue and Favourite meals remain 100% accessible with zero quota consumption).
    - Direct shortcuts to `/customer/recipes`, `/customer/saved`, and `/admin/settings` (for admins to adjust the limit).
  - Maintained strict code limits (all functions $\le$ 40 lines, file $\le$ 207 lines, 0 raw color violations).
  - Full verification suite passed (20 test files, 100 tests, clean production build).

## Emulate Tactile Dark Bento Design on Admin Dashboard (2026-11-09)
- Transformed the Admin Dashboard (`/admin/dashboard`) into a tactile Bento Grid design matching the neo-skeuomorphic widget aesthetic with ChopWise's semantic design tokens:
  - Re-engineered `src/features/admin/AdminDashboardOverview.jsx`:
    - **Diagnostic Health Tile**: Circular SVG donut meter displaying live passing test percentage (`stroke-primary` on `stroke-surface-muted`) with numerical readout.
    - **Review Attention Tile**: 6-bar mini latency and health sparklines displaying live diagnostics response times and status indications.
    - **Bootstrap Security Tile**: 4-segment tactile credential status pills for MySQL, Admin UIDs, JWT signing, and Encryption key.
    - **System Checks Tile**: Total registered checks counter with category telemetry badge.
    - **Bootstrap Readiness Checklist**: Tactile `rounded-2xl` container with elevated `rounded-xl` items and hover depth.
  - Enhanced `src/features/admin/AdminDashboardHero.jsx` and `FailingServicesAlert` with tactile `rounded-2xl` curvature, ambient elevation, and interactive press states.
  - Enhanced `src/features/admin/AdminDashboardDiagnostics.jsx` with tactile `rounded-2xl` diagnostic tiles and latency indicator pills.
  - Enhanced `src/features/admin/AdminModulesGrid.jsx` with tactile `rounded-2xl` module tiles, elevated icon containers, and interactive hover/active press feedback.
  - Verified full compliance: 20 test files, 100 passed tests, 0 color violations via `check:colors`, clean production build.


## Emulate Tactile Dark Bento Design on Customer Dashboard (2026-11-09)
- Transformed the Customer Dashboard (`/customer/dashboard`) metrics and cards into a tactile Bento Grid design matching the tactile/neo-skeuomorphic widget aesthetic with ChopWise's semantic design tokens:
  - Re-engineered `src/features/dashboard/DashboardMetrics.jsx`:
    - **Target per Meal Tile**: Circular SVG donut meter showing cap efficiency with `stroke-primary`, ambient track `stroke-surface-muted`, and percentage readout.
    - **Weekly Food Budget Tile**: 7-day mini bar histogram simulating daily pacing allocation with `bg-cat-meals-dot` and `bg-primary` on `bg-surface-muted`.
    - **Recommended Dishes Tile**: Multi-segment pill distribution bar for Breakfast, Lunch, and Dinner with period counts and average preparation time.
    - **Health Guardrails Tile**: Tactile guardrail tags for declared medical conditions and deterministic safety verification badge.
    - All tiles feature tactile `rounded-2xl` elevation, crisp hairline borders (`border-line`), hover lift (`hover:-translate-y-0.5 hover:shadow-md`), and tactile press feedback (`active:scale-[0.99]`).
  - Enhanced `src/features/dashboard/DashboardHero.jsx` and `src/features/dashboard/DashboardMealTabs.jsx` with tactile pill buttons, shadow elevation, and smooth press states.
  - Enhanced `src/features/meals/MealCard.jsx` with `rounded-2xl` curvature and tactile hover/active card affordances.
  - Full verification suite passed (20 test files, 100 tests, 0 color violations via `check:colors`, clean production build).


## Remove Top Header from Customer and Admin Login Pages (2026-11-09)
- Removed the top header bar (ChopWise logo and theme toggle) from both customer and admin login views:
  - Added `hideHeader = false` prop to `src/features/auth/AuthCardLayout.jsx`.
  - Configured `src/pages/Login.jsx` to pass `hideHeader={true}` to `AuthCardLayout`, hiding the top bar on `/customer/login` and `/admin/login` while centering the login card cleanly in the viewport.
  - Kept all file and function constraints in full compliance (both files $\le$ 248 lines, functions $\le$ 40 lines).
  - Full verification suite passed (20 test files, 100 tests, 0 color violations, clean production build).

## Style Modern Thin Scrollbars Across Application (2026-11-09)
- Replaced bulky, native 17px Windows scrollbars and buttons with a sleek, 6px modern scrollbar across all scrollable containers (window, sidebar, modals, cards):
  - Added global `@layer base` scrollbar rules in `src/styles/theme.css` and `starter/theme.css`:
    - `scrollbar-width: thin` and `scrollbar-color: var(--color-field-line) transparent` for standard browser engines (Firefox, Chromium).
    - `::-webkit-scrollbar` configured to 6px width/height with rounded pill thumb (`var(--color-line)` hovering to `var(--color-field-line)`).
    - Removed blocky up/down arrow buttons (`::-webkit-scrollbar-button { display: none; }`) and transparent track background.
  - Added `.no-scrollbar` utility for elements requiring completely hidden scrollbars.
  - Preserved strict file size limits ($\le$ 240 lines) and semantic color compliance across light and dark modes.
  - Full verification suite passed (20 test files, 100 tests, 0 color violations, clean production build).

## Assign Distinct Semantic Colors to Sidebar Categories (2026-11-09)
- Styled each category in the customer and admin sidebars (and mobile drawer) with a distinct semantic color identity:
  - `Planning & Insights` / `Overview & Monitoring`: Sky Blue badge & dot (`cat-planning`)
  - `Meals & Recipes` / `Food & User Operations`: Warm Amber culinary badge & dot (`cat-meals`)
  - `Account & Health`: Mint & Emerald wellness badge & dot (`cat-health`)
  - `AI & Clinical Engine`: Royal Lavender & Purple badge & dot (`cat-engine`)
  - `Governance & Tools`: Soft Rose & Crimson security badge & dot (`cat-governance`)
- Created semantic tokens with WCAG AAA contrast in `src/styles/theme.css` and `starter/theme.css` for both light and dark modes.
- Added colored indicator dots and category pill badges to category headers in `src/components/nav-group.jsx` and `src/components/MobileDrawer.jsx`.
- Tinted resting category menu icons to harmonize with each category's distinct color theme while preserving the active route indicator bar.
- Refactored `NavMenuItem` to keep all functions $\le$ 40 lines and added route tests in `src/lib/routes.test.js`.
- Verified 100% clean check: 20 test files, 100 passed tests, 0 color violations, clean production build.

## Fix Runtime Crash in Navigation Sidebar and Enhance Error Diagnostics (2026-11-09)
- Fixed root-cause crash triggering the application ErrorBoundary:
  - Added missing `import { cn } from "cn"` to `src/components/nav-group.jsx`, resolving runtime `ReferenceError: cn is not defined` inside `navItemClassName(active)` that caused entire page layout crashes across Customer and Admin portals.
  - Enhanced `src/components/ErrorBoundary.jsx` to render explicit error diagnostics (`error.message`) in the UI to prevent opaque generic error screens.
  - Exported `AuthContext` from `src/features/auth/AuthContext.jsx` for clean provider access.
- Full verification suite passed (20 test files, 98 tests, 0 color violations, clean Vite build).

## Unify Active Dashboard Navigation Styling (2026-11-09)
- Matched the selected sidebar item to the supplied reference: rounded muted surface, slim primary edge marker, emphasized label/icon, and trailing chevron.
- Refined the selected row to remove the heavy outline, added a visible keyboard-focus ring, and shared the styling and route detection across customer/admin sidebars and the mobile drawer.
- Added `aria-current="page"` and tests for both route matching and the shared active-row treatment.
- Documented the navigation treatment in `UI_GUIDELINES.md`.
- Reduced selected navigation corner radius to `rounded-md` for a squarer appearance across desktop, nested, and mobile destinations.

## Fix Avatar Apply Action and Persistence (2026-11-09)
- Resolved Apply Avatar button failure in `AvatarPickerModal.jsx`:
  - Corrected `useToast()` usage from destructuring `{ showToast }` to consuming the `addToast` function directly with standard variant token `'ok'`.
  - Guaranteed `update-avatar` persists to MySQL `users.avatar` and `users.profile` and closes the modal seamlessly.
- Full verification suite passed (20 test files, 98 tests, 0 color violations, clean Vite build).

## Persist Customer Avatar to Database and Display (2026-11-09)
- Fixed avatar persistence and live synchronization across user sessions:
  - Added MySQL database migration in `api/_lib/mysql.js` ensuring `avatar LONGTEXT NULL` column exists in the `users` table.
  - Updated `api/auth.js` (`update-avatar`, `update-profile`, `login`, and `me`) to persist and retrieve the user's avatar both directly on the `users.avatar` column and within the `users.profile` JSON document.
  - Updated `src/features/auth/AuthContext.jsx` to immediately reload the user profile from the server on avatar updates.
  - Updated `src/features/auth/AvatarPickerModal.jsx` to correctly preview vector avatars, support client-side photo resizing, and set title to "Choose Profile Avatar".
  - Updated `src/features/profile/ProfileOverviewCard.jsx`, `src/features/dashboard/DashboardHero.jsx`, and `src/components/nav-user.jsx` to consistently render the user's avatar.
  - Updated `src/pages/Profile.jsx` (`handleSaveProfile`) to preserve the user's avatar when updating dietary preferences and budget settings.
  - Full verification suite passed (20 test files, 97 tests, 0 color violations, clean Vite build).

## Categorize Sidebar Navigation Links (2026-11-09)
- Structured Customer App and Admin Portal navigation sidebars into clear, intuitive categories in `src/components/app-shared.jsx`:
  - Customer navigation categorized into:
    1. `Planning & Insights` (Dashboard, Meal Analysis)
    2. `Meals & Recipes` (Approved Meals, Favourite meals, Recipe Catalogue)
    3. `Account & Health` (My profile)
  - Admin navigation categorized into 4 enterprise operational domains:
    1. `Overview & Monitoring` (Admin Dashboard, System Analysis, Evaluation Suite, Activity History)
    2. `Food & User Operations` (Recipe Catalogue, Customer Accounts, Ingredient Prices)
    3. `AI & Clinical Engine` (API Integrations, Recommendation Settings, Safety Thresholds)
    4. `Governance & Tools` (Administrator Access, Setup Checklist, Maintenance)
- Enhanced section header styling in `src/components/nav-group.jsx` with prominent uppercase tracking (`text-[11px] font-bold uppercase tracking-wider text-muted px-2`) and preserved active route highlighting, breadcrumb generation, and mobile navigation compatibility.
- Updated route tests in `src/lib/routes.test.js` to assert against categorized group structures. Full verification passed: 20 test files, 97 passed, 0 color token violations, and clean production build.

## Polish Admin Dashboard Presentation (2026-11-09)
- Refined `/admin/dashboard` into a responsive system-operations overview with health status, diagnostic KPI cards, service results, bootstrap readiness indicators, and streamlined admin module navigation.
- Kept dashboard information sourced from the existing admin status response and documented the layout in `ADMIN_PAGE_SPEC.md`.

## Configure Profile Picture & Avatar Upload for Customers (2026-11-09)
- Relocated the profile picture and avatar upload feature from the admin portal to customer accounts:
  - Enabled customers to choose from 7 pre-designed Nigerian culinary/wellness avatars or upload a custom photo.
  - Added "Change Picture" button and live avatar display on Customer Profile overview (`ProfileOverviewCard.jsx` at `/customer/profile`).
  - Added customer avatar display next to greeting on Customer Dashboard hero (`DashboardHero.jsx` at `/customer/dashboard`).
  - Added "Change Profile Picture" action in top-right user menu dropdown (`NavUser.jsx`) specifically for customer sessions while keeping admin dropdown strictly administrative.
  - Removed avatar management components from the Admin Dashboard, keeping it focused on system telemetry.
  - Full verification suite passed (20 test files, 97 tests passed, 0 color token violations, and clean production build).

## Make Admin Dashboard System-Only (2026-11-09)
- Replaced customer-support analytics charts and unsupported dashboard metrics with live system diagnostics, persisted test results, and bootstrap readiness from the admin status response.
- Removed the customer-app shortcut and administrator profile card from the dashboard; updated `ADMIN_PAGE_SPEC.md` to document the system-only overview.

## Add Preworked & Designed Avatars for Admin Profile Pictures (2026-11-09)
- Built a collection of 7 curated, professional, Nigerian culinary and platform-themed preworked vector avatars in `public/avatars/` and `src/features/auth/preworkedAvatars.jsx`:
  - `Chef Babatunde` (Executive Head Chef / Kitchen Director)
  - `Chef Ngozi` (Traditional Soups & Taste Director)
  - `Dr. Amina` (Clinical Dietitian / Nutritional Health Lead)
  - `Cmdr. Danjuma` (Security & Operations Administrator)
  - `Maestro Obinna` (Naija Food & Cultural Connoisseur)
  - `Specialist Zainab` (Portion & Calorie Measurement Lead)
  - `Scout Emeka` (Market Price Table Auditor)
- Created `src/features/auth/AvatarPickerModal.jsx` featuring:
  - 1-click selection from the gallery of preworked designs with role badges and previews.
  - Optional custom image upload tab with automated client-side canvas square-cropping and compression.
- Created `src/features/admin/AdminProfileCard.jsx` embedded into `src/pages/admin/AdminDashboard.jsx` showcasing the administrator's active avatar, platform role, email, and one-click "Choose Profile Avatar" launcher.
- Enhanced `src/components/nav-user.jsx` with `<AvatarDisplay>` rendering the active avatar in top-right app header dropdowns and added a "Change Avatar" menu item.
- Added server action `update-avatar` in `api/auth.js` and `updateAvatar()` in `AuthContext.jsx` with native persistence in `users.profile` and `avatar` attributes on login, register, and `/api/auth {action: 'me'}`.
- Added unit tests in `src/features/auth/preworkedAvatars.test.js`. Full verification passed: 20 test files, 97 passed, 0 color token violations, and clean production build.

## Fix Light Mode & Dark Mode Contrast and Card Clarity (2026-11-09)
- Resolved irregularities and low contrast across Light Mode and Dark Mode:
  - Adjusted Light Mode `--color-page` from `#FFFFFF` to `#F6F9F7` (soft mint off-white canvas) so pure white `--color-surface` (`#FFFFFF`) cards and popovers have crisp, distinct physical depth and separation from the background.
  - Deepened Light Mode `--color-muted` to `#2A4838` and `--color-fg` to `#0A2117`, elevating text contrast to $\ge$ 9.0:1 (AAA standard) across all labels, small captions, subtitles, and badges.
  - Refined Light Mode `--color-line` to `#C6DDD0` and `--color-field-line` to `#4D755F` for sharp, visible card boundaries and high-contrast form inputs.
  - Enhanced `src/components/Card.jsx`, `FilterBar.jsx`, `DashboardHero.jsx`, and `DashboardMetrics.jsx` with natural elevation (`shadow-xs`), bold category headers, and high-contrast chips (`SuitableForChip`, `Badge`).
  - Added avatar graphic illustration file to color check skips and replaced backdrop class in `AvatarPickerModal.jsx` with semantic `bg-overlay/60`.
  - Updated `docs/UI_GUIDELINES.md` token reference; verified full suite: 20 test files, 97 passed, 0 color token violations, and clean production build.

## Add Customer and Admin Analysis Pages (2026-11-09)
- Added `/customer/analysis` to choose a current recommendation, saved meal, or catalogue recipe and reuse the existing AI feedback and USDA nutrition actions.
- Added `/admin/analysis` for Gemini/USDA readiness and persisted live-test results, with refresh and individual/all diagnostic controls; no customer-usage analytics or storage were added.
- Registered the routes, linked both pages from their dashboard and navigation, added route/navigation tests, and documented the scope in `REQUIREMENTS.md`, `ADMIN_PAGE_SPEC.md`, and `PROJECT_CONTEXT.md`.

## Consolidate External APIs and Functions into Unified "API Integrations" Page (2026-11-09)
- Replaced fragmented admin navigation entries ("Functions & APIs", "Gemini AI", and "USDA FoodData Central") with a single unified **"API Integrations"** page at `/admin/integrations` (`ROUTES.admin.integrations`).
- Built `src/pages/admin/AdminIntegrations.jsx`:
  - Top health metrics and KPI cards summarizing Google Gemini AI status, USDA FoodData Central status, and live serverless endpoint diagnostic health.
  - Interactive view switcher tabs ("All API Integrations", "Google Gemini", "USDA FoodData", and "Functions & Verification Table") with deep-linking and URL search/hash synchronization (`?tab=gemini`, `?tab=usda`, `?tab=functions`).
  - Unified external integration cards for Gemini (with live model picker, credentials, help guides, and test runner) and USDA (with toggle, credentials, and test runner).
  - Embedded live serverless functions diagnostic table with "⚡ Test All APIs" and "↻ Refresh Status" global controls.
- Configured backward-compatible redirects in `src/App.jsx` from `/admin/gemini`, `/admin/usda`, and `/admin/functions` to `/admin/integrations`.
- Updated `ADMIN_MODULES` in `AdminDashboard.jsx`, `adminNavGroups` in `app-shared.jsx`, `src/lib/routes.js`, `src/lib/routes.test.js`, and `docs/ADMIN_PAGE_SPEC.md`.
- Verified clean passing suite: 19 test files (95 tests passed), 0 color token violations, and production build succeeded.

## Redesign and Professionalize Customer Dashboard (2026-11-09)
- Redesigned `http://localhost:5174/customer/dashboard` into an executive, highly professional dietary meal planning hub:
  - Created `src/features/dashboard/DashboardHero.jsx` featuring dynamic time-of-day greeting ("Good morning / afternoon / evening"), active health guardrails badge, budget cap summary, and instant quick-action controls ("⚡ Regenerate Plan", "Browse Catalogue", "Preferences").
  - Created `src/features/dashboard/DashboardMetrics.jsx` replacing generic template cards with domain-specific nutrition and financial metric cards (Target per meal with hard cap badge, Weekly budget, Recommended meals with cache status, and Health guardrails with active condition tags).
  - Created `src/features/dashboard/HealthAdvisoryBanner.jsx` dynamically rendering clinical evidence-based dietary protocols (Hypertension low-sodium, Diabetes glycemic control, Obesity portion management, Ulcer gastric-soothing).
  - Created `src/features/dashboard/DashboardMealTabs.jsx` providing segmented meal period tabs ("All Dishes", "🌅 Breakfast", "☀️ Lunch", "🌙 Dinner") with live count badges and a collapsible toggle for advanced multi-dimensional filtering.
  - Streamlined `src/pages/Dashboard.jsx` (reduced to 215 lines) while strictly maintaining semantic theme token compliance.
  - Verification passed: 19 test files, 95 tests passed, 0 color token violations, and clean production build.

## Wire Meal Feedback and USDA Features Into Existing Pages (2026-11-09)
- Confirmed customer meal detail is routed at `/customer/meal/:id`, with the AI feedback and USDA lookup actions in its nutrition panel; confirmed the Admin Gemini and USDA pages are routed and linked in the admin navigation with existing status, configuration, save, and live-test controls.
- Updated Gemini/USDA integration descriptions and Admin page documentation to explain how those integrations power the customer meal-detail actions.

## Add AI Meal Feedback and Explicit USDA Lookup (2026-11-09)
- Added separate "Verify with AI" and "Check USDA data" actions to the customer meal nutrition panel. AI feedback is general, non-medical, validated on the server, and does not send profile data; USDA refresh bypasses the nutrition cache and explains when its data is unavailable.
- Extended `POST /api/nutrition` with validated actions and documented the new response shapes and behavior in `docs/API.md`, `docs/AI_AND_NUTRITION_SPEC.md`, and `docs/REQUIREMENTS.md`.

## Universal Dashboard Notification Center (2026-11-09)
- Built a comprehensive real-time notification system across all customer and admin dashboards:
  - Created `src/features/notifications/notificationTypes.js` providing notification creation, relative timestamp formatting, marking read, and filtering helpers with full unit test coverage (`src/features/notifications/notificationTypes.test.js`).
  - Created `src/features/notifications/NotificationContext.jsx` with persistent local storage, custom event listener, unread count badge, and automated synchronization of newly approved catalogue dishes.
  - Built `src/components/NotificationBell.jsx` and `src/components/NotificationPopover.jsx` integrated directly into the universal `AppHeader`, offering an accessible notification bell with pulse badge, interactive popover, "All" vs "Unread" tabs, direct deep-link navigation, mark all read, and dismiss actions.
  - Connected real-time event triggers across:
    - Meal plan regeneration in `src/pages/Dashboard.jsx`.
    - Profile preferences, health conditions, and budget updates in `src/pages/Profile.jsx`.
    - Favourites save/remove toggles in `Dashboard.jsx`, `CustomerMeals.jsx`, and `MealDetail.jsx`.
    - Admin recipe creation, update, and deletion in `src/pages/admin/AdminRecipes.jsx`.
  - Added unit test suite; 18 test files and 90 tests passing, 0 color token violations, and clean production build.

## Thesis Requirements Audit, Verification & Implementation (2026-11-09)
- Audited and verified all 9 Core Functional Requirements (FR1–FR9, Section A) against the BSc thesis report (Chapters 1–3).
- Implemented Thesis Claim B5: Added schedule-aware preparation time filtering (`all`, `⚡ Quick ≤ 30 mins`, `Standard > 30 mins`) to `FilterBar.jsx`, `Dashboard.jsx`, and `CustomerMeals.jsx` to satisfy the quick-meal recommendation claim for busy workers.
- Implemented Thesis Claim B4: Elevated `cautionNotes` into a prominent "💡 Health Recommendation & Dietary Guidance" callout badge on `MealCard.jsx` and `MealDetail.jsx`.
- Verified Section B textual claims: health conditions shaping meals from the start (B1), weekly budget mapped to per-meal cap (`weeklyBudgetNGN / 21`, B2), authentic Nigerian staples (B3), saved meals in MySQL (B6), and the 4 thesis research gaps closed (B7).
- Verified Section C (7 Quality NFRs: 3-click flow, 5s AI generation, error resilience, scrypt/JWT security, scalable architecture, 375px responsive design, modular React components) and Section D evaluation objectives.
- Created thesis verification matrix artifact `thesis-features-audit-and-plan.md` documenting code locations, verification procedures, and thesis reconciliations.
- Full verification suite passed: 17 test files, 84 tests passed, 0 color token violations, and clean production build.

## Improve Customer Profile Page Layout (2026-11-09)
- Redesigned `http://localhost:5174/customer/profile` with a modern, modular responsive layout.
- Created `src/features/profile/ProfileOverviewCard.jsx` showing the customer's account identity banner, active profile status, and quick-glance metric boxes: weekly budget, target per meal (`weeklyBudgetNGN / 21`), active health conditions, and dietary preferences.
- Replaced the single monolithic form card with sectioned modular cards: a 2-column top grid pairing Personal Demographics & Physical Measurements with Weekly Food Budget, followed by dedicated cards for Health & Medical Conditions and Dietary Preferences & Exclusions.
- Enhanced the tab bar with iconography and saved recipes count badge.
- Added a bottom action bar with clear explanatory guidance and a full-width mobile / responsive desktop "Save Profile Changes" button.
- Verified all 84 tests pass, zero color token violations, and clean production build.

## Connect Customer Meals Page to Admin Dashboard Recipe Catalogue (2026-11-09)
- Root cause: `/customer/meals` was previously rendering `Dashboard.jsx` with `isMealsView={true}`, which called `useRecommendations()` (Gemini profile recommendations) instead of displaying the recipes added and approved from the Admin Dashboard.
- Created dedicated `src/pages/CustomerMeals.jsx` for `http://localhost:5174/customer/meals` loading published recipes directly from the Admin Catalogue via `POST /api/catalog`.
- Rendered meals in the responsive `MealCard` grid with meal type, prep time, estimated cost in Naira, description, health tags, and full favourite toggle support (`saved_meals`).
- Enhanced `api/auth.js` (`get-meal` action) and `api/_lib/services/nutritionService.js` (`fetchMealFromDb`) to query `recipe_catalog` by ID, enabling customers to click any catalogue meal and view full cooking steps, ingredients, and USDA nutrition at `/customer/meal/:id`.
- Added search by name/ingredient and filtering by meal type and tracked health conditions on `/customer/meals`, along with a "+ Manage / Add Recipes" shortcut for administrators.
- Simplified `src/pages/Dashboard.jsx` to focus strictly on the user's personalized meal recommendations.

## Instant Auto-Fill from Approved Nigerian Meals Library in Recipe Editor (2026-11-09)
- Transformed the "Approved Nigerian Meals Library" selector in `AiRecipeDraftBar.jsx` into an instant, zero-latency auto-fill mechanism. Selecting any authentic Nigerian dish immediately populates all recipe form fields—Recipe name, Meal type, Prep time, Estimated ingredient cost, Cost source, Description, Ingredients with units/quantities/estimated costs, Steps, Health suitability tags, Caution notes, and complete Nutrition estimates—without requiring network requests, API keys, or manual drafting.
- Added modular curated Nigerian classic recipe libraries across `src/features/admin/curated/breakfast.js` (6 recipes), `src/features/admin/curated/lunch.js` (7 recipes), and `src/features/admin/curated/dinner.js` (9 recipes), totaling 22 authentic, schema-validated recipes.
- Combined all curated categories in `src/features/admin/curatedMeals.js` and verified full round-trip conversion and strict compliance against `catalogRecipeSchema`.
- Updated UI badges and helper guidance in `AiRecipeDraftBar.jsx` ("Quick Fill", "Select any dish below to instantly fill the entire form", clear success banner with one-click Save). Retained the custom Gemini AI drafter as a secondary option for unlisted custom meals.
- Full verification suite passed: 17 test files, 84 tests passed, 0 color token violations, and clean production build.

## Fix Customer Recipe Catalogue Internal Error (2026-11-09)
- Root cause: `api/catalog.js` called `verifyRequest(req)` without capturing its return value and then checked an undeclared `uid`, causing a server-side `ReferenceError` that surfaced as the generic "An unexpected internal error occurred" toast on the customer recipe catalogue page.
- Fixed the route to destructure the authenticated user ID from `verifyRequest(req)` before the auth guard, restoring the customer catalogue listing flow without exposing a runtime error.

## Fix User Login Redirecting to Admin Dashboard (2026-11-09)
- Root cause: `test-user-001` (`chop1@test.com`) had been assigned an `admin_roles` entry during earlier local test seeding. Additionally, `Login.jsx` and `ProtectedRoute.jsx` contained unconditional overrides redirecting any session with `isAdmin: true` to `ROUTES.admin.dashboard`, preventing users from reaching the customer dashboard.
- Removed `test-user-001` from `admin_roles` in MySQL and updated `scripts/seed-users.mjs` so only `test-admin-001` (`adminchop@test.com`) is granted administrator privileges.
- Updated `src/pages/Login.jsx` so customer sign-in (`/customer/login`) navigates to the customer dashboard (`ROUTES.customer.dashboard` or `/customer/onboarding`), reserving the `/admin/dashboard` redirect strictly for the dedicated admin sign-in page (`/admin/login`).
- Removed the restrictive admin redirect from `src/routes/ProtectedRoute.jsx` so authenticated users can access customer dashboard and meal pages as expected.

## Replace Edamam with USDA FoodData Central (2026-11-09)
- Replaced the Edamam integration, credential fields, health check, admin route, and obsolete probe script with USDA FoodData Central. USDA nutrition is calculated only when every ingredient matches and uses grams; all unsupported or failed lookups use the AI estimate.
- Added startup cleanup limited to legacy Edamam integration/test-result entries and Edamam-sourced nutrition-cache rows. Updated current API, admin, nutrition, security, deployment, and thesis-deviation documentation; earlier Edamam entries below remain historical.

## Fix Admin Route Verification Stall and Enhance Recipe Catalogue Management Access (2026-11-09)
- Root cause: When navigating to `/admin/recipes` (or any admin page) while logged into a customer account or when the session's admin state was already verified in `AuthContext`, `AdminRoute` started in a blocking `checking` state and rendered `<Spinner label="Verifying admin credentials…" />`. If the authenticated user was a customer or lacked admin roles, it silently showed `NotFound` and halted the user without options to switch accounts or add recipes.
- Updated `src/routes/AdminRoute.jsx` to immediately trust the verified session `user.isAdmin` from `AuthContext`, bypassing redundant spinner delays and network roundtrips.
- Replaced the dead-end `NotFound` state for non-admin sessions with an informative `Administrator Access Required` card offering a one-click button to sign in with an administrator account (`adminchop@test.com`) or return to the dashboard.
- Added direct "+ Manage / Add Recipes" shortcut in `src/pages/RecipeCatalog.jsx` header and empty state for immediate navigation to `/admin/recipes`.
- Configured `ADMIN_UIDS=test-admin-001,test-user-001` in `.env.local` and added `test-user-001` to `admin_roles` so both testing accounts have administrative access to add and manage recipes in local development.
- Full verification suite passed (16 test files, 80 tests passed, 0 color violations).

## Diagnose Edamam Credential Save Failures (2026-11-09)
- Made the server report a clear configuration error when `CONFIG_ENCRYPTION_KEY` is missing or invalid, added inline integration-save feedback, and clear secret inputs only after a successful save. Documented the bootstrap prerequisite and logged ISS-06.

## Resolve Authentication Configuration Error and Add Meals & Favourite Meals to Customer Navigation (2026-11-09)
- Root cause for "Authentication is not configured on the server.": `getJwtSecret()` in `api/_lib/authTokens.js` threw `AppError.notConfigured(['JWT_SECRET'])` when neither `JWT_SECRET` nor `CONFIG_ENCRYPTION_KEY` were provided in the running server process.
- Added deterministic local development fallback key in `api/_lib/authTokens.js` for non-production environments, matching the original migration commit, while maintaining strict production enforcement.
- Updated `vite.config.js` to continuously synchronize `process.env` from `.env.local` on each `/api/*` request so changes to environment variables are picked up without restarting Vite.
- Ensured `JWT_SECRET` is defined in `.env.local` with at least 32 characters as specified by `docs/ARCHITECTURE.md`.
- Added "Meals" (`ROUTES.customer.meals`) to customer sidebar navigation in `src/components/app-shared.jsx` and `src/App.jsx` pointing to `Dashboard` with `isMealsView={true}` and a `/meals` legacy redirect.
- Renamed "Saved meals" to "Favourite meals" with a heart icon across customer sidebar, `Saved.jsx`, and `MealDetail.jsx`.
- Added interactive Heart favourite/save button directly onto `MealCard.jsx` and connected toggle logic in `Dashboard.jsx`, enabling customers to favourite and unfavourite meals directly from recommendations with instant visual feedback and toast notifications.
- Updated `src/lib/routes.test.js` to assert `ROUTES.customer.meals` in customer navigation; full verification suite passing (78 tests, 0 color violations).

## Add AI Recipe Assistant and Curated Nigerian Meals Library to Recipe Editor (2026-11-09)
- Added curated library of authentic Nigerian breakfast, lunch, and dinner classics in `src/features/admin/curatedMeals.js`.
- Implemented `AiRecipeDraftBar` component allowing admins to choose from approved Nigerian classics or type a custom meal name and draft full recipes with Gemini AI.
- Added server actions `draftRecipeWithAi` (drafting recipes with Gemini AI and calculating ingredient costs against the Nigerian market price table) and `analyzeRecipeNutrition` (analyzing recipe ingredients via the Edamam Nutrition Analysis API) to `POST /api/admin` and `api/_lib/services/recipeCatalogService.js`.
- Added "Analyze with Edamam" action in `RecipeEditorForm` with fallback protection and required attribution link.
- Updated `docs/API.md` and `docs/ADMIN_PAGE_SPEC.md` to document the new actions and AI recipe assistant features.

## Fix Dashboard JSX Parse Error (2026-11-09)
- Removed a duplicate regenerate-handler block outside its function in `src/pages/Dashboard.jsx`, restoring Vite parsing. Logged the resolved issue as ISS-05 in `docs/KNOWN_ISSUES.md`.

## Remove Paystack Purchases and Clarify Recipe Cost Estimates (2026-11-09)
- Removed Paystack configuration, checkout and verification endpoints, purchase tracking, access gating, and admin/customer purchase controls. Kept recipe and ingredient cost estimates for budgeting and clarified they are not selling prices across the admin editor, catalogue, and project documentation.

## Catch and Clarify Edamam 403 API Mismatch ("This app is for another API") (2026-11-09)
- Root cause: The configured Edamam App ID and Key were created under the Recipe Search API instead of the Nutrition Analysis API on developer.edamam.com, resulting in HTTP 403 `This app is for another API` when calling the Nutrition Analysis endpoint (`/api/nutrition-details`).
- Updated `api/_lib/clients/edamam.js` to catch this specific Edamam response and return clear, actionable instructions directing the admin to create an app under the Nutrition Analysis API at developer.edamam.com.
- Updated `api/_lib/integrations.js` so that when Edamam is disabled in settings, the health check gracefully confirms that the pipeline is safely using Gemini AI estimates rather than showing a failure.
- Updated setup notes in `api/_lib/data/integrationsRegistry.js` to warn about HTTP 403 when using Recipe Search credentials.

## Add Paystack Recipe Purchases (2026-11-09)
- This feature was implemented, then removed in the later “Remove Paystack Purchases” entry after clarification that recipe prices are ingredient-cost estimates, not selling prices.

## Fix Admin Connection Testing Feedback & Eliminate Infinite Loading States (2026-11-09)
- Root cause: Connection test button on `IntegrationCard` (`/admin/gemini`, `/admin/edamam`) lacked an inline test result display, leaving users with only a button spinner ("JUST LOADING") and no visual feedback. Additionally, unsaved form credentials were not passed to the test endpoint, MySQL connections hung indefinitely without a connect timeout when MariaDB was not reachable, and background status calls blocked test feedback.
- Implemented rich inline test feedback in `src/features/admin/IntegrationCard.jsx`: animated testing progress banner and prominent result cards with status icons, detailed server messages, latency metrics in milliseconds, and tested-at timestamps.
- Updated `IntegrationCard` to pass entered form credentials (`apiKey`, `model`, `appId`, `appKey`) to `onTest`, allowing live testing of newly entered credentials before saving.
- Enhanced `api/_lib/mysql.js` with `connectTimeout: 4000` on pool and connection configs and switched default host to `127.0.0.1` to prevent hanging on IPv6 lookups.
- Added strict execution timeouts to `generateJson` (12s per model), `listAvailableModels` (10s), and `apiClient` (25s) with clean user-facing error messages to eliminate infinite loading states.
- Enhanced `api/_lib/integrations.js` to support credentials overrides in `runHealthCheck`, added non-blocking timeouts for `recordTestResult`, and attached `lastTest` to `status.integrations`.
- Added Dashboard health check progress and failure alerts in `src/pages/admin/AdminDashboard.jsx`.
- Added comprehensive unit tests in `api/_lib/integrations.test.js` (4 tests).

## Resolve Gemini 503 High Demand Spikes via Resilient Multi-Model Failover (2026-11-09)
- Root cause: Google's `gemini-3.8-flash` model encountered server-side high demand spikes (`code: 503, status: UNAVAILABLE`).
- Implemented automatic multi-model failover in `api/_lib/clients/gemini.js` across candidate models (`gemini-3.5-flash-lite`, `gemini-3.5-flash`, `gemini-3.1-flash-lite`, `gemini-3.6-flash`), catching transient 503, 429, and 404 errors and seamlessly falling over to the next candidate model.
- Updated active model in `admin_config` and `api/_lib/configStore.js` to `gemini-3.5-flash-lite` (verified ~1s latency).
- Updated model prioritization in `sortGeminiModels` and `useGeminiModels` to favor active Flash models.

## Remove Redundant Sidebar Theme Toggle; Keep Only Header Toggle and Sidebar Logout (2026-11-09)
- Removed the duplicate theme toggle from `SidebarFooter` in `src/components/app-sidebar.jsx`, consolidating theme switching to the single [`ThemeToggle`](file:///c:/xampp/htdocs/p/chopwise/src/components/ThemeToggle.jsx) located in the top navigation header (`AppHeader`).
- Left the styled `Log out` menu item as the sole button in the sidebar footer, preserving collapse tooltips and role-specific logout confirmation for both Customer and Admin dashboards.

## Refactor Sidebar Footer (Theme & Logout) for Customer and Admin Dashboards (2026-11-09)
- Replaced the makeshift, unaligned flex `<div>` and raw text in `SidebarFooter` with unified, first-class `SidebarMenuItem` buttons in `src/components/app-sidebar.jsx`:
  - **Theme Toggle**: Formatted as a cohesive menu item matching the navigation list, featuring the theme icon on the left, "Theme" label, current theme badge (`Dark`/`Light`/`System`) on the right, and full-width hover state.
  - **Log out**: Aligned with the menu button grid, featuring the logout icon, clean muted text, and a smooth `hover:bg-danger-bg hover:text-danger-fg` transition.
  - **Responsive Collapsing**: Added `group-data-[collapsible=icon]:hidden` and native tooltips so the footer collapses cleanly without horizontal overflow in icon mode.
  - **Dashboard Role Tailoring**: Contextualized the logout confirmation dialog and redirection dynamically for both Customer (`/customer/dashboard`) and Admin (`/admin/dashboard`) portals.
- Exported `ThemeIcon` and `LABELS` from `src/components/ThemeToggle.jsx` for clean component reuse.

## Unify Customer Sidebar into Single Standard List Across All Pages (2026-11-09)
- Unified customer navigation into a single standard list: Dashboard (`/customer/dashboard`), Saved meals (`/customer/saved`), Recipe Catalogue (`/customer/recipes`), and My profile (`/customer/profile`).
- Removed page-dependent sidebar groups (such as conditional `onRegenerate` button) from `AppSidebar` and `AppShell` so the sidebar remains identical across all customer routes.
- Synchronized `MobileDrawer` and desktop navigation in `Layout.jsx` with `customerNavGroups` so customer navigation is completely unified across both mobile drawer and desktop sidebars.
- Added explicit route pathname matching for Recipe Catalogue in `NavGroup` and passed canonical route pathnames to `<AppShell>` across all customer views.

## Fix Login Form and Split-Banner Overlap (2026-11-09)
- Shifted the desktop login card's curved divider right so it no longer crowds the form icons, fields, or action links.

## Resolve Gemini 429 Quota Exhaustion & Exclude Zero-Quota Models (2026-11-09)
- Diagnosed root cause: `admin_config` had stored `gemini-4-argon`, an experimental Google preview model with an enforced rate limit of `0` requests/tokens on free-tier API keys, resulting in instant `429 RESOURCE_EXHAUSTED` responses.
- Updated the active Gemini model in MySQL `admin_config` to `gemini-2.5-flash` (recommended production model with active free-tier quota).
- Hardened `api/_lib/clients/gemini.js`:
  - Filtered out unreleased/internal models (`argon`, `embed`, `aqa`) in `parseGeminiModels()`.
  - Added model sanitization and automatic fallback in `generateJson()`: if an experimental model or zero-quota error is triggered, it automatically falls back to `gemini-2.5-flash`.
- Updated `src/features/admin/useGeminiModels.js` to prioritize stable Flash models (`gemini-2.5-flash`, `gemini-2.0-flash`) when selecting available models.

## Adjust Login Icons and Test Credential Placement (2026-11-09)
- Shifted underline-input icons slightly left and increased right-side text padding to keep typed text clear of the icons.
- Moved the test-credential button directly after the role-switch sign-in link in the login footer on customer and admin login pages.
- Removed the separate below-card and mobile-header test credential buttons.
- Set the shared login layout to exactly 100vh and fixed the admin footer JSX grouping.

## Move Admin Shortcuts to Dashboard (2026-11-09)
- Removed the Customer App link and Run Health Check action from the admin sidebar.
- Kept customer navigation on the main welcome page and placed Run Health Check beside Refresh Status on `/admin/dashboard`.
- Updated admin and UI navigation documentation.

## Redesign Login and Register Pages to Luxury Editorial Curved Split Layout (2026-11-09)
- Redesigned `/customer/login`, `/admin/login`, and `/customer/register` to match the two-column curved luxury layout from the reference design:
  - Left panel: warm cream / dark surface with clean underline input fields, icon adornments, accessible labels, "Keep me signed in" checkbox, "Forgot password?" recovery trigger, prominent forest green pill button, and accent-underlined navigation links.
  - Right panel: rich deep forest green backdrop with spaced uppercase brand header, large classic serif typography ("Welcome back." / "Healthy living."), and thesis-aligned Nigerian meal guidance copy.
  - Seamless organic S-curve SVG divider with warm golden gradient stroke and subtle ambient glow between the left and right panels.
- Configured all login and register page layouts to fit within `98vh` without vertical page overflow.
- Simplified the test account login helper into a streamlined single pill button (`⚡ Fill Test Credentials`) positioned cleanly beneath the card (and as a compact mobile header shortcut).
- Created `src/features/auth/AuthCardLayout.jsx` as a shared presentation container, ensuring responsiveness across desktop and mobile while keeping individual page files concise (< 250 lines).
- Updated `src/components/Input.jsx` with an optional `variant="underline"` mode for borderless bottom-line form inputs with right-aligned icon adornments.
- Added semantic tokens (`--color-auth-card`, `--color-auth-banner`, `--color-auth-banner-to`, `--color-auth-accent`, `--color-auth-accent-hover`, and `--font-serif`) in `src/styles/theme.css` with light and dark mode values.
- Preserved 100% of functional requirements: scrypt/JWT authentication, admin redirect isolation, email verification state, health consent checkbox, error alerts, and 1-click test credentials filling for examiners.
- Verified with `npm run verify` (`check:colors`, 71 passing vitest tests, and production build).

## Provision Local Test Admin Access (2026-11-09)
- Fixed `npm run seed` so the seeded `adminchop@test.com` account receives its database-managed admin role, matching the current server-side authorization model.
- Blocked the test-account seed script when `NODE_ENV=production`; updated the admin and security docs.

## Resolve JWT_SECRET Authentication Configuration Issue (2026-11-09)
- Updated `getJwtSecret()` in `api/_lib/authTokens.js` to derive a 256-bit signing key from `CONFIG_ENCRYPTION_KEY` when `JWT_SECRET` is not explicitly set in the local environment, resolving the `"Authentication is not configured on the server."` error during login.
- Updated `api/admin.js` bootstrap status verification for secret readiness.

## Role-Specific Test Login Credentials (2026-11-09)
- Added dedicated role-specific test credentials helper in `src/pages/Login.jsx`:
  - Customer login (`/customer/login`): Displays customer test details (`chop1@test.com` / `password1`) with a "Fill credentials" button.
  - Administrator sign-in (`/admin/login`): Displays administrator test details (`adminchop@test.com` / `password1`) with a "Fill credentials" button.
  - Maintained role isolation: credentials only appear on their respective login screen, do not auto-submit, and prevent cross-role account switching.

## Expanded Admin Management (2026-11-09)
- Connected customer account controls, shared recipe CRUD and customer browsing, read-only activity history, administrator role management, and bounded maintenance under their documented `/admin/<page-name>` and `/customer/recipes` routes.
- Added sidebar and dashboard entry points for the management modules and preserved server-side authorization and recipe-catalogue isolation from personalized recommendations.
- Changed administrator-grant audit records to identify the account by ID rather than storing its email address.
- Updated API, admin-route, security, and development documentation to match the current MySQL/JWT implementation.

## Dedicated Admin Dashboard & Account Isolation (2026-11-09)
- Created dedicated `AdminDashboard.jsx` (`src/pages/AdminDashboard.jsx` and `src/pages/admin/AdminDashboard.jsx`) providing full operational telemetry, live API status cards, analytics charts, and admin module navigation.
- Registered `/admin/dashboard` to `AdminDashboard` under `AdminRoute` and `AdminLayout` in `src/App.jsx`.
- Removed automatic login connections in `src/pages/Login.jsx`: eliminated hardcoded test accounts, auto-fill buttons, and test account selection block.
- Removed account switching connections:
  - Removed "Customer View" navigation group and customer links from `adminNavGroups` in `src/components/app-shared.jsx`.
  - Removed backlink to customer dashboard in `src/pages/Admin.jsx`.
  - Suppressed customer "Profile & Preferences" link in `src/components/nav-user.jsx` when navigating admin routes.
  - Hardened `src/routes/ProtectedRoute.jsx` and `src/pages/Login.jsx` to redirect admin sessions strictly to `ROUTES.admin.dashboard` and block admin users from entering customer routes.
- Cleaned up customer `src/pages/Dashboard.jsx` to exclusively display personalized Nigerian meal plan metrics and recommendations, moving all operational charts to the Admin Dashboard.
- Added routing and navigation unit tests in `src/lib/routes.test.js`.

## Align Admin Dashboard with @efferd/dashboard-3 Design & Rename Overview to Dashboard (2026-11-09)
- Renamed Admin "Overview" to "Dashboard" across `adminNavGroups` in `src/components/app-shared.jsx`, routing in `src/App.jsx`, and created `src/pages/admin/AdminDashboard.jsx`.
- Breadcrumb in `AppHeader` now renders `[::] Dashboard` matching the uploaded design.
- Implemented full `@efferd/dashboard-3` analytics and metrics grid on the Admin Dashboard:
  - 4-column KPI cards powered by `<DashboardStats items={statsItems} />` displaying Active APIs, Gemini AI Engine, Edamam Nutrition Pipeline, and Production Readiness.
  - Interactive area chart (`<ConversationVolumeChart />`) and channel traffic donut chart (`<ChannelBreakdownChart />`).
  - Secondary operational charts: CSAT responses, reply time, team on duty, recent conversations, and support activity.
- Added top actions (`⚡ Test All APIs` primary button and `↻ Refresh Status` secondary button) and sidebar quick action (`⚡ Run Health Check`).
- Integrated Administration Management Modules grid below the analytics section for quick access to all 8 admin subpages.

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
