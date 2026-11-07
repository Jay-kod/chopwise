# REQUIREMENTS.md

## Functional requirements (from Chapter 3)
| ID | Requirement | Where | Acceptance criteria |
|----|-------------|-------|---------------------|
| FR1 | Register/login with email + password (Firebase Auth) | `/register`, `/login` | Register creates `users/{uid}`; session survives refresh; logout works; Firebase errors shown in plain language; login test-account shortcuts prefill only the provisioned Test User or Test Admin email and still require a password |
| FR2 | Multi-step onboarding: age, gender, weight, conditions, preferences, weekly budget | `/onboarding` | 4 steps, per-step validation, back/next, progress bar, limits from DATABASE.md |
| FR3 | Save/retrieve profile in Firestore | `users/{uid}.profile` | Reload shows saved values; another account cannot read it |
| FR4 | Send profile to Gemini, receive Nigerian meals | `POST /api/recommend` | 6 valid meals (2 per meal type) in ~5 s typical; profile read server-side; no personal identifiers sent to Gemini |
| FR5 | Dashboard meal cards: name, estimated cost, short description | `/dashboard` | Cards show name, ₦ cost, description, meal-type chip, badges |
| FR6 | Edamam nutrition: calories, protein, carbs, fat, vitamins | `POST /api/nutrition` | Real Edamam data when parsable; otherwise AI estimate labelled as such |
| FR7 | Meal detail: ingredients, steps, nutrition | `/meal/:id` | Opens from card and survives reload |
| FR8 | Filter by condition, budget range, meal type | Dashboard filter bar | Filters combine; empty state offers Regenerate |
| FR9 | Update profile any time | `/profile` | Saving changes the profile hash so the next visit regenerates |
| FR10 | Save/unsave meals (addition) | Detail page, `/profile` | Saved list persists |

## Admin requirements
| ID | Requirement | Acceptance criteria |
|----|-------------|---------------------|
| AR1 | Only admins access `/admin` | Enforced on the server by `ADMIN_UIDS`; non-admin sees Not Found; non-admin API calls return 403 |
| AR2 | One page lists every function/API with status and Test button | Functions table: Firestore, Gemini, Edamam, Recommendation pipeline, Nutrition pipeline |
| AR3 | Each integration card has how-to-get links + steps and accepts keys | Links verified to open; secret fields are write-only and show masked state |
| AR4 | Secrets encrypted at rest and never returned to any client | AES-256-GCM; API returns only `configured` + last 4 chars mask |
| AR5 | Test results persisted with timestamp | Table shows last result and time after refresh |
| AR6 | Editable settings, safety thresholds, price table | Validated on server; reset-to-default per section |
| AR7 | Changes apply without redeploy | Effective within 60 s (config cache TTL) |
| AR8 | Bootstrap checklist | Shows detected/missing env vars as booleans only, with links |
| AR9 | (optional, cut first) Evaluation runner | Runs 10 fixed profiles one request at a time, shows metrics, CSV download |

## Non-functional requirements
| NFR | Implementation |
|-----|----------------|
| Usability | Plain labels, progress bar, any action within 3 clicks of dashboard |
| Performance | One Gemini call for 6 meals, Flash-tier model, Edamam only on meal open, caching; target 5 s |
| Reliability | try/catch everywhere, friendly errors, one retry on malformed AI JSON, nutrition fallback |
| Security | See SECURITY.md |
| Scalability | Stateless functions, Firestore, caches |
| Accessibility | Mobile-first, 375 px, labelled inputs, WCAG AA contrast in BOTH light and dark themes, visible focus ring |
| Theming | Light, dark and system modes with no flash; every colour is a semantic token in `src/styles/theme.css`; `npm run check:colors` enforces it |
| Maintainability | Modular components, thin handlers, config in one place |
