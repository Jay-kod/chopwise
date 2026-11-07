# SECURITY.md

## Controls
| Risk | Control |
|------|---------|
| API key leakage | Gemini/Edamam keys only on the server; browser never calls them; `grep` the built `dist/` for key patterns before deploy |
| Secrets at rest | Admin-saved secrets encrypted AES-256-GCM with `CONFIG_ENCRYPTION_KEY`; never returned to clients (only `configured` + last 4 chars) |
| Admin takeover | Admin = UID in `ADMIN_UIDS` (not email); `requireAdmin` on every admin action except `me`; client check is UX only |
| Unauthenticated API use | Verify Firebase ID token on every function call |
| Data access | Firestore rules in DATABASE.md; deny by default; `adminConfig`, `nutritionCache`, `rateLimits` server-only |
| Input abuse | zod on every request body and on the profile read from Firestore; size limits (`avoidText` <= 100) |
| Prompt injection | User text only inside a delimited JSON data block; truncated and stripped; AI output validated against schema |
| XSS | React escapes output; AI text rendered as plain text; never `dangerouslySetInnerHTML` |
| Quota abuse | Per-user hourly rate limit (Admin setting); nutrition endpoint resolves meals server-side; Edamam cache |
| Personal data to third parties | Send Gemini only age, gender, weight, conditions, preferences, avoid text, budget cap; never email, name or uid |
| Health data | Consent checkbox at registration (`consentAt`); privacy note in footer; store minimum. Nigeria's data protection law treats health data as sensitive; this is not legal advice |
| Medical risk | Persistent disclaimer; safety flags; never present AI output as a diagnosis |
| Error leakage | Error envelope with friendly messages; no stack traces, keys or raw upstream errors in responses; no secrets in logs |
| Secrets in git | `.env*` and service-account JSON in `.gitignore`; only `.env.example` committed |
| CORS | Same-origin; no CORS headers |

## Pre-deploy checklist
- [ ] `firestore.rules` published; two test accounts cannot read each other's `users/{uid}`
- [ ] A non-admin account gets 403 on every admin action except `me`
- [ ] No key/secret strings in `dist/` or the repo (`git log -p` spot check)
- [ ] Unauthenticated calls to all three functions return 401
- [ ] Admin responses never contain a full secret
- [ ] Rate limit returns 429 on the (limit+1)th request
- [ ] Service-account JSON deleted from local disk and not in git history
- [ ] Rotate any key that was ever pasted into chat, a commit or a screenshot
