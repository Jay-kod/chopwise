import { withHandler, AppError } from './_lib/http.js';
import { verifyRequest, requireAdmin, checkIsAdmin } from './_lib/auth.js';
import {
  getSettingsConfig,
  getSafetyConfig,
  getPricesConfig,
  saveConfig,
  resetSection,
  getGeminiConfig,
  getEdamamConfig,
} from './_lib/configStore.js';
import { getIntegrationsStatus, runHealthCheck } from './_lib/integrations.js';
import { query, isMysqlConfigured } from './_lib/mysql.js';
import { EVALUATION_PROFILES } from './_lib/data/evaluationProfiles.js';
import { getRecommendations } from './_lib/services/recommendationService.js';
import { getMealNutrition } from './_lib/services/nutritionService.js';
import { listAvailableModels } from './_lib/clients/gemini.js';

async function handleStatus() {
  const bootstrap = {
    mysql: isMysqlConfigured(),
    adminUidsSet: Boolean(process.env.ADMIN_UIDS),
    encryptionKeySet: Boolean(process.env.CONFIG_ENCRYPTION_KEY),
  };

  const [integrations, settings, safety, pricesData] = await Promise.all([
    getIntegrationsStatus(),
    getSettingsConfig(),
    getSafetyConfig(),
    getPricesConfig(),
  ]);

  let testResults = {};
  try {
    const rows = await query('SELECT config FROM admin_config WHERE section = ? LIMIT 1', ['testResults']);
    if (rows?.[0]?.config) {
      testResults = typeof rows[0].config === 'string' ? JSON.parse(rows[0].config) : rows[0].config;
    }
  } catch {}

  const geminiConf = await getGeminiConfig();
  const edamamConf = await getEdamamConfig();
  const dbTest = testResults.mysql || testResults.database || testResults.supabase || null;

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
      id: 'edamam',
      title: 'Edamam Nutrition Analysis API',
      kind: 'integration',
      status: !edamamConf.appId || !edamamConf.appKey ? 'not_configured' : testResults.edamam ? (testResults.edamam.ok ? 'ok' : 'failing') : 'untested',
      lastTest: testResults.edamam || null,
      testTarget: 'edamam',
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
    edamamCount: nutritionSources.filter((s) => s === 'edamam').length,
    aiEstimateCount: nutritionSources.filter((s) => s === 'ai-estimate').length,
  };
}

export default withHandler(async (req, res) => {
  const body = req.body || {};
  const action = body.action;
  if (!action) throw AppError.validation({ action: 'Action is required.' });

  if (action === 'me') {
    const { uid, email } = await verifyRequest(req);
    return res.status(200).json({ isAdmin: checkIsAdmin(uid) || checkIsAdmin(email) });
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

  await requireAdmin(req);

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
    const { target } = body;
    if (!target) throw AppError.validation({ target: 'Test target is required.' });
    const result = await runHealthCheck(target);
    return res.status(200).json(result);
  }

  if (action === 'runEvaluationCase') {
    const evalResult = await handleEvaluationCase(body.index);
    return res.status(200).json(evalResult);
  }

  throw AppError.validation({ action: `Unknown admin action: ${action}` });
});
