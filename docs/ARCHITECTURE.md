# ARCHITECTURE.md

## Layers
```
Browser (React)
  |- Firebase Auth (client SDK) -> ID token
  |- Firestore (client SDK, rules-protected): own profile, savedMeals, latestRecs (read)
  v
Vercel functions (/api): recommend.js, nutrition.js, admin.js   (3 functions only; keep count low)
  |- verify Firebase ID token (firebase-admin)
  |- read admin-managed config (Firestore adminConfig/*, decrypt, 60 s cache, env fallback)
  |- call Gemini / Edamam
  v
Firestore (server writes via Admin SDK): latestRecs, nutritionCache, rateLimits, adminConfig
```
The browser never talks to Gemini or Edamam.

## Config resolution (`api/_lib/configStore.js`)
1. Read Firestore `adminConfig/*`, decrypt secret fields, cache in memory 60 s (invalidate on save).
2. If a value is absent, fall back to env: `GEMINI_API_KEY`, `GEMINI_MODEL`, `EDAMAM_APP_ID`, `EDAMAM_APP_KEY`.
3. If still absent: the integration is "not configured"; callers throw `NOT_CONFIGURED` with the missing integration id.

## Bootstrap env vars (cannot live in Admin page)
Client (Vite, public by design): `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`.
Server only: `FIREBASE_SERVICE_ACCOUNT_B64`, `ADMIN_UIDS` (comma-separated Firebase UIDs), `CONFIG_ENCRYPTION_KEY` (32 random bytes, base64).
Optional server fallbacks: `GEMINI_API_KEY`, `GEMINI_MODEL`, `EDAMAM_APP_ID`, `EDAMAM_APP_KEY`.
Commit only `.env.example` (blank values). `.env*` stays in `.gitignore`.

## Server folders
```
api/
  recommend.js            thin: method -> auth -> service -> respond
  nutrition.js
  admin.js                action router -> api/_lib/admin handlers
  _lib/                   (underscore prefix: not deployed as functions)
    http.js               withHandler(), AppError classes, error envelope
    firebaseAdmin.js      init from FIREBASE_SERVICE_ACCOUNT_B64
    auth.js               verifyRequest(req), requireAdmin(req)
    crypto.js             encrypt/decrypt (AES-256-GCM, "v1:iv:tag:data")
    configStore.js        get/save/reset/mask config sections
    integrations.js       registry: metadata, field defs, help links, steps, zod schema, test fn
    schemas.js            zod: profile, meal, aiResponse, settings, safety, prices
    clients/gemini.js     generateJson(...)
    clients/edamam.js     analyzeIngredients(...)
    services/             recommendationService, nutritionService, budget, safety, prompt, rateLimit
    data/                 defaults.js, seedPrices.json, evaluationProfiles.js (AR9 only)
```

## Client folders
```
src/
  main.jsx  App.jsx  firebase.js
  routes/      ProtectedRoute, ProfileGate, AdminRoute
  pages/       Landing, Login, Register, Onboarding, Dashboard, MealDetail, Saved, Profile, Admin, NotFound
  features/
    auth/        AuthContext, useAuth
    onboarding/  steps/*, schema.js
    meals/       MealCard, FilterBar, SafetyBadge, NutritionPanel, useRecommendations
    admin/       FunctionsTable, IntegrationCard, SettingsForm, SafetyForm, PriceTableEditor,
                 BootstrapChecklist, EvaluationRunner (AR9), useAdminApi
  components/  Button, Card, Input, Select, Badge, Spinner, ErrorState, EmptyState, Disclaimer, Toast, Logo, ThemeToggle
  lib/         apiClient.js (attaches token, parses error envelope), format.js (naira), constants.js (APP_NAME, APP_TAGLINE),
               theme.js, useTheme.js
  styles/      theme.css (the only file with colour values)
public/        favicon.svg
starter/       brand + theme source files copied in at P1 (leave untouched afterwards)
scripts/       edamam-probe.mjs, check-colors.mjs (dev tooling)
```
Pages are thin; logic lives in `features/*`.

## Client routes
- Public pages: `/`, `/login`, `/register`, `/admin/login`
- Customer pages (sidebar shown once unlocked): `/onboarding` (full-screen wizard), `/dashboard` (recommendations & filters), `/meal/:id` (recipe details), `/saved` (bookmarked meals), `/profile` (dietary profile & budget)
- Admin portal: `/admin` (admin only, with sidebar section anchors: `#functions`, `#gemini`, `#edamam`, `#settings`, `#safety`, `#prices`, `#checklist`, `#evaluation`)

## Request flows
**Recommend:** token -> rate limit -> read profile (server) -> validate -> profile hash; if cached and `regenerate` false return cache -> build prompt -> Gemini JSON -> validate (retry once) -> budget recompute -> over-budget retry (per setting) -> safety flags -> save `latestRecs/current` -> respond.
**Nutrition:** token -> load meal by `mealId` from `latestRecs/current` or `savedMeals` (never trust client ingredients) -> ingredient hash -> cache hit? -> Edamam -> on failure AI estimate -> safety flags -> cache -> respond.
**Admin:** token -> `requireAdmin` (except `me`) -> action handler -> response.

## Deployment
Vercel serves the Vite build and `/api`. `vercel.json`: SPA rewrite for non-API paths; set `maxDuration` for API functions as high as the plan allows (target 30 s; if Vercel rejects it, remove and report).
