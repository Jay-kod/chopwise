# AGENT_PROMPTS.md — ONE-DAY BUILD (Day 1) + debug days

## The plan
- **Day 1:** build everything (pre-flight + 7 blocks, ~11-14 h; ~9-11 h if you run Blocks 2 and 3 in parallel).
- **Day 2:** deploy, production smoke test, 10-profile test log, fix S1/S2 bugs.
- **Day 3:** fix S3/S4 bugs, collect Chapter 4 evidence, final audit, freeze.
Debug days are a buffer, not extra scope. No new features after Day 1.

Stop rule: if you are at hour 14 and Block 6 is not finished, stop. Day 2 morning finishes it. Never skip Blocks 1-5; they are the core.

## Pre-flight (do this first, ~60-90 min, no AI needed)
1. Install Node LTS, git and the Vercel CLI (`npm i -g vercel`), then `vercel login`.
2. Copy this pack into a new repo folder (AGENTS.md, GEMINI.md, docs/, starter/), run `git init`, commit.
3. Firebase (console.firebase.google.com): create project; enable Email/Password auth; create Firestore (production mode); **publish the rules text from docs/DATABASE.md** (Rules tab -> paste -> Publish); register a Web app and copy the config.
4. Service account: Project settings -> Service accounts -> Generate new private key; base64 it; delete the JSON. Generate CONFIG_ENCRYPTION_KEY. Exact commands are in docs/ADMIN_PAGE_SPEC.md (Bootstrap).
5. Put the `VITE_FIREBASE_*`, `FIREBASE_SERVICE_ACCOUNT_B64`, `CONFIG_ENCRYPTION_KEY` values in `.env.local`. Also add `EDAMAM_APP_ID` and `EDAMAM_APP_KEY` (needed by the P2 probe only).
6. Get your Gemini key and Edamam key (links in docs/ADMIN_PAGE_SPEC.md). Keep them in a password manager. You will paste them into the Admin page, never into code or chat.
7. Open the folder in Antigravity. Check its Rules documentation for where it reads project rules (it reads AGENTS.md and GEMINI.md at the project root).

## How to run a block
Paste the block prompt. Review the plan (Planning mode for server/security blocks), let it run, then verify the exit tests yourself. If a block ends with failures, paste me the agent's report and the error. Don't start the next block on a red exit test unless the failure is logged in docs/KNOWN_ISSUES.md and does not block the next block.

Optional speed-up: Blocks 2 and 3 touch different folders (src/ vs api/). Run them as two parallel agents if your version supports it; the scope line in each prompt enforces the split.


---

## Block 1 — Scaffold + Edamam probe  (~1 h, Fast mode)
**Before you start:** Needs EDAMAM_APP_ID and EDAMAM_APP_KEY in .env.local for the probe. If you do not have them yet, finish P1 and tell me P2 is blocked.

