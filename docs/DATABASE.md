# DATABASE.md (Firestore)

## Collections
```
users/{uid}
  email, createdAt, consentAt, profileComplete (bool)
  profile: { age, gender, weightKg, conditions[], preferences[], avoidText, weeklyBudgetNGN, updatedAt }

users/{uid}/savedMeals/{mealId}     { meal, savedAt }
users/{uid}/latestRecs/current      { meals[], profileHash, perMealCapNGN, generatedAt }   (server writes)

nutritionCache/{ingredientsHash}    { nutrition, source: "edamam"|"ai-estimate", fetchedAt }  (server only)
rateLimits/{uid}                    { windowStart, count }                                    (server only)

adminConfig/integrations   { gemini: { apiKeyEnc, model, updatedAt }, edamam: { appIdEnc, appKeyEnc, enabled, updatedAt } }
adminConfig/settings       { mealsPerType, budgetDivisor, rateLimitPerHour, retryOnOverBudget, updatedAt }
adminConfig/safety         { hypertensionSodiumMg, diabetesSugarG, diabetesCarbsG, obesityCalories, updatedAt }
adminConfig/prices         { items: [{ item, unit, priceNGN }], updatedAt }
adminConfig/testResults    { <target>: { ok, message, latencyMs, testedAt } }
```
All `adminConfig/*` is server-only. Encrypted values use the format `v1:<iv>:<tag>:<ciphertext>` (base64 parts).

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

## Indexes
None required (all reads are by document id).

## Firestore rules (`firestore.rules`, must be published)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read: if request.auth != null && request.auth.uid == uid;
      allow create: if request.auth != null && request.auth.uid == uid
        && request.resource.data.keys().hasOnly(['email','createdAt','consentAt','profileComplete','profile']);
      allow update: if request.auth != null && request.auth.uid == uid;
      allow delete: if false;
      match /savedMeals/{mealId} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }
      match /latestRecs/{docId} {
        allow read: if request.auth != null && request.auth.uid == uid;
        allow write: if false;
      }
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```
How to publish: Firebase console -> Build -> Firestore Database -> Rules tab -> paste -> Publish.
