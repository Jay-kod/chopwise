# REQUIREMENTS.md

## Functional requirements (from Chapter 3)
| ID | Requirement | Where | Acceptance criteria |
|----|-------------|-------|---------------------|
| FR1 | Register/login with email + password | `/customer/register`, `/customer/login`, `/admin/login` | Registration and customer login are available to all users; admins have a separate sign-in page that verifies admin access server-side; session survives refresh; logout works; auth errors are shown in plain language; test-account shortcuts are shown only on their matching sign-in page |
| FR2 | Multi-step onboarding: age, gender, weight, conditions, preferences, weekly budget | `/customer/onboarding` | 4 steps, per-step validation, back/next, progress bar, limits from DATABASE.md; successful completion confirms setup, signs the customer out, and returns them to `/customer/login` |
| FR3 | Save/retrieve profile in MySQL | `users.profile` scoped to authenticated user ID | Reload shows saved values; another account cannot read it |
| FR4 | Send profile to Gemini, receive Nigerian meals | `POST /api/recommend` | 6 valid meals (2 per meal type) in ~5 s typical; profile read server-side; no personal identifiers sent to Gemini |
| FR5 | Dashboard meal cards: name, estimated ingredient cost, short description | `/customer/dashboard` | Cards show name, estimated ₦ ingredient cost, description, meal-type chip, badges |
| FR6 | USDA nutrition: calories, protein, carbs, fat, vitamins/minerals | `POST /api/nutrition` | USDA composition data when all ingredients match and use grams; otherwise AI estimate labelled as such; meal detail offers a fresh USDA lookup |
| FR7 | Meal detail: ingredients, steps, nutrition and optional AI feedback | `/customer/meal/:id` | Opens from card and survives reload; customers can request general AI food feedback without sending profile data |
| FR8 | Filter by condition, budget range, meal type | Dashboard filter bar | Filters combine; empty state offers Regenerate |
| FR9 | Update profile any time | `/customer/profile` | Saving changes the profile hash so the next visit regenerates |
| FR10 | Save/unsave meals (addition) | `/customer/meal/:id`, `/customer/saved` | Dedicated saved meals page and saved list persist |
| FR11 | Browse shared recipe catalogue | `/customer/recipes` | Signed-in customers can browse active catalogue recipes; catalogue does not alter personalized recommendations |
| FR12 | Analyze a selected meal | `/customer/analysis` | Signed-in customers can select a current recommendation, saved meal, or catalogue recipe and request general AI feedback and a fresh USDA nutrition check; errors and empty states are shown |

## Admin requirements
| ID | Requirement | Acceptance criteria |
|----|-------------|---------------------|
| AR1 | Only admins access `/admin/*` | Dedicated admin sign-in at `/admin/login`; authorization is enforced by the server; non-admin sees Not Found; non-admin API calls return 403 |
| AR2 | Admin portal lists every function/API with status and Test button | Functions table: MySQL, Gemini, USDA FoodData Central, Recommendation pipeline, Nutrition pipeline |
| AR3 | Each integration card has how-to-get links + steps and accepts keys | Links verified to open; secret fields are write-only and show masked state |
| AR4 | Secrets encrypted at rest and never returned to any client | AES-256-GCM; API returns only `configured` + last 4 chars mask |
| AR5 | Test results persisted with timestamp | Table shows last result and time after refresh |
| AR6 | Editable settings, safety thresholds, price table | Validated on server; reset-to-default per section |
| AR7 | Changes apply without redeploy | Effective within 60 s (config cache TTL) |
| AR8 | Bootstrap checklist | Shows detected/missing env vars as booleans only, with links |
| AR9 | (optional, cut first) Evaluation runner | Runs 10 fixed profiles one request at a time, shows metrics, CSV download |
| AR10 | Manage customer accounts safely | Search/list account metadata, change email, and reversibly disable/enable accounts; never expose or edit health profiles/passwords; no admin-created customer accounts or permanent deletion |
| AR11 | Manage shared recipes | Admin CRUD for validated catalogue recipes; customers can browse active entries; personalized recommendations remain Gemini-generated |
| AR12 | Manage additional administrators | Grant/revoke admin to existing active accounts; `ADMIN_UIDS` bootstrap admins cannot be removed or disabled through the app |
| AR13 | Preserve admin activity history | Privileged changes and maintenance actions create append-only audit records; logs are read-only and exclude secrets, passwords, JWTs, and health profiles |
| AR14 | Perform bounded system maintenance | Admin can clear nutrition cache and reset rate-limit counters only; customer data is not purged |
| AR15 | Analyze integration and pipeline health | `/admin/analysis` | Admin can inspect Gemini/USDA configuration status and persisted test results, refresh status, and run individual or all live diagnostics; no customer-usage analytics are collected or shown |

## Non-functional requirements
| NFR | Implementation |
|-----|----------------|
| Usability | Plain labels, progress bar, any action within 3 clicks of dashboard |
| Performance | One Gemini call for 6 meals, Flash-tier model, USDA lookups only when nutrition is requested, caching; target 5 s |
| Reliability | try/catch everywhere, friendly errors, one retry on malformed AI JSON, nutrition fallback |
| Security | See SECURITY.md |
| Scalability | Stateless functions, Firestore, caches |
| Accessibility | Mobile-first, 375 px, labelled inputs, WCAG AA contrast in BOTH light and dark themes, visible focus ring |
| Theming | Light, dark and system modes with no flash; every colour is a semantic token in `src/styles/theme.css`; `npm run check:colors` enforces it |
| Maintainability | Modular components, thin handlers, config in one place |