```text
Read AGENTS.md first. This block contains several tasks. Do them strictly in order.
After EACH task: run its exit test yourself (terminal, and the browser for UI), fix until it passes, commit with the message "<task id>: <short title>", then continue.
If a task's exit test still fails after 2 fix attempts: STOP, commit what works, record the problem in docs/KNOWN_ISSUES.md (symptom, what you tried), and report. Do not skip ahead and do not start tasks outside this block.
Scope for this block: any file (scaffold), plus scripts/.
UI rule: use ONLY the semantic colour tokens from src/styles/theme.css (docs/UI_GUIDELINES.md). Before each commit run `npm run verify` and look at every changed screen in BOTH light and dark mode at 375 px.
At the end give ONE combined report in the AGENTS.md format, with a per-task pass/fail line.

=== TASK P1 — Scaffold (Day 0) ===
Read AGENTS.md, then docs/PROJECT_CONTEXT.md, docs/ARCHITECTURE.md, docs/DEVELOPMENT_GUIDELINES.md, docs/UI_GUIDELINES.md.
TASK P1: scaffold the project in the repo root (keep AGENTS.md, GEMINI.md, docs/).
DO:
- Vite + React (JavaScript), Tailwind CSS v4 with the official Vite plugin (verify current install steps in the official docs), react-router-dom, firebase (client), firebase-admin, zod, the official Google Gen AI SDK (verify the current package name in its docs), vitest (dev).
- Create the folder structure in ARCHITECTURE.md only where files exist (no empty placeholder files).
- .gitignore (node_modules, dist, .vercel, .env*, !.env.example, any service-account JSON patterns).
- .env.example listing every var from ARCHITECTURE.md with blank values, comments marking client/server and bootstrap/optional.
- src/firebase.js: initialise from VITE_ vars; throw a clear readable error naming the missing var.
- src/lib/apiClient.js: attaches the Firebase ID token, parses the error envelope from docs/API.md into a typed error.
- src/lib/format.js (naira formatter) and src/lib/constants.js.
- THEME AND BRAND (ChopWise, green and white, light + dark + system): copy the files from starter/ into place exactly as mapped in starter/README.md (theme.css, theme.js, useTheme.js, ThemeToggle.jsx, Logo.jsx, favicon.svg, the index.html head snippet, check-colors.mjs, APP_NAME/APP_TAGLINE constants). Import theme.css once in main.jsx. Add the npm scripts `check:colors` and `verify` from starter/README.md. Leave starter/ untouched afterwards. Do not change any colour value.
- Base components from UI_GUIDELINES (Button, Card, Input, Select, Badge, Spinner, ErrorState, EmptyState, Disclaimer, Toast) built ONLY with semantic tokens and the status mapping table in docs/UI_GUIDELINES.md, and a Layout whose navbar has the Logo and the ThemeToggle on every layout (landing, auth, app, admin) plus a footer.
- A complete static Landing page for ChopWise using APP_NAME and APP_TAGLINE (what the app does, how it works in 3 steps, CTA to register).
- vercel.json: SPA rewrite for non-/api paths; maxDuration for API functions per ARCHITECTURE.md.
- README.md: setup steps, env vars, `vercel dev`, tests.
DO NOT: create any /api file yet, any auth logic, or placeholder pages.
DONE WHEN: `vercel dev` serves the Landing page at 375 px and desktop width in light AND dark mode; the theme toggle cycles System/Light/Dark, persists after refresh and never flashes the wrong theme on load; `npm run verify` passes (colour check, tests, build). Include screenshots or a description of both themes in your report.
Report in the AGENTS.md format.

=== TASK P2 — Edamam probe (Day 0) ===
Read AGENTS.md, then docs/AI_AND_NUTRITION_SPEC.md (Edamam sections and the probe ingredient list) and docs/ADMIN_PAGE_SPEC.md (Edamam links).
TASK P2: de-risk Edamam before building on it.
DO:
- Open the official Edamam Nutrition Analysis API docs in the browser and confirm the endpoint, auth parameters and request/response shape. Note any difference from our docs.
- Write scripts/edamam-probe.mjs (run with `node --env-file=.env.local scripts/edamam-probe.mjs`). It reads EDAMAM_APP_ID and EDAMAM_APP_KEY from the environment only, sends each probe ingredient line from the spec ONE AT A TIME with a 1.5 s delay, and prints a table: line | HTTP status | parsed? | calories | error text. It also analyses 3 realistic full Nigerian meal ingredient lists (egusi soup, jollof rice, beans and plantain) as single requests.
- It never prints the keys.
DO NOT: touch /api or src/.
DONE WHEN: I run it with my keys and it prints the table. Paste the table in your report. Add a short "Edamam findings" note to docs/AI_AND_NUTRITION_SPEC.md.
```


---

## Block 2 — Auth, rules, onboarding (client)  (~1.5 h, Fast mode)
**Before you start:** Can run in parallel with Block 3 if your Antigravity version supports parallel agents. Firestore rules must already be published (pre-flight step 3), otherwise registration will be denied.

