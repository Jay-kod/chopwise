# ARCHITECTURE.md

## Layers
```
Browser (React)
  |- /api/auth -> email/password, scrypt hashes, server-issued JWT
  |- /api/recommend, /api/nutrition -> authenticated customer operations
  |- /api/catalog -> authenticated, read-only recipe catalogue
  v
Vercel functions (/api): auth.js, recommend.js, nutrition.js, admin.js, catalog.js
  |- verify JWT and active account in MySQL
  |- check bootstrap or database-managed admin role for privileged actions
  |- read/write MySQL through prepared statements
  |- call Gemini / Edamam from the server only
  v
MySQL/MariaDB: users, saved_meals, latest_recs, nutrition_cache, rate_limits,
admin_config, admin_roles, recipe_catalog, admin_activity
```
The browser never talks directly to MySQL, Gemini or Edamam.

## Config resolution (`api/_lib/configStore.js`)
1. Read `admin_config`, decrypt secret fields, cache in memory for 60 seconds, and invalidate after a successful save.
2. If a value is absent, fall back to optional server env vars: `GEMINI_API_KEY`, `GEMINI_MODEL`, `EDAMAM_APP_ID`, `EDAMAM_APP_KEY`.
3. If still absent, report the integration as not configured; callers return `NOT_CONFIGURED`.

## Bootstrap env vars (cannot live in Admin page)
Server only: `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`, `JWT_SECRET` (at least 32 characters), `ADMIN_UIDS` (comma-separated account IDs protected as bootstrap admins), and `CONFIG_ENCRYPTION_KEY` (32 random bytes, base64).
Optional server fallbacks: `GEMINI_API_KEY`, `GEMINI_MODEL`, `EDAMAM_APP_ID`, `EDAMAM_APP_KEY`. Local MySQL connection defaults are documented in `DATABASE.md`.
No MySQL password, token signing secret, or API key may be placed in frontend variables. `.env*` stays in `.gitignore`.

## Server folders
```
api/
  auth.js                 registration, login and customer-owned data
  recommend.js            recommendation endpoint
  nutrition.js            nutrition endpoint
  admin.js                admin action router
  catalog.js              authenticated customer catalogue read endpoint
  _lib/
    http.js               withHandler(), AppError classes, error envelope
    mysql.js              MySQL pool and additive schema initialization
    auth.js               verifyRequest(req), requireAdmin(req)
    authTokens.js         scrypt password hashes and HMAC-SHA256 JWTs
    crypto.js             encrypt/decrypt (AES-256-GCM, "v1:iv:tag:data")
    configStore.js        get/save/reset/mask config sections
    integrations.js       integration registry and health tests
    schemas.js            zod request, recipe, settings, safety and price schemas
    clients/              Gemini and Edamam server clients
    services/             recommendation, nutrition, admin management, budget, safety, prompt, rate limit
    data/                 defaults.js, seedPrices.json, evaluationProfiles.js
mysql/
  schema.sql              canonical schema for MySQL/MariaDB
```

## Client folders
```
src/
  main.jsx  App.jsx
  routes/      ProtectedRoute, ProfileGate, AdminRoute
  pages/       customer pages, admin login, shared catalogue browser, modular admin pages
  features/
    auth/        AuthContext, useAuth
    onboarding/  steps/*, schema.js
    meals/       MealCard, FilterBar, SafetyBadge, NutritionPanel, useRecommendations
    admin/       system configuration, customer accounts, catalogue, audit, access and maintenance
  components/  shared UI primitives and shell
  lib/         apiClient.js (attaches JWT, parses error envelope), routes.js, format.js
  styles/      theme.css (the only file with colour values)
```
Pages remain thin; domain behavior lives in `features/*`.

## Client routes
- Public pages: `/`, `/customer/login`, `/customer/register`, `/admin/login`
- Customer pages: `/customer/onboarding`, `/customer/dashboard`, `/customer/meal/:id`, `/customer/saved`, `/customer/profile`, `/customer/recipes`
- Admin pages: `/admin/dashboard`, `/admin/functions`, `/admin/gemini`, `/admin/edamam`, `/admin/settings`, `/admin/safety`, `/admin/prices`, `/admin/checklist`, `/admin/evaluation`, `/admin/customers`, `/admin/recipes`, `/admin/activity`, `/admin/access`, `/admin/maintenance`
- Admin routes require an active session and server-side role authorization. Legacy paths redirect to namespaced routes.

## Admin data controls
- Customer management exposes account metadata only; health profiles and password hashes are excluded. Admin-created customer accounts and permanent deletes are not available. Deactivation is reversible and invalidates existing sessions on the next request.
- The recipe catalogue is shared and customer-browsable; it is separate from personalized Gemini recommendations.
- `ADMIN_UIDS` entries are protected bootstrap admins. Additional admins are existing active users stored in `admin_roles`.
- `admin_activity` records successful privileged mutations and maintenance actions; the admin UI is read-only.
- Maintenance can clear nutrition cache or reset rate-limit counters only; it cannot purge customer data.

## Request flows
**Auth:** registration/login -> verify password hash -> issue HMAC JWT -> on authenticated request, verify JWT and require an active MySQL user.
**Recommend:** token -> rate limit -> read own profile -> validate -> profile hash -> cache lookup -> Gemini JSON -> validate -> budget recompute -> optional over-budget retry -> safety flags -> store latest recommendations -> respond.
**Nutrition:** token -> load meal by ID from the caller's latest recommendations or saved meals -> ingredient hash/cache -> Edamam -> AI estimate fallback -> store cache -> respond.
**Catalogue:** active customer token -> validate pagination/search -> return published catalogue recipes only.
**Admin:** active token -> verify bootstrap UID or database role on each request -> validate action and payload -> perform operation and append audit event for mutations.

## Deployment
Vercel serves the Vite build and `/api`. MySQL/MariaDB must be reachable from the API runtime. `vercel.json` keeps SPA rewrites scoped to non-API paths.
