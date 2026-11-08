# ADMIN_PAGE_SPEC.md — one page for every function and API

Routes: `/admin/login` is the dedicated administrator sign-in page; `/admin` is the management page (sections stacked on mobile, two columns on wide screens). Both use the existing email/password authentication. The admin sign-in checks `POST /api/admin {action:"me"}` and refuses accounts the server does not recognize as admins. Signed-out visits to `/admin` go to `/admin/login`; authenticated non-admins see the NotFound page. Navbar link shows only when `POST /api/admin {action:"me"}` returns `isAdmin: true`. The server is the authority; the client check is only for UX.

## Access
Admins are Firebase **UIDs** listed in env `ADMIN_UIDS` (comma-separated). UIDs, not emails: anyone can register an email address before the owner does, but nobody can choose their UID.

## Sections (top to bottom)
**A. Functions & APIs** — table, one row per registered item: title, type (integration/function), status badge (`not_configured` grey, `untested` amber, `ok` green, `failing` red), last test message + time, **Test** button, **Setup guide** link (scrolls to its card). Rows: Firestore (Admin SDK), Gemini API, Edamam API, Recommendation pipeline, Nutrition pipeline. A "Test all" button runs them sequentially.

**B. Integration cards** (Gemini, Edamam), rendered generically from `status.integrations`:
- Title, one-line description, status badge.
- **How to get it** block: help links (open in new tab, `rel="noopener noreferrer"`) and numbered steps.
- Fields: `secret` = password input, write-only; shows "Configured ••••AbCd" and an empty input; empty submit keeps the stored value. `text` = normal input. `toggle` = switch.
- Buttons: **Save**, **Test**. After save, refresh status. Show validation errors from the server per field.

**C. Recommendation settings** — mealsPerType, budgetDivisor, rateLimitPerHour, retryOnOverBudget. Save + Reset to defaults. Show the resulting per-meal cap for an example budget (e.g. ₦10,000/week) as live help text.

**D. Safety thresholds** — the four numbers with units, a note "heuristic thresholds, not clinical advice". Save + Reset.

**E. Ingredient price table** — editable rows (item, unit select `100g|100ml|piece`, price ₦), add/remove row, search box, counter "N of M priced", warning banner when any price is empty. Save + Reset to seed list.

**F. Bootstrap checklist** — detected/missing indicators for `FIREBASE_SERVICE_ACCOUNT_B64`, `ADMIN_UIDS`, `CONFIG_ENCRYPTION_KEY` (booleans only, never values), with numbered setup steps and links (below).

**G. Evaluation runner (AR9, optional)** — Run button; loops `runEvaluationCase` index 0..9 one request at a time with a progress bar; table of results; summary metrics (% meals within budget, % passing safety, Edamam success vs fallback %, median latency); Download CSV.

## Behaviour rules
- Secrets are never rendered, logged or returned. Not even masked beyond last 4 chars.
- Every button shows a loading state and disables while running; every failure shows a readable error.
- Test results persist (`adminConfig/testResults`) and show after refresh.
- Config changes take effect within 60 s without redeploy.
- Mobile-friendly: cards stack, tables scroll horizontally inside their container.

## Test semantics (`api/_lib/integrations.js` + services)
- `firestore`: read `adminConfig/settings` and write/read a temporary `adminConfig/_healthcheck` document.
- `gemini`: tiny JSON-mode prompt through the real client with the saved key/model; pass when valid JSON returns.
- `edamam`: analyse one simple line (e.g. "1 cup rice") through the real client; pass on 2xx with calories.
- `recommend`: run the real recommendation service with a built-in sample profile; pass when the expected number of schema-valid meals returns; show latency and over-budget count. Saves nothing to any user.
- `nutrition`: run the real nutrition service on a built-in sample meal; pass when a result returns; report `source` (edamam or ai-estimate).

## How to get and add each key (content for the cards and checklist)

### Gemini API (Admin-managed: apiKey, model)
Links: Get a key (official docs) https://ai.google.dev/gemini-api/docs/api-key | Google AI Studio https://aistudio.google.com/ | Models list https://ai.google.dev/gemini-api/docs/models | Structured output https://ai.google.dev/gemini-api/docs/structured-output
Steps: 1) Open Google AI Studio and sign in with a Google account. 2) Open the API keys page and choose Create API key (new or existing Cloud project). 3) Copy the key (it starts with `AIza`). 4) Paste it into the API key field. 5) Enter a current Flash-tier model name from the Models page. 6) Save, then Test.
Notes: the free tier has rate limits shown in AI Studio; keep the key private; consider restricting it to the Gemini API in Google Cloud.

### Edamam Nutrition Analysis API (Admin-managed: appId, appKey, enabled)
Links: Developer portal https://developer.edamam.com/ | FAQ https://developer.edamam.com/api/faq | Signing up for an API https://edamamhelp.zendesk.com/hc/en-us/articles/4422823511959-Signing-Up-For-an-API-Without-an-Account | Nutrition API docs https://developer.edamam.com/edamam-docs-nutrition-api
Steps: 1) Create an account at developer.edamam.com. 2) Dashboard -> Applications -> Create New Application. 3) Choose the **Nutrition Analysis API** with the free Developer plan. 4) Copy the Application ID and Application Key. 5) Paste both, switch Enabled on, Save, then Test.
Notes: credentials are per API; keys from Recipe Search will return 401. If the View button for the key is missing you picked a paid plan without a card on file. Attribution ("Powered by Edamam" linking to developer.edamam.com) is required by Edamam.

### Bootstrap (Firebase + Vercel; env vars, shown in checklist F)
Links: Firebase console https://console.firebase.google.com/ | Web app config https://firebase.google.com/docs/web/setup | Admin SDK / service account https://firebase.google.com/docs/admin/setup | Verify ID tokens https://firebase.google.com/docs/auth/admin/verify-id-tokens | Vercel env vars https://vercel.com/docs/environment-variables
Steps:
1. Firebase console -> Add project. Build -> Authentication -> Sign-in method -> enable Email/Password.
2. Build -> Firestore Database -> Create database (production mode). Rules tab -> paste `firestore.rules` -> Publish.
3. Project settings -> General -> Your apps -> Web (`</>`) -> register app -> copy the config values into `VITE_FIREBASE_*`.
4. Project settings -> Service accounts -> Generate new private key (downloads JSON). Base64-encode it (Linux `base64 -w0 key.json`; macOS `base64 -i key.json`; PowerShell `[Convert]::ToBase64String([IO.File]::ReadAllBytes("key.json"))`) and set `FIREBASE_SERVICE_ACCOUNT_B64`. Delete the JSON afterwards; never commit it.
5. Generate `CONFIG_ENCRYPTION_KEY`: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`.
6. Register your own account in the app, then Firebase console -> Authentication -> Users -> copy your UID into `ADMIN_UIDS`.
7. Set all variables in `.env.local` for `vercel dev` and in Vercel -> Project -> Settings -> Environment Variables; redeploy.
8. Open `/admin`, add Gemini and Edamam keys, press Test all.

## Link verification
The implementing agent must open every URL above once in the browser. If a link is broken, find the correct official page, fix `integrations.js` and this doc, and say so in the report.
