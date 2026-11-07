import crypto from 'node:crypto';
import { getAdminDb } from '../firebaseAdmin.js';
import {
  getSettingsConfig,
  getSafetyConfig,
  getPricesConfig,
} from '../configStore.js';
import {
  RECOMMENDATION_SYSTEM_INSTRUCTION,
  GEMINI_RESPONSE_SCHEMA,
  buildRecommendationPayload,
  computeProfileHash,
} from './prompt.js';
import { calculatePerMealCap, recomputeMealBudgets } from './budget.js';
import { evaluateMealSafety } from './safety.js';
import { checkRateLimit } from './rateLimit.js';
import { generateJson } from '../clients/gemini.js';
import { profileSchema, geminiResponseSchema } from '../schemas.js';
import { AppError } from '../http.js';

/**
 * Generate a URL-friendly slug with random tail for meal ID.
 * e.g. "Egusi Soup with Pounded Yam" -> "egusi-soup-with-pounded-yam-a1b2c3"
 * @param {string} name
 * @returns {string}
 */
export function generateMealId(name) {
  const base = (name || 'nigerian-meal')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40);

  const suffix = crypto.randomBytes(3).toString('hex');
  return `${base}-${suffix}`;
}

/**
 * Core recommendation pipeline.
 *
 * @param {string} uid - Firebase user UID
 * @param {{ regenerate?: boolean, isSampleTest?: boolean }} [options]
 * @returns {Promise<{ meals: Array<object>, perMealCapNGN: number, generatedAt: string, fromCache: boolean, warnings: string[] }>}
 */
export async function getRecommendations(uid, options = {}) {
  const { regenerate = false, isSampleTest = false } = options;

  let profile;
  let db = null;

  if (isSampleTest) {
    // Sample built-in profile used for pipeline health check in /admin
    profile = {
      age: 28,
      gender: 'female',
      weightKg: 65,
      conditions: ['hypertension'],
      preferences: ['no-pork'],
      avoidText: '',
      weeklyBudgetNGN: 21000,
    };
  } else {
    // 1. Rate limit check
    await checkRateLimit(uid);

    // 2. Read and validate user profile from Firestore
    db = getAdminDb();
    const userSnap = await db.collection('users').doc(uid).get();

    if (!userSnap.exists) {
      throw AppError.profileIncomplete('User profile not found. Please complete onboarding.');
    }

    const userData = userSnap.data();
    if (!userData.profileComplete || !userData.profile) {
      throw AppError.profileIncomplete('Please complete your dietary onboarding profile first.');
    }

    const parsedProfile = profileSchema.safeParse(userData.profile);
    if (!parsedProfile.success) {
      throw AppError.profileIncomplete('Stored profile data is invalid. Please update your profile.');
    }

    profile = parsedProfile.data;
  }

  const profileHash = computeProfileHash(profile);

  // 3. Cache lookup (unless regenerate requested or running sample test)
  if (!regenerate && !isSampleTest && db) {
    try {
      const recsSnap = await db
        .collection('users')
        .doc(uid)
        .collection('latestRecs')
        .doc('current')
        .get();

      if (recsSnap.exists) {
        const recsData = recsSnap.data();
        if (
          recsData?.profileHash === profileHash &&
          Array.isArray(recsData.meals) &&
          recsData.meals.length > 0
        ) {
          return {
            meals: recsData.meals,
            perMealCapNGN: recsData.perMealCapNGN || 0,
            generatedAt: recsData.generatedAt || new Date().toISOString(),
            fromCache: true,
            warnings: [],
          };
        }
      }
    } catch {
      // If cache lookup fails, proceed to fresh generation
    }
  }

  // 4. Resolve configurations
  const settings = await getSettingsConfig();
  const safety = await getSafetyConfig();
  const prices = await getPricesConfig();

  const perMealCapNGN = calculatePerMealCap(
    profile.weeklyBudgetNGN,
    settings.budgetDivisor
  );

  const payload = buildRecommendationPayload(
    profile,
    perMealCapNGN,
    settings.mealsPerType,
    prices.items
  );

  // 5. Call Gemini in structured JSON mode with automatic single retry on schema failure
  let rawAiOutput = null;
  try {
    rawAiOutput = await generateJson(
      RECOMMENDATION_SYSTEM_INSTRUCTION,
      payload,
      GEMINI_RESPONSE_SCHEMA
    );
  } catch (err) {
    // Retry once with strict instruction
    try {
      rawAiOutput = await generateJson(
        `${RECOMMENDATION_SYSTEM_INSTRUCTION}\nIMPORTANT: Previous response failed. Ensure output is strict valid JSON conforming to the schema.`,
        payload,
        GEMINI_RESPONSE_SCHEMA
      );
    } catch (retryErr) {
      throw AppError.aiFailed(`AI recommendation generation failed: ${retryErr.message}`);
    }
  }

  // Validate parsed JSON structure
  const parsedResponse = geminiResponseSchema.safeParse(rawAiOutput);
  if (!parsedResponse.success) {
    throw AppError.aiFailed('Gemini returned an invalid meal response structure.');
  }

  let candidateMeals = parsedResponse.data.meals;

  // 6. Deterministic Budget Recomputation
  let enrichedMeals = recomputeMealBudgets(
    candidateMeals,
    prices.items,
    perMealCapNGN
  );

  // 7. Over-budget check & single retry if configured
  if (settings.retryOnOverBudget) {
    const overBudgetCount = enrichedMeals.filter((m) => m.overBudget).length;
    if (overBudgetCount > enrichedMeals.length / 2) {
      try {
        const stricterInstruction = `${RECOMMENDATION_SYSTEM_INSTRUCTION}\nCRITICAL REQUIREMENT: ${overBudgetCount} of ${enrichedMeals.length} meals exceeded the perMealCapNGN of ₦${perMealCapNGN}. You MUST select economical Nigerian meals whose ingredients strictly stay within ₦${perMealCapNGN} per meal.`;

        const retryAiOutput = await generateJson(
          stricterInstruction,
          payload,
          GEMINI_RESPONSE_SCHEMA
        );

        const retryParsed = geminiResponseSchema.safeParse(retryAiOutput);
        if (retryParsed.success) {
          const retryEnriched = recomputeMealBudgets(
            retryParsed.data.meals,
            prices.items,
            perMealCapNGN
          );
          const retryOverBudgetCount = retryEnriched.filter((m) => m.overBudget).length;

          // Keep whichever batch had fewer over-budget meals
          if (retryOverBudgetCount < overBudgetCount) {
            enrichedMeals = retryEnriched;
          }
        }
      } catch {
        // If retry fails, keep initial enriched meals
      }
    }
  }

  // 8. Attach Safety Flags & Unique Meal IDs
  const finalMeals = enrichedMeals.map((meal) => {
    const safetyFlags = evaluateMealSafety(meal, profile.conditions, safety);
    return {
      ...meal,
      id: generateMealId(meal.name),
      safetyFlags,
    };
  });

  const generatedAt = new Date().toISOString();

  // 9. Persist to Firestore (unless running in sample test mode)
  if (!isSampleTest && db) {
    try {
      await db
        .collection('users')
        .doc(uid)
        .collection('latestRecs')
        .doc('current')
        .set({
          meals: finalMeals,
          profileHash,
          perMealCapNGN,
          generatedAt,
        });
    } catch (saveErr) {
      // Non-fatal if saving to cache fails
    }
  }

  return {
    meals: finalMeals,
    perMealCapNGN,
    generatedAt,
    fromCache: false,
    warnings: [],
  };
}