```text
Read AGENTS.md first. This block contains several tasks. Do them strictly in order.
After EACH task: run its exit test yourself (terminal, and the browser for UI), fix until it passes, commit with the message "<task id>: <short title>", then continue.
If a task's exit test still fails after 2 fix attempts: STOP, commit what works, record the problem in docs/KNOWN_ISSUES.md (symptom, what you tried), and report. Do not skip ahead and do not start tasks outside this block.
Scope for this block: ONLY files under src/, plus firestore.rules and README.md. Do not touch api/.
UI rule: use ONLY the semantic colour tokens from src/styles/theme.css (docs/UI_GUIDELINES.md). Before each commit run `npm run verify` and look at every changed screen in BOTH light and dark mode at 375 px.
At the end give ONE combined report in the AGENTS.md format, with a per-task pass/fail line.

=== TASK P3 — Auth and guards (Day 1) ===
Read AGENTS.md, then docs/REQUIREMENTS.md (FR1), docs/DATABASE.md (users collection), docs/UI_GUIDELINES.md.
TASK P3: authentication.
DO:
- src/features/auth: AuthContext (onAuthStateChanged, loading state), useAuth.
- Pages: Register (email, password >= 8, confirm, REQUIRED consent checkbox: "I agree to my health information being stored to personalise my meals"), Login. Logout in the navbar.
- On register, create users/{uid} with { email, createdAt, consentAt, profileComplete: false } exactly as in DATABASE.md.
- Map Firebase auth errors to plain-language messages (email in use, wrong password, weak password, network error).
- Routes: ProtectedRoute (not logged in -> /login), ProfileGate (logged in but profileComplete=false -> /onboarding; complete users visiting /onboarding go to /dashboard). Wire routes in App.jsx. Navbar shows links appropriate to state.
- Dashboard, Onboarding, MealDetail, Profile pages do not exist yet: do NOT add placeholder pages. Only register routes for pages that exist. After register/login redirect to /onboarding if that page exists, otherwise tell me what is missing.
DONE WHEN: register works and creates the Firestore doc; refresh keeps the session; logout works; guards redirect correctly. Give me exact manual test steps.

=== TASK P4 — Firestore rules and onboarding (Day 1) ===
Read AGENTS.md, then docs/DATABASE.md, docs/REQUIREMENTS.md (FR2, FR3), docs/UI_GUIDELINES.md.
TASK P4: rules and onboarding.
DO:
- Create firestore.rules exactly as in DATABASE.md and give me the exact console steps to publish it.
- src/features/onboarding: 4 steps per docs (age/gender/weight; conditions; preferences + optional avoid text; weekly budget in naira). Step components are reusable (the Profile page will reuse them). Shared zod schema in schema.js using the limits in DATABASE.md; show inline per-step validation; progress bar; Back/Next; final Save.
- Save to users/{uid}.profile with updatedAt and set profileComplete: true. Redirect to /dashboard if that page exists, otherwise show a clear "Profile saved" screen that is a real part of the flow (not a placeholder).
- Pre-fill when a profile already exists.
DONE WHEN: values persist after refresh; Firestore rules are published; with two accounts, account B cannot read account A's users doc (give me the exact way to test this in the Firebase console Rules Playground or app).
```


---

## Block 3 — Server foundation + Admin API (server)  (~2 h, Planning mode)
**Before you start:** Can run in parallel with Block 2. The curl tests need ADMIN_UIDS: in Firebase console -> Authentication -> Add user, create a throwaway user, copy its UID into ADMIN_UIDS in .env.local, restart vercel dev, and use that user's ID token.

