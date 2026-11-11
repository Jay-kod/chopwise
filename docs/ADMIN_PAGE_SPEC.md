# ADMIN_PAGE_SPEC.md — administration portal and dedicated modular pages

Routes: `/admin/login` is administrator sign-in. `/admin/dashboard` is the executive overview hub; legacy `/admin` redirects there. Dedicated subpages provide each management module:
- `/admin/dashboard` — Executive overview of system health, diagnostic KPIs, bootstrap readiness, and admin configuration modules; excludes customer-usage analytics
- `/admin/analysis` — Gemini/USDA readiness and live pipeline diagnostics; no customer-usage analytics
- `/admin/integrations` — Unified API Integrations command center consolidating Google Gemini AI, USDA FoodData Central, and external APIs with tabbed views, health metrics, and the diagnostic functions table (legacy `/admin/gemini`, `/admin/usda`, and `/admin/functions` redirect here)
- `/admin/settings` — Recommendation limits & platform branding
- `/admin/safety` — Clinical safety nutrient thresholds
- `/admin/prices` — Nigerian ingredient market price table
- `/admin/checklist` — Bootstrap readiness checklist
- `/admin/evaluation` — Automated recommendation test suite (Chapter 4)
- `/admin/customers` — Customer account metadata and active status
- `/admin/recipes` — Shared recipe catalogue management
- `/admin/activity` — Read-only admin activity history
- `/admin/access` — Additional administrator access management
- `/admin/maintenance` — Bounded database maintenance actions

Both use email/password authentication. The admin sign-in checks `POST /api/admin {action:"me"}` and refuses accounts the server does not recognize as admins. Signed-out visits to `/admin` go to `/admin/login`; authenticated non-admins see the NotFound page. Navbar/sidebar link shows only when `POST /api/admin {action:"me"}` returns `isAdmin: true`. The server is the authority; the client check is only for UX.

## Access
Bootstrap admins are account **IDs** listed in server env `ADMIN_UIDS` (comma-separated). They cannot be removed or disabled through the app. Additional administrators are existing active accounts managed through the Admin Access page and stored in MySQL `admin_roles`.
For local development only, `npm run seed` grants the seeded `adminchop@test.com` account an `admin_roles` entry. The seed command refuses to run when `NODE_ENV=production`; these public test credentials must never be used for real customer data.

## Sections (top to bottom)
**A. Functions & APIs** (`/admin/functions`) — table, one row per registered item: title, type (integration/function), status badge (`not_configured` grey, `untested` amber, `ok` green, `failing` red), last test message + time, **Test** button, **Setup guide** link (scrolls to its card). Rows: MySQL/MariaDB, Gemini API, USDA FoodData Central, Recommendation pipeline, Nutrition pipeline. A "Test all" button runs them sequentially.

**B. Integration cards** (Gemini, USDA), rendered generically from `status.integrations`:
- Title, one-line description, status badge.
- **How to get it** block: help links (open in new tab, `rel="noopener noreferrer"`) and numbered steps.
- Fields: `secret` = password input, write-only; shows "Configured ••••AbCd" and an empty input; empty submit keeps the stored value. `text` = normal input. `toggle` = switch.
- Buttons: **Save**, **Test**. After save, refresh status. Show validation errors from the server per field.
- Gemini powers the customer meal-detail "Verify with AI" feedback action. USDA powers the customer meal-detail "Check USDA data" action; its test performs a live 100 g white-rice lookup.

**C. Recommendation settings** — mealsPerType, budgetDivisor, rateLimitPerHour, retryOnOverBudget. Save + Reset to defaults. Show the resulting per-meal cap for an example budget (e.g. ₦10,000/week) as live help text.

**D. Safety thresholds** — the four numbers with units, a note "heuristic thresholds, not clinical advice". Save + Reset.

**E. Ingredient price table** — editable rows (item, unit select `100g|100ml|piece`, price ₦), add/remove row, search box, counter "N of M priced", warning banner when any price is empty. Save + Reset to seed list.

**F. Bootstrap checklist** — detected/missing indicators for MySQL connectivity, `ADMIN_UIDS`, `JWT_SECRET`, and `CONFIG_ENCRYPTION_KEY` (booleans only, never values), with setup steps.

**G. Evaluation runner (AR9, optional)** (`/admin/evaluation`) — Run button; loops `runEvaluationCase` index 0..9 one request at a time with a progress bar; table of results; summary metrics (% meals within budget, % passing safety, USDA success vs AI-estimate fallback %, median latency); Download CSV.

**H. Customer accounts** (`/admin/customers`) — search/list account ID, email, creation date, profile-complete and active status; update email; reversibly disable/enable. Never show health profiles, passwords or password hashes. Account creation and permanent deletion are unavailable. Bootstrap admins cannot be disabled.

**I. Recipe catalogue** (`/admin/recipes`) — add, edit and remove validated shared recipes. Features an AI Recipe Assistant powered by Google Gemini and a curated Nigerian meals library (categorized by Breakfast, Lunch, and Dinner) to automatically draft recipes and price ingredients against the market price table, plus a USDA FoodData Central analysis button for gram-measured ingredients. Recipe and ingredient costs are estimates for budgeting, not selling prices.

