# DATABASE.md (XAMPP MySQL / MariaDB)

## Schema & Tables (`mysql/schema.sql`)
```sql
users
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME,
  consent_at DATETIME,
  profile_complete TINYINT(1) DEFAULT 0,
  profile LONGTEXT,
  updated_at DATETIME

saved_meals
  id VARCHAR(100) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  meal_id VARCHAR(100) NOT NULL,
  meal LONGTEXT NOT NULL,
  saved_at DATETIME

latest_recs
  user_id VARCHAR(36) PRIMARY KEY,
  meals LONGTEXT NOT NULL,
  profile_hash VARCHAR(64),
  per_meal_cap_ngn DECIMAL(10,2),
  generated_at DATETIME

nutrition_cache
  ingredients_hash VARCHAR(64) PRIMARY KEY,
  nutrition LONGTEXT NOT NULL,
  source VARCHAR(50) NOT NULL,
  fetched_at DATETIME

rate_limits
  user_id VARCHAR(64) PRIMARY KEY,
  window_start BIGINT NOT NULL,
  count INT DEFAULT 1

admin_config
  section VARCHAR(50) PRIMARY KEY,
  config LONGTEXT NOT NULL,
  updated_at DATETIME
```
All `admin_config` sections (`integrations`, `settings`, `safety`, `prices`, `testResults`) are server-only. Encrypted values use the format `v1:<iv>:<tag>:<ciphertext>` (base64 parts) with AES-256-GCM.

## Authentication & Security
- Passwords hashed with Node.js `crypto.scryptSync` with random 16-byte salt (`salt:hash`).
- Sessions authenticated with HMAC-SHA256 JWT tokens verified server-side.
- The `chopwise` database and tables are automatically bootstrapped on first query if they do not exist.

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
