# SECURITY.md

## Controls
| Risk | Control |
|------|---------|
| API key leakage | Gemini/USDA keys only on the server; browser never calls them; `grep` the built `dist/` for key patterns before deploy |
| Secrets at rest | Admin-saved secrets encrypted AES-256-GCM with `CONFIG_ENCRYPTION_KEY`; never returned to clients (only `configured` + last 4 chars) |
| Admin takeover | Protected UIDs in `ADMIN_UIDS` and managed MySQL `admin_roles`; `requireAdmin` rechecks access on every admin action; client checks are UX only |
| Test login shortcuts | Public user/admin sign-in shortcuts prefill the shared test password in the browser; authentication plus the server-side admin role check remain required. `npm run seed` provisions the local test-admin role and refuses to run in production. These credentials are public, so use disposable test accounts only and store no sensitive data in them |
| Unauthenticated API use | Verify the server-issued JWT and active MySQL account on every protected function call |
| Data access | MySQL prepared statements; customer records are scoped by authenticated account ID; admin tables are server-only |
| Account disable | `is_active` is checked at login and on every authenticated request, invalidating existing sessions after disable |
| Admin roles | Protected bootstrap IDs in `ADMIN_UIDS`; additional roles in MySQL `admin_roles`; every privileged request rechecks the current role |
| Customer privacy | Admin account pages expose email/account metadata only; never expose or modify health profiles or password hashes |
| Catalogue access | Admin writes require `requireAdmin`; signed-in customers can read only the validated shared catalogue |
| Audit integrity | `admin_activity` is append-only through application APIs; admin UI is read-only and records exclude secrets and health profiles |
| Maintenance | Only explicit nutrition-cache clearing and rate-limit reset are available; never purge user data |
| Input abuse | zod on every request body and on the profile read from MySQL; size limits (`avoidText` <= 100) |
| Prompt injection | User text only inside a delimited JSON data block; truncated and stripped; AI output validated against schema |
| XSS | React escapes output; AI text rendered as plain text; never `dangerouslySetInnerHTML` |
| Quota abuse | Per-user hourly rate limit (Admin setting); nutrition endpoint resolves meals server-side; USDA results are cached by ingredient hash |
| Personal data to third parties | Send Gemini only age, gender, weight, conditions, preferences, avoid text, budget cap; never email, name or uid |
| Health data | Consent checkbox at registration (`consentAt`); privacy note in footer; store minimum. Nigeria's data protection law treats health data as sensitive; this is not legal advice |
| Medical risk | Persistent disclaimer; safety flags; never present AI output as a diagnosis |
| Error leakage | Error envelope with friendly messages; no stack traces, keys or raw upstream errors in responses; no secrets in logs |
| Secrets in git | `.env*` and service-account JSON in `.gitignore`; only `.env.example` committed |
| CORS | Same-origin; no CORS headers |

## Pre-deploy checklist
- [ ] Two test accounts cannot read each other's account profile through any API
- [ ] A non-admin account gets 403 on every admin action except `me`
- [ ] No key/secret strings in `dist/` or the repo (`git log -p` spot check)
- [ ] Unauthenticated calls to protected API actions return 401
- [ ] Disabled account tokens fail on the next authenticated request
- [ ] A non-admin cannot access admin management actions; bootstrap admin roles cannot be revoked
- [ ] Audit events are written for every successful privileged mutation and are not editable through the app
- [ ] Admin responses never contain a full secret
- [ ] Rate limit returns 429 on the (limit+1)th request
- [ ] Service-account JSON deleted from local disk and not in git history
- [ ] Rotate any key that was ever pasted into chat, a commit or a screenshot