```text
Read AGENTS.md first. This block contains several tasks. Do them strictly in order.
After EACH task: run its exit test yourself (terminal, and the browser for UI), fix until it passes, commit with the message "<task id>: <short title>", then continue.
If a task's exit test still fails after 2 fix attempts: STOP, commit what works, record the problem in docs/KNOWN_ISSUES.md (symptom, what you tried), and report. Do not skip ahead and do not start tasks outside this block.
Scope for this block: ONLY files under api/, plus package.json (only to add a missing dependency) and README.md. Do not touch src/.
UI rule: use ONLY the semantic colour tokens from src/styles/theme.css (docs/UI_GUIDELINES.md). Before each commit run `npm run verify` and look at every changed screen in BOTH light and dark mode at 375 px.
At the end give ONE combined report in the AGENTS.md format, with a per-task pass/fail line.

=== TASK P5 — Server foundation and admin API (Day 1, Planning mode) ===
Read AGENTS.md, then docs/ARCHITECTURE.md, docs/API.md, docs/DATABASE.md, docs/SECURITY.md, docs/ADMIN_PAGE_SPEC.md, docs/AI_AND_NUTRITION_SPEC.md (defaults and seed prices).
TASK P5: server foundation and the Admin API. Plan first, then implement.
DO (all in api/, real working code):
- _lib/http.js (withHandler, AppError, error envelope), firebaseAdmin.js (from FIREBASE_SERVICE_ACCOUNT_B64), auth.js (verifyRequest, requireAdmin using ADMIN_UIDS).
- _lib/crypto.js: AES-256-GCM encrypt/decrypt using CONFIG_ENCRYPTION_KEY, format v1:iv:tag:data. Vitest tests (round trip, tamper detection, wrong key).
- _lib/schemas.js: zod for profile, settings, safety, prices, integration fields, and the meal/AI schemas from API.md.
- _lib/data/defaults.js and data/seedPrices.json (priceNGN null, units per the spec).
- _lib/configStore.js: get/save/reset per section, secret masking (configured + last 4), 60 s cache with invalidation on save, env fallback, empty secret keeps stored value. Vitest tests for masking and keep-on-empty.
- _lib/clients/gemini.js (generateJson with response schema, model from config) and clients/edamam.js (analyzeIngredients). Real implementations; verify SDK usage and the Edamam endpoint in their official docs first.
- _lib/integrations.js: registry for gemini and edamam with metadata, field definitions, helpLinks and steps exactly as in ADMIN_PAGE_SPEC.md, zod schema, and test functions for firestore, gemini, edamam. Persist results to adminConfig/testResults.
- api/admin.js: actions me, status, saveConfig, resetSection, test (targets firestore, gemini, edamam only for now). Functions list contains only what exists.
DO NOT: build recommend/nutrition yet, any UI, or return secrets anywhere.
DONE WHEN (show me the exact curl commands): no token -> 401; non-admin token -> 403 except `me`; admin saveConfig gemini -> status shows configured + masked tail only; `test gemini` returns ok with my real key; Firestore doc for the key is encrypted (v1: prefix); `npm test` passes.
```


---

## Block 4 — Admin page UI (client)  (~1.5 h, Fast mode)
**Before you start:** Needs Blocks 2 and 3 done. Before starting: register your real account in the app, copy its UID from Firebase console -> Authentication -> Users, set it in ADMIN_UIDS (local and Vercel), restart vercel dev.

