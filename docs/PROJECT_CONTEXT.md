# PROJECT_CONTEXT.md

## 1. What we are building
Product name: **ChopWise**. Tagline: "Nigerian meals that fit your health and your wallet." Brand: green and white, with light, dark and system themes (see docs/UI_GUIDELINES.md).

Title: **Development of an (AI Based) Recipe System for Personalized Dietary Needs** (BSc Computer Science, Nasarawa State University, Keffi; Chapters 1–3 already written, the build must match them).

A responsive web app that generates personalised **Nigerian** meal recommendations from a user profile (age, gender, weight, medical conditions, dietary preferences, weekly food budget in naira), shows nutrition for each meal, and keeps suggestions inside the user's budget and health constraints.

A single **Admin page** (`/admin/dashboard`) holds every function and API integration in one place: status of each, how-to-get links, key entry, settings, tests. All admin pages use `/admin/<page-name>`; all customer pages use `/customer/<page-name>`. The public landing page remains `/`.

Deadline: 3 days. Target: working MVP deployed on Vercel.

## 2. Defence points (the app must visibly show these)
Examiners will ask "why not just ask Gemini directly?" Answers built into the product:
1. Persistent structured profile; the user never re-types it.
2. Naira budget enforced **in code** (price table + cost recomputation), not just in the prompt.
3. Nutrition verified through Edamam where it can parse the ingredients; clearly labelled "AI estimate" otherwise.
4. Deterministic safety check flags meals unsuitable for declared conditions.
5. Admin page: configurable, observable, testable system.

## 3. Users
Busy workers; people managing hypertension, diabetes, obesity or ulcers; NSUK students on tight budgets. Two actors: **User** and **Admin** (Admin is new vs Chapter 3's single actor; see section 7).

## 4. Scope
In scope: FR1–FR9 and AR1–AR8 in `docs/REQUIREMENTS.md`, plus Save meal.
Out of scope (do NOT build): chat UI, meal calendar, grocery lists, image upload/recognition, social login, forgot-password flow, PWA/offline, payments, push notifications, multi-language, analytics dashboards, custom ML training, microservices.

## 5. Locked stack
- Frontend: React (Vite, JavaScript), Tailwind CSS, React Router.
- Auth + DB: Firebase Auth (email/password) + Firestore.
- Server: Vercel serverless functions in `/api` (Node, ES modules), `firebase-admin`, `zod`.
- AI: Google Gemini API via the official Google Gen AI JS SDK (verify current package name in the Gemini SDK docs). JSON mode with response schema.
- Nutrition: Edamam Nutrition Analysis API (verify endpoint and plan limits in Edamam docs).
- Tests: Vitest for pure logic.
- Hosting: Vercel. Local dev: `vercel dev`.

## 6. Document map
See the table in `AGENTS.md`. Each fact lives in exactly one doc; other docs link to it instead of repeating it.

## 7. Deviations from Chapter 3 (reconcile in the write-up)
1. Server-side proxy (Vercel functions) for Gemini and Edamam instead of browser calls, to protect keys.
2. Gender field added to onboarding (Section 2.1.1 of the thesis cites different calorie needs by sex).
3. Save meal added (data layer lists "saved meals" but no FR creates them).
4. Edamam is called when a meal is opened (matches DFD Process 4.0); Figure 3.4 says per meal on generation, update it.
5. Safety flags and AI-estimate fallback added; Chapter 3 should state Edamam may not parse every Nigerian ingredient.
6. Admin actor + Admin page added (update use-case diagram, Figure 3.2).
7. Firebase file storage is listed in Chapter 3 but unused.
8. Consent checkbox at registration for storing health information.

## 8. Glossary
- **Bootstrap env vars**: the few environment variables that must exist before the app can start (Firebase config, service account, admin UIDs, encryption key). Cannot be managed from the Admin page.
- **Admin-managed config**: everything else (Gemini key/model, Edamam keys, settings, safety thresholds, price table), stored in Firestore `adminConfig/*`, secrets encrypted.
- **perMealCapNGN**: weekly budget divided by budgetDivisor (default 21).
- **Pipeline test**: Admin test that runs the real recommendation or nutrition code with a built-in sample.
