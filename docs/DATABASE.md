# DATABASE.md — MySQL / MariaDB

The canonical schema is `mysql/schema.sql`; the server also creates/migrates tables from `api/_lib/mysql.js`.

| Table | Purpose |
|---|---|
| `users` | Customer/admin accounts, scrypt password hash, consent timestamp, profile JSON, completion and active flags |
| `saved_meals` | Per-user saved recipe snapshots |
| `latest_recs` | Per-user personalized recommendation cache |
| `nutrition_cache` | Server-side USDA/AI nutrition cache |
| `rate_limits` | Per-user recommendation limits |
| `admin_config` | Server-only integration credentials and system configuration |
| `admin_roles` | Additional administrator grants; bootstrap admins remain in `ADMIN_UIDS` |
| `recipe_catalog` | Shared recipes maintained by admins and visible to signed-in customers |
| `admin_activity` | Append-only audit records for privileged mutations and maintenance |

`admin_config` sections (`integrations`, `settings`, `safety`, `prices`, `testResults`) are server-only. Encrypted values use `v1:<iv>:<tag>:<ciphertext>` (base64 parts) with AES-256-GCM.

The integration config stores the USDA API key encrypted under `integrations.usda`. Startup migration removes only legacy Edamam settings and health-test results, plus cached nutrition rows whose source is `edamam`; other integration settings and nutrition data are preserved.

Admin customer views expose only account metadata: ID, email, creation date, profile-complete and active status. Health profiles and password hashes are never returned by admin endpoints. Customer removal is a soft-disable (`users.is_active = 0`); existing sessions are rejected on the next API request. Admin-created customer accounts are not supported.

Only active registered users can be granted an additional admin role. `ADMIN_UIDS` entries are protected bootstrap admins and cannot be revoked or disabled through the app. Role changes are checked against the database for every admin request.

Catalogue recipes are validated server-side against the recipe schema. `ingredients[].estCostNGN` stores estimated costs per ingredient, and `costNGN` is the estimated total ingredient cost for the recipe. These are budgeting estimates, not selling prices or charges. Customers can browse recipes but catalogue entries do not replace or influence their personalized Gemini recommendation pipeline. Admin activity is read-only and has no edit/delete action.

Maintenance actions are limited to clearing `nutrition_cache` and resetting `rate_limits`; neither action deletes customer data.

## Authentication & Security
- Passwords are hashed with Node.js `crypto.scryptSync` and a random 16-byte salt (`salt:hash`).
- Sessions use server-verified HMAC-SHA256 JWT tokens. `JWT_SECRET` is a server-only bootstrap variable.
- Database access uses prepared statements through `mysql2`; customer profile reads and writes are scoped to the authenticated user ID.
- The `chopwise` database/tables are initialized on first query; existing databases receive additive migrations.

## Profile validation limits (client and server must match)
- age: integer 10–100
- gender: `female` | `male`
- weightKg: number 20–300
- conditions: subset of `hypertension, diabetes, obesity, ulcer` (empty array = none)
- preferences: subset of `vegetarian, no-pork, no-fish, no-beef, low-carb, high-protein`
- avoidText: string, max 100 chars, optional
- weeklyBudgetNGN: integer 1000–500000
- The server re-validates the profile with zod on every recommend call and never trusts the client.

## Hashes
- `profileHash`: SHA-1 of the canonical JSON of the profile (sorted keys, arrays sorted).
- `ingredientsHash`: SHA-1 of sorted, normalised ingredient lines.