```text
Read AGENTS.md first. This block contains several tasks. Do them strictly in order.
After EACH task: run its exit test yourself (terminal, and the browser for UI), fix until it passes, commit with the message "<task id>: <short title>", then continue.
If a task's exit test still fails after 2 fix attempts: STOP, commit what works, record the problem in docs/KNOWN_ISSUES.md (symptom, what you tried), and report. Do not skip ahead and do not start tasks outside this block.
Scope for this block: ONLY files under src/ and README.md. Do not touch api/ unless an API bug blocks you; if so, report it instead of fixing silently.
UI rule: use ONLY the semantic colour tokens from src/styles/theme.css (docs/UI_GUIDELINES.md). Before each commit run `npm run verify` and look at every changed screen in BOTH light and dark mode at 375 px.
At the end give ONE combined report in the AGENTS.md format, with a per-task pass/fail line.

=== TASK P6 — Admin page UI (Day 1) ===
Read AGENTS.md, then docs/ADMIN_PAGE_SPEC.md (whole file), docs/API.md (admin section), docs/UI_GUIDELINES.md.
TASK P6: the single Admin page.
DO:
- AdminRoute (calls action `me`; non-admin sees NotFound) and a navbar link visible only to admins. Pages/Admin.jsx is thin; sections live in src/features/admin: FunctionsTable (A), IntegrationCard rendered generically from status.integrations (B), SettingsForm (C), SafetyForm (D), PriceTableEditor (E), BootstrapChecklist (F), useAdminApi hook.
- Exactly the behaviour in the spec: write-only secret fields with masked "Configured ••••1234" state, Save/Test buttons with loading states, per-field server validation errors, Test all, persisted last-test display, live per-meal-cap helper text, price counter and warning banner, Reset buttons.
- Show every help link and step from status.integrations; links open in a new tab with rel="noopener noreferrer".
- Skip section G (evaluation runner) for now.
- Use the browser to open every URL in the Admin page and docs/ADMIN_PAGE_SPEC.md; fix any broken link in code and docs.
DONE WHEN: I paste my Gemini key and Edamam ID/key in /admin, press Test all, and Firestore, Gemini and Edamam show green; reloading never shows the secrets again; a non-admin account sees NotFound at /admin; the page works at 375 px.
```


---

## Block 5 — Recommendations + dashboard  (~2 h, Planning for P7, Fast for P8 mode)
**Before you start:** Extra instruction for P8: onboarding completion must now redirect to /dashboard; remove any interim 'Profile saved' screen left from P4. Needs Gemini key saved in /admin (Block 4).

```text
Read AGENTS.md first. This block contains several tasks. Do them strictly in order.
After EACH task: run its exit test yourself (terminal, and the browser for UI), fix until it passes, commit with the message "<task id>: <short title>", then continue.
If a task's exit test still fails after 2 fix attempts: STOP, commit what works, record the problem in docs/KNOWN_ISSUES.md (symptom, what you tried), and report. Do not skip ahead and do not start tasks outside this block.
Scope for this block: api/ and src/.
UI rule: use ONLY the semantic colour tokens from src/styles/theme.css (docs/UI_GUIDELINES.md). Before each commit run `npm run verify` and look at every changed screen in BOTH light and dark mode at 375 px.
At the end give ONE combined report in the AGENTS.md format, with a per-task pass/fail line.

=== TASK P7 — Recommendation service and endpoint (Day 2, Planning mode) ===
Read AGENTS.md, then docs/AI_AND_NUTRITION_SPEC.md (whole file), docs/API.md (recommend), docs/DATABASE.md, docs/SECURITY.md.
TASK P7: the recommendation pipeline. Plan first, then implement.
DO:
- _lib/services/prompt.js (system instruction + user JSON block exactly per spec; sanitise avoidText; send no identifiers), budget.js (pure), safety.js (pure), rateLimit.js (fixed hourly window per uid using a Firestore transaction on rateLimits/{uid}, limit from settings), recommendationService.js (profile read + zod validation + profileHash + cache check + Gemini JSON call + validate + one retry + budget recompute + over-budget retry per setting + safety flags + id suffix + save latestRecs/current + response).
- api/recommend.js as a thin handler.
- Add the `recommend` function and test target to the Admin registry (pipeline test with a built-in sample profile; saves nothing to users).
- Vitest tests: budget (table, mixed, ai, unconvertible unit, null price), safety (each condition), prompt builder (no identifiers, sanitisation), profileHash stability.
DONE WHEN (give me exact steps): 6 schema-valid meals (2 per type) for a real profile in ~5 s typical; second call returns fromCache true; regenerate true calls Gemini again; the (limit+1)th call returns RATE_LIMITED; removing the Gemini key returns NOT_CONFIGURED; Admin `recommend` test is green; `npm test` passes.

=== TASK P8 — Dashboard UI (Day 2) ===
Read AGENTS.md, then docs/UI_GUIDELINES.md, docs/API.md (recommend), docs/REQUIREMENTS.md (FR5).
TASK P8: dashboard.
DO:
- features/meals/useRecommendations (calls /api/recommend, handles loading/error/NOT_CONFIGURED/RATE_LIMITED, exposes regenerate), MealCard, SafetyBadge, Disclaimer usage.
- pages/Dashboard: greeting, meal grid grouped or chipped by meal type, skeleton loading, friendly errors with Retry; NOT_CONFIGURED shows a clear message plus a link to /admin for admins only; Regenerate button with confirmation of rate limit message; persistent disclaimer.
- Cards link to /meal/:id only if that page exists; otherwise the card is not clickable yet (no dead links).
DONE WHEN: sign up -> onboard -> dashboard shows real Nigerian meals with ₦ costs and badges; refresh shows cached meals without a new Gemini call; works at 375 px.
```


