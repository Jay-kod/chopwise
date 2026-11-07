# API.md

Three Vercel functions. All: JSON in/out, header `Authorization: Bearer <Firebase ID token>`, same-origin only (no CORS headers).

## Error envelope
```json
{ "error": { "code": "RATE_LIMITED", "message": "Friendly message", "details": {} } }
```
| Code | HTTP | Meaning |
|------|------|---------|
| UNAUTHORIZED | 401 | Missing/invalid token |
| FORBIDDEN | 403 | Not an admin |
| VALIDATION_ERROR | 400 | zod validation failed (`details.fields`) |
| NOT_FOUND | 404 | e.g. meal id unknown |
| METHOD_NOT_ALLOWED | 405 | Wrong HTTP method |
| PROFILE_INCOMPLETE | 409 | Profile missing/invalid |
| RATE_LIMITED | 429 | Per-user hourly limit hit (`details.retryAfterSeconds`) |
| AI_FAILED | 502 | Gemini failed or returned invalid JSON twice |
| NOT_CONFIGURED | 503 | Integration missing (`details.missing: ["gemini"]`) |
| INTERNAL | 500 | Anything else; never leak stack traces or secrets |

## POST /api/recommend
Request: `{ "regenerate": false }`. The profile is read from Firestore by uid; it is never accepted from the body.
Response 200:
```json
{ "meals": [Meal], "perMealCapNGN": 238, "generatedAt": "ISO", "fromCache": false, "warnings": [] }
```
**Meal** (after server enrichment):
```json
{
  "id": "egusi-soup-with-pounded-yam-a1b2c3",
  "name": "string", "mealType": "breakfast|lunch|dinner", "description": "max 160 chars",
  "prepTimeMinutes": 30,
  "ingredients": [{ "item": "string", "quantity": 200, "unit": "g|ml|piece|tbsp|tsp|cup", "estCostNGN": 300 }],
  "steps": ["string"],
  "suitableFor": ["hypertension|diabetes|obesity|ulcer|general"],
  "cautionNotes": "string",
  "aiNutritionEstimate": { "calories": 0, "proteinG": 0, "carbsG": 0, "fatG": 0, "sodiumMg": 0, "sugarG": 0 },
  "costNGN": 1200, "costSource": "table|mixed|ai", "overBudget": false, "safetyFlags": ["High sodium for hypertension"]
}
```
The Gemini response schema contains the fields up to `aiNutritionEstimate` plus `estimatedCostNGN`; the server adds `costNGN`, `costSource`, `overBudget`, `safetyFlags` and the id suffix. See AI_AND_NUTRITION_SPEC.md.

## POST /api/nutrition
Request: `{ "mealId": "string" }`. The server loads the meal from `latestRecs/current` or `savedMeals` (so users cannot spend Edamam quota on arbitrary text).
Response 200:
```json
{ "nutrition": { "calories": 0, "proteinG": 0, "carbsG": 0, "fatG": 0, "sodiumMg": 0, "sugarG": 0,
                 "vitamins": [{ "name": "Vitamin C", "amount": 0, "unit": "mg" }] },
  "source": "edamam|ai-estimate", "safetyFlags": [], "cached": false }
```
AI-estimate responses have `vitamins: []`.

## POST /api/admin
Body always `{ "action": "...", ... }`. `me` is open to any signed-in user; every other action requires admin.
| Action | Body | Response |
|--------|------|----------|
| me | none | `{ "isAdmin": boolean }` |
| status | none | `{ bootstrap, functions, integrations, settings, safety, prices }` (below) |
| saveConfig | `{ "section": "gemini|edamam|settings|safety|prices", "values": {...} }` | `{ "ok": true }` plus fresh section status |
| resetSection | `{ "section": "settings|safety|prices" }` | `{ "ok": true }` |
| test | `{ "target": "firestore|gemini|edamam|recommend|nutrition" }` | `{ "ok", "message", "latencyMs", "testedAt", "details?" }` |
| runEvaluationCase (AR9) | `{ "index": 0 }` | metrics for one fixed profile |

**status shape**
```json
{
  "bootstrap": { "firebaseAdmin": true, "adminUidsSet": true, "encryptionKeySet": true },
  "functions": [{ "id": "gemini", "title": "Gemini API", "kind": "integration|function",
                  "status": "not_configured|untested|ok|failing", "lastTest": {...}, "testTarget": "gemini" }],
  "integrations": [{ "id": "gemini", "title": "...", "description": "...",
                     "helpLinks": [{ "label": "...", "url": "..." }], "steps": ["..."], "notes": ["..."],
                     "fields": [{ "key": "apiKey", "label": "API key", "type": "secret|text|toggle",
                                  "help": "...", "configured": true, "masked": "••••AbCd", "value": null }] }],
  "settings": {...}, "safety": {...}, "prices": { "items": [...], "updatedAt": "ISO", "pricedCount": 0, "total": 0 }
}
```
Rules: secret fields never return a value, only `configured` and `masked` (last 4 chars). On `saveConfig`, an empty or omitted secret keeps the stored value. The `integrations` array (metadata, links, steps) comes from `api/_lib/integrations.js`, so the UI renders generically and adding an integration means adding one registry entry.
Functions list is built from the registry plus the pipeline functions that exist (`recommend`, `nutrition`). Do not list what is not built.
