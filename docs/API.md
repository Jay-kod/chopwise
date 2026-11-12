# API.md

Five Vercel functions. All: JSON in/out, header `Authorization: Bearer <Firebase ID token>`, same-origin only (no CORS headers).

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

## POST /api/auth
Actions: `register` (`name`, `email`, `password`, `consent`), `login` (`email`, `password`), `me`, `update-profile`, `get-saved-meals`, `save-meal`, `delete-saved-meal`, and `get-meal`.
Registration/login use MySQL accounts. Passwords are scrypt hashes. Disabled accounts are rejected at login and on every authenticated API request. Registration accepts a full `name` and `email`. `/me` returns account data, including the user's name and profile display name, and the server-computed admin flag, never password hashes. Customer email is not changed by `update-profile`.

## POST /api/recommend
Request: `{ "regenerate": false }`. The profile is read from MySQL by authenticated user ID; it is never accepted from the body.
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
Request: `{ "mealId": "string", "action?": "nutrition|refresh-usda|ai-feedback" }`. The default `nutrition` action preserves the automatic nutrition lookup. `refresh-usda` bypasses the nutrition cache and performs a fresh USDA lookup. `ai-feedback` asks Gemini for general, non-medical food feedback. The server loads the meal from `latest_recs` or `saved_meals` for the authenticated user (or a published catalogue recipe); callers cannot submit arbitrary ingredients for analysis.
Response 200:
```json
{ "nutrition": { "calories": 0, "proteinG": 0, "carbsG": 0, "fatG": 0, "sodiumMg": 0, "sugarG": 0,
                 "vitamins": [{ "name": "Vitamin C", "amount": 0, "unit": "mg" }] },
  "source": "usda|ai-estimate", "sourceMessage?": "string", "safetyFlags": [], "cached": false }
```
AI-estimate responses have `vitamins: []`.
For `action: "ai-feedback"`, response is `{ "feedback": { "summary": "string", "strengths": ["string"], "cautions": ["string"], "improvements": ["string"] } }`. Feedback is general food information, not medical advice, and does not include the customer's profile.

## POST /api/admin
Body always `{ "action": "...", ... }`. `me` is open to any signed-in user; every other action requires an active admin. Admin access is rechecked on each request against protected `ADMIN_UIDS` bootstrap IDs or `admin_roles`.
| Action | Body | Response |
|--------|------|----------|
| me | none | `{ "isAdmin": boolean }` |
| status | none | `{ bootstrap, functions, integrations, settings, safety, prices }` (below) |
| saveConfig | `{ "section": "gemini|usda|settings|safety|prices", "values": {...} }` | `{ "ok": true }` plus fresh section status |
| resetSection | `{ "section": "settings|safety|prices" }` | `{ "ok": true }` |
| test | `{ "target": "mysql|gemini|usda|recommend|nutrition" }` | `{ "ok", "message", "latencyMs", "testedAt", "details?" }` |
| runEvaluationCase (AR9) | `{ "index": 0 }` | metrics for one fixed profile |
| listCustomers | `{ "search": "", "offset": 0, "limit": 25 }` | `{ "items": [{ "id", "email", "createdAt", "profileComplete", "active" }], "total" }` |
| updateCustomer | `{ "userId": "uuid", "email": "new@example.com" }` | `{ "ok": true }`; account metadata only |
| setCustomerActive | `{ "userId": "uuid", "active": false }` | `{ "ok": true }`; disabling immediately invalidates sessions on the next request |
| listAdmins | none | `{ "items": [{ "id", "email", "bootstrap", "createdAt" }] }` |
| grantAdmin | `{ "email": "registered@example.com" }` | `{ "ok": true }`; existing active account only |
| revokeAdmin | `{ "userId": "uuid" }` | `{ "ok": true }`; bootstrap IDs cannot be revoked |
| listRecipes | `{ "search": "", "offset": 0, "limit": 25 }` | `{ "items": [{ "id", "recipe", "createdAt", "updatedAt" }], "total" }` |
| createRecipe | `{ "recipe": Recipe }` | `{ "ok": true, "item": CatalogItem }` |
| updateRecipe | `{ "id": "uuid", "recipe": Recipe }` | `{ "ok": true, "item": CatalogItem }` |
| deleteRecipe | `{ "id": "uuid" }` | `{ "ok": true }` |
| draftRecipeWithAi | `{ "mealName": "...", "mealType?": "breakfast|lunch|dinner" }` | `{ "ok": true, "recipe": Recipe }` (uses Gemini AI & Nigerian price table) |
| analyzeRecipeNutrition | `{ "title": "...", "ingredients": [{ "item", "quantity", "unit" }] }` | `{ "ok": true, "source": "usda", "nutrition": {...} }` (requires gram quantities) |
| listActivity | `{ "offset": 0, "limit": 25 }` | `{ "items": [{ "id", "actorId", "action", "entityType", "entityId", "createdAt", "details" }], "total" }` |
| clearNutritionCache | none | `{ "ok": true, "deletedCount": 0 }` |
| resetRateLimits | none | `{ "ok": true, "deletedCount": 0 }` |

Admin mutation actions append to the read-only `admin_activity` log. It contains no health profile, password, JWT, or API-key values. Customer administration never returns or edits health profiles. Customer creation and permanent deletion are unavailable; deactivation is reversible. `ADMIN_UIDS` bootstrap IDs cannot be disabled or revoked through the API.

`Recipe` fields: `name`, `mealType`, `description`, `prepTimeMinutes`, `ingredients` (each ingredient has an estimated cost), `steps`, `suitableFor`, `cautionNotes`, `aiNutritionEstimate`, `costNGN` (estimated total ingredient cost, not a selling price), and `costSource`. The server validates each recipe with `catalogRecipeSchema` and generates the catalogue ID.

## POST /api/catalog
Requires an active signed-in customer. Body: `{ "action": "list", "search": "", "offset": 0, "limit": 25 }`. Returns full shared recipe catalogue entries. Ingredient costs and recipe totals are estimates for budgeting, not prices charged to customers. This catalogue does not change personalized recommendations.

**status shape**
```json
{
  "bootstrap": { "mysql": true, "adminUidsSet": true, "jwtSecretSet": true, "encryptionKeySet": true },
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
Functions list is built from the registry plus the pipeline functions that exist (`recommend`, `nutrition`).
