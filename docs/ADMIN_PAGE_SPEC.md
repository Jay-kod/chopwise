# ADMIN_PAGE_SPEC.md — administration portal and dedicated modular pages

Routes: `/admin/login` is administrator sign-in. `/admin` and `/admin/dashboard` serve as the executive overview hub, with dedicated subpages for each management module:
- `/admin/dashboard` — Executive overview & KPIs
- `/admin/functions` — Serverless functions table & health checks
- `/admin/gemini` — Google Gemini AI credentials & live model selection
- `/admin/edamam` — Edamam nutrition analysis API setup
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

## Sections (top to bottom)
**A. Functions & APIs** (`/admin/functions`) — table, one row per registered item: title, type (integration/function), status badge (`not_configured` grey, `untested` amber, `ok` green, `failing` red), last test message + time, **Test** button, **Setup guide** link (scrolls to its card). Rows: MySQL/MariaDB, Gemini API, Edamam API, Recommendation pipeline, Nutrition pipeline. A "Test all" button runs them sequentially.

**B. Integration cards** (Gemini, Edamam), rendered generically from `status.integrations`:
- Title, one-line description, status badge.
- **How to get it** block: help links (open in new tab, `rel="noopener noreferrer"`) and numbered steps.
- Fields: `secret` = password input, write-only; shows "Configured ••••AbCd" and an empty input; empty submit keeps the stored value. `text` = normal input. `toggle` = switch.
- Buttons: **Save**, **Test**. After save, refresh status. Show validation errors from the server per field.

**C. Recommendation settings** — mealsPerType, budgetDivisor, rateLimitPerHour, retryOnOverBudget. Save + Reset to defaults. Show the resulting per-meal cap for an example budget (e.g. ₦10,000/week) as live help text.

**D. Safety thresholds** — the four numbers with units, a note "heuristic thresholds, not clinical advice". Save + Reset.

**E. Ingredient price table** — editable rows (item, unit select `100g|100ml|piece`, price ₦), add/remove row, search box, counter "N of M priced", warning banner when any price is empty. Save + Reset to seed list.

**F. Bootstrap checklist** — detected/missing indicators for MySQL connectivity, `ADMIN_UIDS`, `JWT_SECRET`, and `CONFIG_ENCRYPTION_KEY` (booleans only, never values), with setup steps.

**G. Evaluation runner (AR9, optional)** (`/admin/evaluation`) — Run button; loops `runEvaluationCase` index 0..9 one request at a time with a progress bar; table of results; summary metrics (% meals within budget, % passing safety, Edamam success vs fallback %, median latency); Download CSV.

**H. Customer accounts** (`/admin/customers`) — search/list account ID, email, creation date, profile-complete and active status; update email; reversibly disable/enable. Never show health profiles, passwords or password hashes. Account creation and permanent deletion are unavailable. Bootstrap admins cannot be disabled.

**I. Recipe catalogue** (`/admin/recipes`) — add, edit and permanently remove validated shared recipes. Catalogue entries are visible to signed-in customers at `/customer/recipes`; they do not alter personalized recommendations.

**J. Activity history** (`/admin/activity`) — paginated, read-only append-only audit events for admin changes and maintenance. Do not log secrets, passwords, JWTs, customer health profiles, or editable customer data.

**K. Administrator access** (`/admin/access`) — list bootstrap and database-managed admins; grant access to existing active accounts and revoke additional admin roles. Bootstrap IDs from `ADMIN_UIDS` are protected and cannot be revoked. Role changes are checked on every admin request.

**L. Maintenance** (`/admin/maintenance`) — clear `nutrition_cache` or reset `rate_limits`, each with confirmation and result count. Never expose a general delete/purge operation for customer data.

## Behaviour rules
- Secrets are never rendered, logged or returned. Not even masked beyond last 4 chars.
- Every button shows a loading state and disables while running; every failure shows a readable error.
- Test results persist (`adminConfig/testResults`) and show after refresh.
- Config changes take effect within 60 s without redeploy.
- Mobile-friendly: cards stack, tables scroll horizontally inside their container.

## Test semantics (`api/_lib/integrations.js` + services)
- `mysql`: execute a harmless database read and write/read/remove a temporary health-check row.
- `gemini`: tiny JSON-mode prompt through the real client with the saved key/model; pass when valid JSON returns.
- `edamam`: analyse one simple line (e.g. "1 cup rice") through the real client; pass on 2xx with calories.
- `recommend`: run the real recommendation service with a built-in sample profile; pass when the expected number of schema-valid meals returns; show latency and over-budget count. Saves nothing to any user.
- `nutrition`: run the real nutrition service on a built-in sample meal; pass when a result returns; report `source` (edamam or ai-estimate).

## How to get and add each key (content for the cards and checklist)

### Gemini API (Admin-managed: apiKey, model)
Links: Get a key (official docs) https://ai.google.dev/gemini-api/docs/api-key | Google AI Studio https://aistudio.google.com/ | Models list https://ai.google.dev/gemini-api/docs/models | Structured output https://ai.google.dev/gemini-api/docs/structured-output
Steps: 1) Open Google AI Studio and sign in with a Google account. 2) Open the API keys page and choose Create API key (new or existing Cloud project). 3) Copy the key (it starts with `AIza`). 4) Paste it into the API key field (live available models will be queried automatically). 5) Choose a current Flash-tier model (e.g. gemini-2.5-flash) from the dropdown. 6) Save, then Test.
Notes: the free tier has rate limits shown in AI Studio; keep the key private; consider restricting it to the Gemini API in Google Cloud.

### Edamam Nutrition Analysis API (Admin-managed: appId, appKey, enabled)
Links: Developer portal https://developer.edamam.com/ | FAQ https://developer.edamam.com/api/faq | Signing up for an API https://edamamhelp.zendesk.com/hc/en-us/articles/4422823511959-Signing-Up-For-an-API-Without-an-Account | Nutrition API docs https://developer.edamam.com/edamam-docs-nutrition-api
Steps: 1) Create an account at developer.edamam.com. 2) Dashboard -> Applications -> Create New Application. 3) Choose the **Nutrition Analysis API** with the free Developer plan. 4) Copy the Application ID and Application Key. 5) Paste both, switch Enabled on, Save, then Test.
Notes: credentials are per API; keys from Recipe Search will return 401. If the View button for the key is missing you picked a paid plan without a card on file. Attribution ("Powered by Edamam" linking to developer.edamam.com) is required by Edamam.

### Bootstrap (MySQL/MariaDB + Vercel; env vars, shown in checklist F)
Steps:
1. Start MySQL/MariaDB (XAMPP locally); the app creates the `chopwise` database and required tables.
2. Set `MYSQL_*` connection variables if the local defaults are not suitable.
3. Set `JWT_SECRET` to a unique random value of at least 32 characters.
4. Generate `CONFIG_ENCRYPTION_KEY`: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`.
5. Register your account, then add its account ID to `ADMIN_UIDS` in the server environment.
6. Configure server-only variables locally and in Vercel project settings; never put server-only values in `VITE_*` variables.
7. Open `/admin/dashboard`, add Gemini and Edamam keys, then press Test all.

## Link verification
The implementing agent must open every URL above once in the browser. If a link is broken, find the correct official page, fix `integrations.js` and this doc, and say so in the report.
