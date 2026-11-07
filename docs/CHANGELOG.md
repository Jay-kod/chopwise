# CHANGELOG.md
Add one line per task: date, task id, what changed, doc updates.

## Unreleased — planning decisions (2026-11-07)
- Stack locked to Chapter 3: React, Firebase, Gemini, Edamam, Vercel.
- Added server-side proxy (3 Vercel functions) so keys never reach the browser.
- Added Admin page: all functions/APIs, key entry with how-to links, settings, thresholds, price table, tests.
- Admin identity by UID (`ADMIN_UIDS`), not email.
- Admin-saved secrets encrypted with AES-256-GCM (`CONFIG_ENCRYPTION_KEY`); env fallback for keys.
- Nutrition endpoint takes only `mealId`; ingredients resolved server-side.
- Nutrition cache keyed by ingredient hash.
- Gender field, Save meal, consent checkbox, safety flags, AI-estimate fallback added.

## Schedule change (2026-11-07)
- Whole MVP built on Day 1 in 7 blocks (P1–P13); Days 2–3 reserved for deploy, evidence and debugging. P14/P15 moved to the debug days.
- Added docs/DEBUGGING.md and docs/KNOWN_ISSUES.md; AGENTS.md now allows ordered multi-task blocks with a 2-attempt stop rule.

## Block 1 (2026-11-07)
- P1: Scaffolded ChopWise app with React, Vite, Tailwind v4, Router, Firebase SDK, starter brand tokens, base components, and Landing page.
- P2: Implemented scripts/edamam-probe.mjs and documented Edamam API findings and fallback necessity in docs/AI_AND_NUTRITION_SPEC.md.

## Block 2 (2026-11-07)
- P3: Built authentication features (AuthContext, useAuth, authErrors mapping), Login and Register pages with required medical consent checkbox, route guards (ProtectedRoute, ProfileGate), and dynamic navbar state.

## Branding and theme (2026-11-07)
- Product named ChopWise; green and white palette with light/dark/system modes.
- Colours defined as semantic tokens in one file (`src/styles/theme.css`); starter/ holds ready-made theme, toggle, logo, favicon and `check-colors.mjs`.
- Contrast verified (WCAG AA) for all token pairs in both themes; primary button colour is emerald-700 equivalent (#047857) because emerald-600 failed AA with white text.
- `npm run verify` added (colour check + tests + build).
