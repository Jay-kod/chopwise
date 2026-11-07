import crypto from 'node:crypto';
import { getSupabaseAdmin } from '../supabaseAdmin.js';
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
  const { regenerate = false, isSampleTest = false, customProfile = null } = options;

  let profile;
  let supabase = null;

  if (customProfile) {
    profile = customProfile;
  } else if (isSampleTest) {
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

    // 2. Read and validate user profile from Supabase
    supabase = getSupabaseAdmin();
    const { data: userRow } = await supabase
      .from('profiles')
      .select('profile, profile_complete')
      .eq('id', uid)
      .maybeSingle();

    if (!userRow) {
      throw AppError.profileIncomplete('User profile not found. Please complete onboarding.');
    }

    if (!userRow.profile_complete || !userRow.profile) {
      throw AppError.profileIncomplete('Please complete your dietary onboarding profile first.');
    }

    const parsedProfile = profileSchema.safeParse(userRow.profile);
    if (!parsedProfile.success) {
      throw AppError.profileIncomplete('Stored profile data is invalid. Please update your profile.');
    }

    profile = parsedProfile.data;
  }

  const profileHash = computeProfileHash(profile);

  // 3. Cache lookup (unless regenerate requested or running sample test / custom profile)
  if (!regenerate && !isSampleTest && !customProfile && supabase) {
    try {
      const { data: recsData } = await supabase
        .from('latest_recs')
        .select('meals, profile_hash, per_meal_cap_ngn, generated_at')
        .eq('user_id', uid)
        .maybeSingle();

      if (
        recsData?.profile_hash === profileHash &&
        Array.isArray(recsData.meals) &&
        recsData.meals.length > 0
      ) {
        return {
          meals: recsData.meals,
          perMealCapNGN: Number(recsData.per_meal_cap_ngn) || 0,
          generatedAt: recsData.generated_at || new Date().toISOString(),
          fromCache: true,
          warnings: [],
        };
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

  // 9. Persist to Supabase (unless running in sample test or custom profile mode)
  if (!isSampleTest && !customProfile && supabase) {
    try {
      await supabase.from('latest_recs').upsert({
        user_id: uid,
        meals: finalMeals,
        profile_hash: profileHash,
        per_meal_cap_ngn: perMealCapNGN,
        generated_at: generatedAt,
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

