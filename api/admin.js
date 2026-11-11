import { withHandler, AppError } from './_lib/http.js';
import { verifyRequest, requireAdmin, checkIsAdmin, setDynamicBootstrapAdminIds } from './_lib/auth.js';
import {
  getSettingsConfig, getSafetyConfig, getPricesConfig,
  saveConfig, resetSection, getGeminiConfig, getUsdaConfig,
} from './_lib/configStore.js';
import { loadDoc } from './_lib/configBase.js';
import { getIntegrationsStatus, runHealthCheck } from './_lib/integrations.js';
import { query, isMysqlConfigured } from './_lib/mysql.js';
import { EVALUATION_PROFILES } from './_lib/data/evaluationProfiles.js';
import { getRecommendations } from './_lib/services/recommendationService.js';
import { getMealNutrition } from './_lib/services/nutritionService.js';
import { listAvailableModels } from './_lib/clients/gemini.js';
import { listCustomers, setCustomerActive, updateCustomerEmail } from './_lib/services/customerAdminService.js';
import { grantAdmin, listAdmins, revokeAdmin, saveBootstrapAdminIds } from './_lib/services/adminAccessService.js';
import {
  createRecipe, deleteRecipe, listRecipes, updateRecipe,
  draftRecipeWithAi, analyzeRecipeNutrition,
} from './_lib/services/recipeCatalogService.js';
import { listAdminActivity } from './_lib/services/adminAuditService.js';
import { clearNutritionCache, resetRateLimits } from './_lib/services/adminMaintenanceService.js';

async function handleStatus() {
  let dbBootstrapUids = '';
  try {
    const doc = await loadDoc('bootstrap');
    if (doc?.adminUids) {
      dbBootstrapUids = doc.adminUids;
      setDynamicBootstrapAdminIds(doc.adminUids);
    }
  } catch {}

  const envUids = (process.env.ADMIN_UIDS || '').trim();
  const effectiveUids = envUids || dbBootstrapUids.trim();
  const bootstrapSource = envUids && dbBootstrapUids ? 'both' : envUids ? 'environment' : dbBootstrapUids ? 'database' : 'none';

  const bootstrap = {
    mysql: isMysqlConfigured(),
    adminUidsSet: Boolean(effectiveUids),
    adminUids: effectiveUids,
    adminUidsSource: bootstrapSource,
    jwtSecretSet: Boolean(
      (process.env.JWT_SECRET && Buffer.byteLength(process.env.JWT_SECRET, 'utf8') >= 32) ||
      process.env.CONFIG_ENCRYPTION_KEY
    ),
    encryptionKeySet: Boolean(process.env.CONFIG_ENCRYPTION_KEY),
  };

  let testResults = {};
  try {
    const rows = await query('SELECT config FROM admin_config WHERE section = ? LIMIT 1', ['testResults']);
    if (rows?.[0]?.config) {
      testResults = typeof rows[0].config === 'string' ? JSON.parse(rows[0].config) : rows[0].config;
    }
  } catch {}

  const [integrations, settings, safety, pricesData] = await Promise.all([
    getIntegrationsStatus(testResults),
    getSettingsConfig(),
    getSafetyConfig(),
    getPricesConfig(),
  ]);

  const geminiConf = await getGeminiConfig();
  const usdaConf = await getUsdaConfig();
  const dbTest = testResults.mysql || null;

  const functions = [
    {
      id: 'mysql',
      title: 'MySQL Database (XAMPP MariaDB)',
      kind: 'function',
      status: dbTest ? (dbTest.ok ? 'ok' : 'failing') : 'untested',
      lastTest: dbTest,
      testTarget: 'mysql',
    },
    {
      id: 'gemini',
      title: 'Gemini API',
      kind: 'integration',
      status: !geminiConf.apiKey ? 'not_configured' : testResults.gemini ? (testResults.gemini.ok ? 'ok' : 'failing') : 'untested',
      lastTest: testResults.gemini || null,
      testTarget: 'gemini',
    },
    {
      id: 'usda',
      title: 'USDA FoodData Central',
      kind: 'integration',
      status: !usdaConf.apiKey ? 'not_configured' : testResults.usda ? (testResults.usda.ok ? 'ok' : 'failing') : 'untested',
      lastTest: testResults.usda || null,
      testTarget: 'usda',
    },
    {
      id: 'recommend',
      title: 'Recommendation Pipeline',
      kind: 'function',
      status: !geminiConf.apiKey ? 'not_configured' : testResults.recommend ? (testResults.recommend.ok ? 'ok' : 'failing') : 'untested',
      lastTest: testResults.recommend || null,
      testTarget: 'recommend',
    },
    {
      id: 'nutrition',
      title: 'Nutrition Pipeline',
      kind: 'function',
      status: testResults.nutrition ? (testResults.nutrition.ok ? 'ok' : 'failing') : 'untested',
      lastTest: testResults.nutrition || null,
      testTarget: 'nutrition',
    },
  ];

  const items = pricesData.items || [];
  return {
    bootstrap,
    functions,
    integrations,
    settings,
    safety,
    prices: {
      items,
      updatedAt: pricesData.updatedAt || null,
      pricedCount: items.filter((i) => i.priceNGN !== null).length,
      total: items.length,
    },
  };
}

