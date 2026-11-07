# DATABASE.md (Supabase PostgreSQL)

## Schema & Tables (`supabase/schema.sql`)
```sql
profiles
  id (uuid, references auth.users), email (text), created_at (timestamptz), consent_at (timestamptz), profile_complete (bool), profile (jsonb), updated_at (timestamptz)

saved_meals
  id (text primary key), user_id (uuid, references auth.users), meal_id (text), meal (jsonb), saved_at (timestamptz)

latest_recs
  user_id (uuid, references auth.users primary key), meals (jsonb), profile_hash (text), per_meal_cap_ngn (numeric), generated_at (timestamptz)  (server writes)

nutrition_cache
  ingredients_hash (text primary key), nutrition (jsonb), source ("edamam"|"ai-estimate"), fetched_at (timestamptz)  (server only)

rate_limits
  user_id (text primary key), window_start (bigint), count (integer)  (server only)

admin_config
  section (text primary key), config (jsonb), updated_at (timestamptz)  (server only)
```
All `admin_config` sections (`integrations`, `settings`, `safety`, `prices`, `testResults`) are server-only. Encrypted values use the format `v1:<iv>:<tag>:<ciphertext>` (base64 parts).

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

## Row Level Security (RLS)
Published via `supabase/schema.sql`:
- `profiles`: SELECT, INSERT, UPDATE allowed only where `auth.uid() = id`.
- `saved_meals`: SELECT, INSERT, UPDATE, DELETE allowed only where `auth.uid() = user_id`.
- `latest_recs`: SELECT allowed only where `auth.uid() = user_id`. Server writes via service role.
- `nutrition_cache`, `rate_limits`, `admin_config`: RLS enabled, accessed only via Supabase service role key in serverless functions.
