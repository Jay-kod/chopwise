# DEVELOPMENT_GUIDELINES.md

## Code style
- ES modules everywhere. JavaScript (no TypeScript unless already configured).
- React function components + hooks. Pages are thin; logic in `src/features/*`; shared UI in `src/components/*`.
- API handlers are thin (method, auth, call service, respond). Logic in `api/_lib/services/*`; third-party calls only in `api/_lib/clients/*`.
- Validate at every boundary with zod (requests, config sections, AI output, profile read from Firestore).
- Names: components PascalCase; hooks `useX`; functions camelCase verbs; constants UPPER_SNAKE in `constants.js`/`defaults.js`; no magic numbers.
- Size: functions <= 40 lines, files <= 250 lines, one responsibility per file.
- JSDoc on every exported service function (params, returns, throws).
- Comments explain why, not what. No commented-out code. No `console.log` in committed code (a small `logger` that never logs secrets is fine).

## Colours and theming
- Semantic tokens only (docs/UI_GUIDELINES.md). No raw palette classes, hex, rgb or `dark:` variants outside `src/styles/theme.css`.
- `npm run verify` (colour check + tests + build) must pass before every commit.

## Error handling
- Server: throw `AppError(code, message, status, details)`; `withHandler` converts to the envelope in API.md; unknown errors become `INTERNAL`.
- Client: `apiClient` returns/throws a typed error with `code` and `message`; UI maps codes to friendly text; `NOT_CONFIGURED` shows a clear message (with an Admin link for admins).
- Every async UI call: loading, error, empty states.

## Testing
- Vitest unit tests for pure logic: `crypto`, `budget`, `safety`, `prompt` builder, ingredient-line builder, hashing, config masking.
- Manual end-to-end checks listed per task in TODO.md.
- Do not mock the database or Gemini inside shipped code. Tests may stub network calls only inside test files.

## Git
- One task = one commit: `P5: server foundation and admin API`.
- Commit only when the exit test passes. Never commit `.env*` or service-account JSON.

## Documentation
- Docs must match the code. If implementation differs, update the doc in the same task and add a CHANGELOG line.
- README covers setup (accounts, env vars, `vercel dev`, deploy).

## Definition of Done (per task)
Works end to end with real code paths; exit test passes; no stubs; no secrets; docs updated; report delivered in the AGENTS.md format.