async function handleEvaluationCase(index) {
  const caseIndex = Number(index);
  if (isNaN(caseIndex) || caseIndex < 0 || caseIndex >= EVALUATION_PROFILES.length) {
    throw AppError.validation({ index: 'Valid profile index is required.' });
  }
  const testCase = EVALUATION_PROFILES[caseIndex];
  const start = Date.now();
  const recs = await getRecommendations('eval-runner', { customProfile: testCase.profile });
  const meals = recs.meals || [];
  const nutritionSources = [];
  if (meals.length > 0) {
    const n1 = await getMealNutrition('eval-runner', null, { sampleMeal: meals[0], userConditions: testCase.profile.conditions });
    nutritionSources.push(n1.source);
    if (meals.length > 1) {
      await new Promise((r) => setTimeout(r, 400));
      const n2 = await getMealNutrition('eval-runner', null, { sampleMeal: meals[1], userConditions: testCase.profile.conditions });
      nutritionSources.push(n2.source);
    }
  }
  return {
    ok: true, caseIndex, name: testCase.name, persona: testCase.persona,
    perMealCapNGN: recs.perMealCapNGN, weeklyBudgetNGN: testCase.profile.weeklyBudgetNGN,
    conditions: testCase.profile.conditions, latencyMs: Date.now() - start,
    mealsCount: meals.length, schemaValidCount: meals.length,
    withinBudgetCount: meals.filter((m) => !m.overBudget).length,
    safetyFlagCounts: meals.reduce((sum, m) => sum + (m.safetyFlags?.length || 0), 0),
    nutritionSources,
    usdaCount: nutritionSources.filter((s) => s === 'usda').length,
    aiEstimateCount: nutritionSources.filter((s) => s === 'ai-estimate').length,
  };
}

export default withHandler(async (req, res) => {
  const body = req.body || {};
  const action = body.action;
  if (!action) throw AppError.validation({ action: 'Action is required.' });

  if (action === 'me') {
    const { uid } = await verifyRequest(req);
    return res.status(200).json({ isAdmin: await checkIsAdmin(uid) });
  }

  if (action === 'public-settings' || action === 'publicConfig') {
    const settings = await getSettingsConfig();
    return res.status(200).json({
      appName: settings.appName || 'ChopWise',
      appTagline: settings.appTagline || 'Nigerian meals that fit your health and your wallet.',
      appIcon: settings.appIcon || '🍲',
      heroImageUrl: settings.heroImageUrl || null,
    });
  }

  const { uid: adminId } = await requireAdmin(req);

  if (action === 'status') {
    const statusData = await handleStatus();
    return res.status(200).json(statusData);
  }

  if (action === 'listGeminiModels') {
    const models = await listAvailableModels(body.apiKey);
    return res.status(200).json({ ok: true, models });
  }

  if (action === 'saveConfig') {
    const { section, values } = body;
    if (!section || !values) throw AppError.validation({ section: 'Section and values are required.' });
    await saveConfig(section, values);
    return res.status(200).json({ ok: true });
  }

  if (action === 'resetSection') {
    const { section } = body;
    if (!section) throw AppError.validation({ section: 'Section is required.' });
    await resetSection(section);
    return res.status(200).json({ ok: true });
  }

  if (action === 'test') {
    const { target, values } = body;
    if (!target) throw AppError.validation({ target: 'Test target is required.' });
    const result = await runHealthCheck(target, values);
    return res.status(200).json(result);
  }

  if (action === 'runEvaluationCase') {
    const evalResult = await handleEvaluationCase(body.index);
    return res.status(200).json(evalResult);
  }

  if (action === 'listCustomers') return res.status(200).json(await listCustomers(body));
  if (action === 'updateCustomer') return res.status(200).json(await updateCustomerEmail(adminId, body));
  if (action === 'setCustomerActive') return res.status(200).json(await setCustomerActive(adminId, body));
  if (action === 'listAdmins') return res.status(200).json(await listAdmins());
  if (action === 'grantAdmin') return res.status(200).json(await grantAdmin(adminId, body));
  if (action === 'revokeAdmin') return res.status(200).json(await revokeAdmin(adminId, body));
  if (action === 'saveBootstrapAdminIds') return res.status(200).json(await saveBootstrapAdminIds(adminId, body));
  if (action === 'listRecipes') return res.status(200).json(await listRecipes(body));
  if (action === 'createRecipe') return res.status(200).json(await createRecipe(adminId, body));
  if (action === 'updateRecipe') return res.status(200).json(await updateRecipe(adminId, body));
  if (action === 'deleteRecipe') return res.status(200).json(await deleteRecipe(adminId, body));
  if (action === 'draftRecipeWithAi') return res.status(200).json(await draftRecipeWithAi(body));
  if (action === 'analyzeRecipeNutrition') return res.status(200).json(await analyzeRecipeNutrition(body));
  if (action === 'listActivity') return res.status(200).json(await listAdminActivity(body));
  if (action === 'clearNutritionCache') return res.status(200).json(await clearNutritionCache(adminId));
  if (action === 'resetRateLimits') return res.status(200).json(await resetRateLimits(adminId));

  throw AppError.validation({ action: `Unknown admin action: ${action}` });
});
