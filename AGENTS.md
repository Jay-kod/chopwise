# AGENTS.md — Rules for AI coding agents

Project: AI-based Nigerian recipe recommendation web app. React + Vite + Tailwind, Firebase Auth + Firestore, Vercel serverless functions, Gemini API, Edamam API. One Admin page (`/admin`) manages every API key, setting and health check.

## Before ANY task
1. Read this file.
2. Read `docs/PROJECT_CONTEXT.md`, then only the docs your task names (`docs/TODO.md` maps task → docs).
3. The docs are the source of truth. If code and docs disagree, or a doc lacks something you need, STOP and ask. Never guess silently.

## Hard rules
1. Never invent files, endpoints, Firestore fields, env vars, packages or features that are not in the docs. If a detail is missing: state a one-line assumption and proceed only if it is safe.
2. Secrets: Gemini/Edamam keys and the Firebase service account NEVER appear in `src/`, logs, API responses, commits or docs. The browser never calls Gemini or Edamam. Server only.
3. Never weaken security (Firestore rules, token checks, admin checks, validation) to make something work.
4. One task at a time. Finish it, run its exit test, report, then STOP. If a prompt lists several tasks (a block), do them strictly in order, verify and commit each before the next, and stop at the first task that still fails after 2 fix attempts (log it in docs/KNOWN_ISSUES.md). Never start tasks outside the block.
5. Smallest change that works. Do not refactor or rewrite working code unless the task says so.
6. New dependency only with a one-line reason. Prefer what is already installed.
7. Never open, print or commit `.env*` files or service-account JSON.
8. Colours: ONLY semantic tokens from `src/styles/theme.css` (e.g. `bg-surface`, `text-fg`, `bg-primary`). No raw palette classes, hex, rgb, inline colour styles or `dark:` variants. Light AND dark mode must both work. Run `npm run verify` before every commit.

## Definition of Active (no stubs)
Everything you write must work end to end.
- No mocks, fake data, hard-coded sample responses, placeholder returns, TODO bodies or commented-out logic in shipped code.
- If you cannot test something because a key is missing: still write the complete real code path, make Admin show "not configured", show a friendly message to users, and tell me exactly what you need. Never fake output.
- Unbuilt features are ABSENT (no file), never stubbed. Anything that exists must work.
- Every async call has loading, error and empty states. No unhandled promise rejections. API failure never crashes the UI.

## Code standards (details: docs/DEVELOPMENT_GUIDELINES.md)
ES modules. React function components + hooks. Pages are thin; logic lives in `src/features/*`. API handlers are thin; logic lives in `api/_lib/services/*`. zod validation at every boundary. No magic numbers (use constants/defaults files). Functions <= 40 lines, files <= 250 lines. JSDoc on service functions. Vitest tests for pure logic. Naira format: `₦1,200`.

## Commands
- Install: `npm install`
- Run frontend + API locally: `vercel dev` (plain Vite does NOT serve `/api`)
- Tests: `npm test`
- Full check (colours + tests + build): `npm run verify`
- Build: `npm run build`

## Where each truth lives
| Topic | Doc |
|---|---|
| What/why/scope/stack | docs/PROJECT_CONTEXT.md |
| Requirements + acceptance | docs/REQUIREMENTS.md |
| Layers, folders, env vars, config flow | docs/ARCHITECTURE.md |
| Firestore schema + rules | docs/DATABASE.md |
| Endpoints, errors, schemas | docs/API.md |
| Prompt, budget, nutrition, safety logic | docs/AI_AND_NUTRITION_SPEC.md |
| Admin page behaviour + key links | docs/ADMIN_PAGE_SPEC.md |
| Security controls | docs/SECURITY.md |
| Code style, testing | docs/DEVELOPMENT_GUIDELINES.md |
| UI rules, brand, colour tokens, dark mode | docs/UI_GUIDELINES.md |
| Theme/brand source files | starter/ (copied in P1) |
| Task list + exit tests | docs/TODO.md |
| Decisions/changes | docs/CHANGELOG.md |
| Debug rules, likely failures | docs/DEBUGGING.md |
| Bug log | docs/KNOWN_ISSUES.md |

## Report format (end of every task)
1. Files created/changed.
2. How I verify: exact steps/commands and expected results.
3. Assumptions made.
4. Anything you need from me (keys, console steps).
5. Docs you updated so they match the code (always add a line to docs/CHANGELOG.md).