---

## Block 6 — Nutrition, detail page, filters, profile  (~2.5 h, Planning for P9, Fast for the rest mode)
**Before you start:** Needs Edamam keys saved in /admin. Use the P2 'Edamam findings' note to decide how often fallback will trigger.

```text
Read AGENTS.md first. This block contains several tasks. Do them strictly in order.
After EACH task: run its exit test yourself (terminal, and the browser for UI), fix until it passes, commit with the message "<task id>: <short title>", then continue.
If a task's exit test still fails after 2 fix attempts: STOP, commit what works, record the problem in docs/KNOWN_ISSUES.md (symptom, what you tried), and report. Do not skip ahead and do not start tasks outside this block.
Scope for this block: api/ and src/.
UI rule: use ONLY the semantic colour tokens from src/styles/theme.css (docs/UI_GUIDELINES.md). Before each commit run `npm run verify` and look at every changed screen in BOTH light and dark mode at 375 px.
At the end give ONE combined report in the AGENTS.md format, with a per-task pass/fail line.

=== TASK P9 — Nutrition service and endpoint (Day 2, Planning mode) ===
Read AGENTS.md, then docs/AI_AND_NUTRITION_SPEC.md (nutrition and safety), docs/API.md (nutrition), docs/DATABASE.md (nutritionCache), docs/SECURITY.md, and the "Edamam findings" note from P2.
TASK P9: nutrition pipeline. Plan first, then implement.
DO:
- _lib/services/nutritionService.js: load meal by mealId from latestRecs/current or savedMeals (never accept ingredients from the client), build ingredient lines, ingredientsHash, cache lookup/write, Edamam call, fallback to aiNutritionEstimate (vitamins empty) on ANY failure, safety flags from real values, respect enabled flag and rate limits.
- api/nutrition.js thin handler.
- Add the `nutrition` function and test target to the Admin registry (pipeline test on a built-in sample meal; report source).
- Vitest: ingredient-line builder, hash, safety on real values, fallback selection logic (pure parts).
DONE WHEN: a parsable meal returns source edamam with calories/protein/carbs/fat/vitamins; an unparsable meal returns source ai-estimate; a repeat call returns cached true; unknown mealId returns NOT_FOUND; Admin `nutrition` test is green; `npm test` passes.

=== TASK P10 — Meal detail and Save meal (Day 2) ===
Read AGENTS.md, then docs/UI_GUIDELINES.md, docs/API.md (nutrition), docs/DATABASE.md (savedMeals), docs/REQUIREMENTS.md (FR6, FR7, FR10).
TASK P10: meal detail page.
DO:
- pages/MealDetail at /meal/:id: loads the meal from latestRecs/current or savedMeals via Firestore (survives reload), shows cost breakdown per ingredient, ingredients, numbered steps, safety badges, caution notes, disclaimer.
- features/meals/NutritionPanel: calls /api/nutrition on open; shows calories, protein, carbs, fat, sodium, sugar, vitamins; "AI estimate" label when source is ai-estimate with a one-line explanation; "Powered by Edamam" linking to developer.edamam.com when source is edamam; loading and error states.
- Save/Unsave button writing users/{uid}/savedMeals/{mealId}.
- Link dashboard cards to the detail page.
DONE WHEN: opening 3 different meals shows nutrition (at least one forced to fallback by an unparsable ingredient); reload keeps the page working; save/unsave persists; 375 px layout is clean.

=== TASK P11 — Filters and Profile page (Day 2) ===
Read AGENTS.md, then docs/REQUIREMENTS.md (FR8, FR9, FR10), docs/UI_GUIDELINES.md, docs/DATABASE.md.
TASK P11: filters and profile.
DO:
- features/meals/FilterBar on the dashboard: condition tags (match suitableFor), budget range (Within my budget toggle using perMealCapNGN plus a max-price select), meal type chips. Filters are client-side and combine; empty state offers Regenerate.
- pages/Profile: edit profile by reusing onboarding step components; saving updates users/{uid}.profile (so profileHash changes and the next dashboard visit regenerates); list of saved meals with open and remove; logout.
- Check the 3-click rule from the dashboard.
DONE WHEN: all of FR1–FR10 are demonstrable end to end. Give me a checklist table FR -> how to demo it.
```


