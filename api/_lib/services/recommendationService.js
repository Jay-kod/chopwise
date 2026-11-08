import crypto from 'node:crypto';
import { query } from '../mysql.js';
import { getSettingsConfig, getSafetyConfig, getPricesConfig } from '../configStore.js';
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

export function generateMealId(name) {
  const base = (name || 'nigerian-meal')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40);
  const suffix = crypto.randomBytes(3).toString('hex');
  return `${base}-${suffix}`;
}

async function fetchUserProfile(uid) {
  const rows = await query('SELECT profile, profile_complete FROM users WHERE id = ? LIMIT 1', [uid]);
  if (!rows?.[0]) throw AppError.profileIncomplete('User profile not found. Please complete onboarding.');
  const row = rows[0];
  const raw = typeof row.profile === 'string' ? JSON.parse(row.profile || '{}') : row.profile || {};
  if (!row.profile_complete || !raw) throw AppError.profileIncomplete('Please complete your dietary profile first.');
  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) throw AppError.profileIncomplete('Stored profile data is invalid. Please update your profile.');
  return parsed.data;
}

async function checkRecsCache(uid, profileHash) {
  try {
    const rows = await query('SELECT meals, profile_hash, per_meal_cap_ngn, generated_at FROM latest_recs WHERE user_id = ? LIMIT 1', [uid]);
    if (rows?.[0]?.profile_hash === profileHash) {
      const meals = typeof rows[0].meals === 'string' ? JSON.parse(rows[0].meals) : rows[0].meals;
      if (Array.isArray(meals) && meals.length > 0) {
        return {
          meals,
          perMealCapNGN: Number(rows[0].per_meal_cap_ngn) || 0,
          generatedAt: rows[0].generated_at ? new Date(rows[0].generated_at).toISOString() : new Date().toISOString(),
          fromCache: true,
          warnings: [],
        };
      }
    }
  } catch {}
  return null;
}

async function callGemini(instruction, payload) {
  try {
    return await generateJson(instruction, payload, GEMINI_RESPONSE_SCHEMA);
  } catch {
    const retryInstruction = `${instruction}\nIMPORTANT: Previous attempt failed. Return strict valid JSON conforming to the schema.`;
    try {
      return await generateJson(retryInstruction, payload, GEMINI_RESPONSE_SCHEMA);
    } catch (retryErr) {
      throw AppError.aiFailed(`AI recommendation generation failed: ${retryErr.message}`);
    }
  }
}

async function retryOverBudgetMeals(meals, prices, cap, payload) {
  const overCount = meals.filter((m) => m.overBudget).length;
  if (overCount <= meals.length / 2) return meals;
  try {
    const instruction = `${RECOMMENDATION_SYSTEM_INSTRUCTION}\nCRITICAL: ${overCount} of ${meals.length} meals exceeded ₦${cap}. Select economical Nigerian meals within ₦${cap}.`;
    const retryRaw = await generateJson(instruction, payload, GEMINI_RESPONSE_SCHEMA);
    const parsed = geminiResponseSchema.safeParse(retryRaw);
    if (parsed.success) {
      const recomputed = recomputeMealBudgets(parsed.data.meals, prices.items, cap);
      if (recomputed.filter((m) => m.overBudget).length < overCount) return recomputed;
    }
  } catch {}
  return meals;
}

export async function getRecommendations(uid, options = {}) {
  const { regenerate = false, isSampleTest = false, customProfile = null } = options;
  let profile = customProfile;

  if (!profile && isSampleTest) {
    profile = {
      age: 28, gender: 'female', weightKg: 65, conditions: ['hypertension'],
      preferences: ['no-pork'], avoidText: '', weeklyBudgetNGN: 21000,
    };
  } else if (!profile) {
    await checkRateLimit(uid);
    profile = await fetchUserProfile(uid);
  }

  const profileHash = computeProfileHash(profile);
  if (!regenerate && !isSampleTest && !customProfile) {
    const cached = await checkRecsCache(uid, profileHash);
    if (cached) return cached;
  }

  const [settings, safety, prices] = await Promise.all([getSettingsConfig(), getSafetyConfig(), getPricesConfig()]);
  const perMealCapNGN = calculatePerMealCap(profile.weeklyBudgetNGN, settings.budgetDivisor);
  const payload = buildRecommendationPayload(profile, perMealCapNGN, settings.mealsPerType, prices.items);

  const rawAi = await callGemini(RECOMMENDATION_SYSTEM_INSTRUCTION, payload);
  const parsed = geminiResponseSchema.safeParse(rawAi);
  if (!parsed.success) throw AppError.aiFailed('Gemini returned an invalid meal structure.');

  let enriched = recomputeMealBudgets(parsed.data.meals, prices.items, perMealCapNGN);
  if (settings.retryOnOverBudget) enriched = await retryOverBudgetMeals(enriched, prices, perMealCapNGN, payload);

  const finalMeals = enriched.map((meal) => ({
    ...meal,
    id: generateMealId(meal.name),
    safetyFlags: evaluateMealSafety(meal, profile.conditions, safety),
  }));

  const generatedAt = new Date().toISOString();
  if (!isSampleTest && !customProfile) {
    try {
      await query(
        `INSERT INTO latest_recs (user_id, meals, profile_hash, per_meal_cap_ngn, generated_at)
         VALUES (?, ?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE meals = VALUES(meals), profile_hash = VALUES(profile_hash), per_meal_cap_ngn = VALUES(per_meal_cap_ngn), generated_at = NOW()`,
        [uid, JSON.stringify(finalMeals), profileHash, perMealCapNGN]
      );
    } catch {}
  }

  return { meals: finalMeals, perMealCapNGN, generatedAt, fromCache: false, warnings: [] };
}
