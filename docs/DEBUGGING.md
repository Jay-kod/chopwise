# DEBUGGING.md — playbook for the debug days

## Rules
1. Reproduce first. No fix without a reproduction.
2. Root cause, not symptom. Explain the cause in a few sentences before changing code.
3. Smallest fix. Do not rewrite working code. No new features.
4. One bug at a time. Re-run the related exit tests from TODO.md afterwards.
5. Log every bug in KNOWN_ISSUES.md; add a CHANGELOG line when fixed.
6. Pure-logic bugs (budget, safety, prompt, hashing, crypto, masking) get a Vitest regression test.

## Severity (fix in this order)
- **S1** blocks a core flow: register/login, onboarding, recommend, nutrition (incl. fallback), Admin keys + tests, rules.
- **S2** data or security: wrong data shown, secret exposure, rule or admin-check gaps, quota abuse.
- **S3** UX: layout at 375 px, confusing errors, missing loading/empty states.
- **S4** polish: wording, spacing, minor visuals.

## Likely failure points
| Symptom | Likely cause | Check |
|---|---|---|
| `/api/*` returns 404 locally | running plain Vite | use `vercel dev` |
| 401 on every API call | token missing/expired, or service account env wrong | log the failing step (never the token); re-encode service account base64 without line breaks |
| Admin page shows NotFound for you | `ADMIN_UIDS` missing, has spaces, or holds the wrong UID | compare against Firebase console UID; restart `vercel dev`; redeploy after changing Vercel env |
| Saved key still "not configured" | config cache (60 s), or `CONFIG_ENCRYPTION_KEY` changed after saving | wait 60 s; if the key changed, re-save the secrets |
| Gemini test fails | wrong/typo model name, key restricted, region/free-tier limit | pick a current model from the Models page; test the key in AI Studio |
| Gemini returns schema errors | response schema too strict or unsupported field types | log the validation error (no secrets); simplify the schema; keep one retry |
| Meals over budget every time | price table empty or per-meal cap too small | fill prices in Admin; check budgetDivisor and the user's budget |
| Edamam 401 | credentials from a different Edamam API | create the app under Nutrition Analysis API |
| Edamam always falls back | unparseable local names, request rejected as a whole | check the P2 findings; send simpler ingredient names; expected for some dishes |
| Edamam limit errors | free plan rate limit | cache is keyed by ingredient hash; avoid bursts; raise delay |
| Firestore permission denied | rules not published or client reading server-only docs | re-publish rules; check which path is read |
| Works locally, fails in production | env vars missing in Vercel, or not redeployed | compare `.env.example` names with Vercel; redeploy |
| Function timeout in production | Gemini slow or `maxDuration` not applied | check Vercel logs; try a faster model; reduce `mealsPerType` |
| RATE_LIMITED too early/late | window logic or limit setting | check `rateLimits/{uid}` doc and the Admin setting |
| Text unreadable or wrong colours in dark mode | a raw colour or `dark:` class bypassing tokens | `npm run check:colors`; swap in a token; change colours only in `src/styles/theme.css` |
| Flash of the wrong theme on load | head script missing or placed after the bundles | compare `index.html` head with `starter/index.head.html` |
| Dashboard empty after profile edit | profileHash changed and regeneration failed | check recommend errors; try Regenerate |

## Evidence to capture for Chapter 4
Screenshots: landing, register, each onboarding step, dashboard (with badges), filters in use, meal detail with Edamam data, meal detail with "AI estimate", saved meals, profile, Admin Functions table (all green), Admin key card (masked), mobile views at 375 px, and light + dark pairs of the main screens.
Data: the 10-profile results table; `npm test` output; Vercel production URL; response-time samples; SUS form responses (about 10 users).
Diagrams to update: use case (add Admin actor), DFD and flowchart (Edamam on meal open).

## Bug template (copy into KNOWN_ISSUES.md)
`| ID | Severity | Symptom | Reproduction | Root cause | Fix / status |`