---

## Block 7 — Hardening + deploy prep  (~1.5 h, Fast mode)
**Before you start:** For P13: prepare only; I deploy myself. If time is short, do P12's security grep and P13's env/rules checklist first and leave the 375 px pass for the debug days.

```text
Read AGENTS.md first. This block contains several tasks. Do them strictly in order.
After EACH task: run its exit test yourself (terminal, and the browser for UI), fix until it passes, commit with the message "<task id>: <short title>", then continue.
If a task's exit test still fails after 2 fix attempts: STOP, commit what works, record the problem in docs/KNOWN_ISSUES.md (symptom, what you tried), and report. Do not skip ahead and do not start tasks outside this block.
Scope for this block: any file, but no new features.
UI rule: use ONLY the semantic colour tokens from src/styles/theme.css (docs/UI_GUIDELINES.md). Before each commit run `npm run verify` and look at every changed screen in BOTH light and dark mode at 375 px.
At the end give ONE combined report in the AGENTS.md format, with a per-task pass/fail line.

=== TASK P12 — Hardening, tests, mobile pass (Day 3) ===
Read AGENTS.md, then docs/SECURITY.md, docs/UI_GUIDELINES.md, docs/DEVELOPMENT_GUIDELINES.md, docs/REQUIREMENTS.md (NFR).
TASK P12: harden without adding features.
DO:
- Global error boundary and toast usage; audit every async call for loading/error/empty states.
- Visit every screen in light AND dark mode at 375 px and desktop: no horizontal page scroll, readable text, 44 px tap targets, labelled inputs, status badges with icon/text, Edamam attribution legible. `npm run check:colors` must be clean (fix by using tokens, never by editing check-colors.mjs).
- Naira format consistent everywhere. Remove any console.log and any dead code or unused files.
- Run npm test and npm run build; fix failures.
- Security grep: search src/, dist/ and the repo for key patterns (AIza, long hex/base64 strings, service-account fields) and confirm none exist; confirm Admin responses never contain secrets.
- Fill gaps in Vitest coverage for pure logic only.
DONE WHEN: tests green, build green, security grep clean, a short before/after list of fixes.

=== TASK P13 — Deploy (Day 3) ===
Read AGENTS.md, then docs/ARCHITECTURE.md, docs/ADMIN_PAGE_SPEC.md (Bootstrap), docs/SECURITY.md (pre-deploy checklist).
TASK P13: prepare and verify deployment to Vercel.
DO:
- Give me exact steps to link the project, set every env var in Vercel (list each name, no values), publish firestore.rules, and deploy. Do NOT run `vercel --prod` unless I say so.
- If Vercel rejects maxDuration for my plan, remove it, report, and note the impact on the 5 s target.
- After I deploy, run a production smoke test with me: register, onboard, dashboard, meal detail, save meal, /admin (as admin), Test all, non-admin gets NotFound.
- Tick the pre-deploy checklist in docs/SECURITY.md with evidence for each item.
DONE WHEN: the production URL passes the smoke test and the checklist is fully ticked.
```


---

# Debug days

