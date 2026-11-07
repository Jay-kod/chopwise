# TODO.md — one-day build, then debug days
Tick a box only when the exit test passes. Prompts are in AGENT_PROMPTS.md (blocks bundle several tasks). Task prompts name the docs to read.

## Day 1 — build (pre-flight first, see AGENT_PROMPTS.md)
### Block 1 — scaffold + probe
- [x] **P1** Scaffold — exit: `vercel dev` serves the ChopWise Landing; theme toggle works (system/light/dark, persists, no flash); `npm run verify` passes
- [x] **P2** Edamam probe — exit: table of which Nigerian ingredients Edamam parses
### Block 2 — client foundation (parallel-safe with Block 3)
- [x] **P3** Auth + guards — exit: register -> users doc created; refresh keeps session; logout; guards redirect
- [x] **P4** Rules + onboarding — exit: profile persists; second account cannot read it
### Block 3 — server foundation (parallel-safe with Block 2)
- [x] **P5** Server foundation + Admin API — exit: 401/403 checks; saved Gemini key encrypted (`v1:`); `test gemini` ok; crypto tests pass
### Block 4
- [x] **P6** Admin page UI — exit: paste Gemini + Edamam keys; Test all green; secrets masked; non-admin NotFound
### Block 5
- [x] **P7** Recommendation service + endpoint — exit: 6 valid meals; cache; 11th call RATE_LIMITED; missing key NOT_CONFIGURED; Admin `recommend` test green
- [x] **P8** Dashboard — exit: sign up -> onboard -> real meals
### Block 6
- [x] **P9** Nutrition service + endpoint — exit: edamam result, AI-estimate fallback, cache, NOT_FOUND; Admin `nutrition` test green
- [x] **P10** Meal detail + Save — exit: detail survives reload; save/unsave persists
- [ ] **P11** Filters + Profile — exit: FR1–FR10 demonstrable
### Block 7
- [ ] **P12** Hardening — exit: `npm run verify` green; no key strings in `dist/`; every screen checked in light AND dark at 375 px
- [ ] **P13** Deploy prep — exit: env/rules checklist ready

## Day 2 — deploy and fix
- [ ] Deploy to Vercel; production smoke test (log failures in KNOWN_ISSUES.md)
- [ ] 10-profile evidence run (P14 optional, or by hand)
- [ ] Fix all S1 and S2 issues (see DEBUGGING.md)

## Day 3 — finish
- [ ] Fix S3/S4 issues; 375 px pass
- [ ] Evidence for Chapter 4 (list in DEBUGGING.md); SUS form
- [ ] P15 final audit; Chapter 3 updated for deviations
- [ ] Final deploy, `git tag mvp-final`, freeze

## Cut order if Day 1 overruns (finish the rest in Day 2 morning)
1. P14 evaluation runner (never on Day 1)
2. Price-table editor UI (fill `seedPrices.json` by hand)
3. Safety-thresholds editor UI (keep defaults)
4. Saved-meals list on Profile (keep the Save button)
5. Never cut: auth, onboarding, recommend, nutrition with fallback, Admin keys + tests, rules, disclaimer