**J. Activity history** (`/admin/activity`) — paginated, read-only append-only audit events for admin changes and maintenance. Do not log secrets, passwords, JWTs, customer health profiles, or editable customer data.

**K. Administrator access** (`/admin/access`) — list bootstrap and database-managed admins; grant access to existing active accounts and revoke additional admin roles. Bootstrap IDs from `ADMIN_UIDS` are protected and cannot be revoked. Role changes are checked on every admin request.

**L. Maintenance** (`/admin/maintenance`) — clear `nutrition_cache` or reset `rate_limits`, each with confirmation and result count. Never expose a general delete/purge operation for customer data.

**M. System analysis** (`/admin/analysis`) — show Gemini and USDA configured/disabled status, persisted last-test results for registered integrations and pipelines, and controls to refresh status, run an individual diagnostic, or run all diagnostics sequentially. This page is operational diagnostics only: do not add customer-usage analytics or usage storage.

The admin sidebar contains admin routes only and links to System Analysis. The `/admin/dashboard` welcome page provides a System Analysis module link and the health-check action alongside status refresh. Customer navigation remains available from the main welcome page, including its Meal Analysis link.
The dashboard uses a responsive operations header, system-health summary cards, service diagnostic cards, bootstrap readiness indicators, and admin configuration modules. Overview values come only from the admin status response: registered diagnostic statuses, persisted health-test results, and bootstrap readiness booleans. It does not show customer activity, support analytics, or customer profile details.

## Behaviour rules
- Secrets are never rendered, logged or returned. Not even masked beyond last 4 chars.
- Every button shows a loading state and disables while running; every failure shows a readable error.
- Test results persist (`adminConfig/testResults`) and show after refresh.
- Config changes take effect within 60 s without redeploy.
- Mobile-friendly: cards stack, tables scroll horizontally inside their container.

## Test semantics (`api/_lib/integrations.js` + services)
- `mysql`: execute a harmless database read and write/read/remove a temporary health-check row.
- `gemini`: tiny JSON-mode prompt through the real client with the saved key/model; pass when valid JSON returns.
- `usda`: search a simple gram-measured food (100 g white rice) through the real client; pass when the result contains calories.
- `recommend`: run the real recommendation service with a built-in sample profile; pass when the expected number of schema-valid meals returns; show latency and over-budget count. Saves nothing to any user.
- `nutrition`: run the real nutrition service on a built-in sample meal; pass when a result returns; report `source` (`usda` or `ai-estimate`).

## How to get and add each key (content for the cards and checklist)

### Gemini API (Admin-managed: apiKey, model)
Links: Get a key (official docs) https://ai.google.dev/gemini-api/docs/api-key | Google AI Studio https://aistudio.google.com/ | Models list https://ai.google.dev/gemini-api/docs/models | Structured output https://ai.google.dev/gemini-api/docs/structured-output
Steps: 1) Open Google AI Studio and sign in with a Google account. 2) Open the API keys page and choose Create API key (new or existing Cloud project). 3) Copy the key (it starts with `AIza`). 4) Paste it into the API key field (live available models will be queried automatically). 5) Choose a current Flash-tier model (e.g. gemini-2.5-flash) from the dropdown. 6) Save, then Test.
Notes: the free tier has rate limits shown in AI Studio; keep the key private; consider restricting it to the Gemini API in Google Cloud.

### USDA FoodData Central (Admin-managed: apiKey, enabled)
Links: API guide https://fdc.nal.usda.gov/api-guide | Request a free data.gov API key https://fdc.nal.usda.gov/api-key-signup
Steps: 1) Request a data.gov API key from the USDA key sign-up page. 2) Copy the key from the data.gov confirmation. 3) Open `/admin/usda`, paste the key, enable USDA, save, then test.
Notes: USDA FoodData Central supplies food-composition records, not recipe parsing. ChopWise only calculates USDA nutrition when every ingredient has a usable match and a quantity in grams. Unmatched foods or other units use the AI estimate. The key is write-only in Admin and encrypted in MySQL.

### Bootstrap (MySQL/MariaDB + Vercel; env vars, shown in checklist F)
Steps:
1. Start MySQL/MariaDB (XAMPP locally); the app creates the `chopwise` database and required tables.
2. Set `MYSQL_*` connection variables if the local defaults are not suitable.
3. Set `JWT_SECRET` to a unique random value of at least 32 characters.
4. Generate `CONFIG_ENCRYPTION_KEY`: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`.
5. Register your account, then add its account ID to `ADMIN_UIDS` in the server environment.
6. Configure server-only variables locally and in Vercel project settings; never put server-only values in `VITE_*` variables.
7. Open `/admin/dashboard`, configure Gemini, then open `/admin/usda` to add the USDA key; press Test all.

## Link verification
The implementing agent must open every URL above once in the browser. If a link is broken, find the correct official page, fix `integrations.js` and this doc, and say so in the report.