## Day 2 morning — deploy + smoke test
Do Block 7's P13 steps yourself (link project, set env vars in Vercel, publish rules, `vercel --prod`). Then smoke test the production URL: register, onboard, dashboard, meal detail, save meal, /admin as admin, Test all, non-admin NotFound. Log every failure in docs/KNOWN_ISSUES.md using the template in docs/DEBUGGING.md.

## Debug prompt (use for every bug, one bug per prompt)
```text
Read AGENTS.md and docs/DEBUGGING.md, then the docs relevant to this bug.
MODE: DEBUG. Do not add features.
BUG: <one-sentence symptom>
STEPS TO REPRODUCE: <exact steps>
EXPECTED: <what should happen>   ACTUAL: <what happens, include the exact error text and the browser console / terminal output>
DO:
1. Reproduce it first and show me how.
2. Find the ROOT CAUSE (not the visible symptom). Explain it in 3 sentences.
3. Make the smallest fix that removes the cause. Do not rewrite working code.
4. Add a Vitest regression test if the bug is in pure logic.
5. Re-run the reproduction and the related exit tests from docs/TODO.md to prove nothing else broke.
6. Add a row to docs/KNOWN_ISSUES.md (status: fixed) and a line to docs/CHANGELOG.md.
Report: root cause, files changed, proof it is fixed, anything still risky.
```

## Day 2 afternoon — evidence run (P14 if you have energy, otherwise by hand)
Option A (optional, ~1.5 h): paste P14 below. Option B (recommended if tired): run the 10 profiles by hand through the app and record results in a table (inputs, meals returned, over-budget flags, safety flags, Edamam vs AI-estimate, response time).


### P14 — Evaluation runner (optional)
```text
Read AGENTS.md, then docs/ADMIN_PAGE_SPEC.md (section G), docs/API.md (admin), docs/AI_AND_NUTRITION_SPEC.md.
TASK P14: evaluation runner for Chapter 4 evidence.
DO:
- api/_lib/data/evaluationProfiles.js: 10 fixed profiles (each condition alone, combined conditions, N5,000/week and generous budgets, vegetarian, student, worker).
- Admin action runEvaluationCase {index}: runs ONE profile through the real recommendation service, then nutrition for 2 of its meals sequentially with a delay, and returns: meals count, schema-valid count, within-budget count, safety-flag counts, Edamam vs fallback per meal, latency. No HTTP self-calls; nothing saved to real users.
- Admin section G: Run button loops index 0..9 one request at a time with progress, result table, summary metrics (per AI_AND_NUTRITION_SPEC), Download CSV.
DONE WHEN: I run it and get a 10-row table plus CSV; no request exceeds the function time limit.
```


## Day 3 — final audit (paste once, after bugs are fixed)

```text
Read AGENTS.md and every doc in docs/.
TASK P15: audit the whole repo against the docs. Fix criticals; report the rest.
DO:
- Table: every FR, AR, NFR and SECURITY control -> status (pass/fail/partial) -> evidence (file, test, or manual result).
- Definition of Active check: find any stub, mock, placeholder, TODO body, dead link or unreachable file and fix it.
- Find every place code and docs disagree; update the docs, and add CHANGELOG lines.
- List anything I must change in Chapter 3 or the diagrams because of deviations in docs/PROJECT_CONTEXT.md section 7.
DONE WHEN: no critical failures remain; the table and the Chapter-3 change list are in your report.
```


## Day 3 — freeze checklist
- [ ] All S1/S2 issues in docs/KNOWN_ISSUES.md fixed; S3/S4 fixed or consciously accepted
- [ ] `npm test` and `npm run build` green; final production deploy done; `git tag mvp-final`
- [ ] Pre-deploy checklist in docs/SECURITY.md fully ticked
- [ ] Evidence captured (list in docs/DEBUGGING.md)
- [ ] Chapter 3 updated for the deviations (docs/PROJECT_CONTEXT.md section 7)
- [ ] Any key that was ever pasted into chat or a screenshot has been rotated
