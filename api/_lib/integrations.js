import { query } from './mysql.js';
import { getGeminiConfig, getEdamamConfig, maskSecret } from './configStore.js';
import { generateJson } from './clients/gemini.js';
import { analyzeIngredients } from './clients/edamam.js';
import { INTEGRATIONS_REGISTRY } from './data/integrationsRegistry.js';

export { INTEGRATIONS_REGISTRY };

export async function recordTestResult(target, result) {
  try {
    const rows = await query('SELECT config FROM admin_config WHERE section = ? LIMIT 1', ['testResults']);
    let existing = {};
    if (rows?.[0]?.config) {
      existing = typeof rows[0].config === 'string' ? JSON.parse(rows[0].config) : rows[0].config;
    }
    const merged = { ...existing, [target]: { ...result, testedAt: new Date().toISOString() } };
    await query(
      `INSERT INTO admin_config (section, config, updated_at)
       VALUES ('testResults', ?, NOW())
       ON DUPLICATE KEY UPDATE config = VALUES(config), updated_at = NOW()`,
      [JSON.stringify(merged)]
    );
  } catch {}
}

async function testDatabase(start) {
  try {
    await query('SELECT 1');
    return { ok: true, message: 'MySQL (XAMPP) database query succeeded', latencyMs: Date.now() - start };
  } catch (err) {
    return { ok: false, message: `MySQL check failed: ${err.message}`, latencyMs: Date.now() - start };
  }
}

async function testGemini(start) {
  try {
    const res = await generateJson('You are a ping tester.', 'Return JSON: {"status":"ok"}');
    const ok = res?.status === 'ok';
    return {
      ok,
      message: ok ? 'Gemini API call and JSON parsing verified' : 'Unexpected response',
      latencyMs: Date.now() - start,
    };
  } catch (err) {
    return { ok: false, message: `Gemini test failed: ${err.message}`, latencyMs: Date.now() - start };
  }
}

async function testEdamam(start) {
  try {
    const res = await analyzeIngredients('Test Bowl', ['1 cup white rice']);
    const ok = res.calories > 0;
    return {
      ok,
      message: ok ? `Edamam parsed test line (${res.calories} kcal)` : '0 calories',
      latencyMs: Date.now() - start,
    };
  } catch (err) {
    return { ok: false, message: `Edamam test failed: ${err.message}`, latencyMs: Date.now() - start };
  }
}

async function testRecommendPipeline(start) {
  try {
    const { getRecommendations } = await import('./services/recommendationService.js');
    const res = await getRecommendations(null, { isSampleTest: true });
    const count = res?.meals?.length || 0;
    const ok = count > 0;
    return {
      ok,
      message: ok ? `Pipeline generated ${count} valid meals` : '0 meals generated',
      latencyMs: Date.now() - start,
    };
  } catch (err) {
    return { ok: false, message: `Recommend test failed: ${err.message}`, latencyMs: Date.now() - start };
  }
}

async function testNutritionPipeline(start) {
  try {
    const { getMealNutrition } = await import('./services/nutritionService.js');
    const sampleMeal = {
      id: 'sample-jollof', name: 'Jollof Rice with Chicken',
      ingredients: [{ item: 'rice', quantity: 1, unit: 'cup' }],
      aiNutritionEstimate: { calories: 500, proteinG: 30, carbsG: 60, fatG: 12, sodiumMg: 400, sugarG: 3 },
    };
    const res = await getMealNutrition(null, null, { sampleMeal });
    const ok = Boolean(res?.nutrition?.calories > 0);
    return {
      ok,
      message: ok ? `Resolved ${res.nutrition.calories} kcal (${res.source})` : '0 calories',
      latencyMs: Date.now() - start,
    };
  } catch (err) {
    return { ok: false, message: `Nutrition test failed: ${err.message}`, latencyMs: Date.now() - start };
  }
}

export async function runHealthCheck(target) {
  const start = Date.now();
  let result;
  if (['mysql', 'database', 'supabase', 'firestore'].includes(target)) {
    result = await testDatabase(start);
  } else if (target === 'gemini') {
    result = await testGemini(start);
  } else if (target === 'edamam') {
    result = await testEdamam(start);
  } else if (target === 'recommend') {
    result = await testRecommendPipeline(start);
  } else if (target === 'nutrition') {
    result = await testNutritionPipeline(start);
  } else {
    throw new Error(`Target "${target}" is not supported.`);
  }

  await recordTestResult(target, result);
  return result;
}

export async function getIntegrationsStatus() {
  const [geminiConfig, edamamConfig] = await Promise.all([getGeminiConfig(), getEdamamConfig()]);

  return INTEGRATIONS_REGISTRY.map((integ) => {
    if (integ.id === 'gemini') {
      const hasKey = Boolean(geminiConfig.apiKey);
      return {
        ...integ,
        status: hasKey ? 'configured' : 'not_configured',
        fields: integ.fields.map((f) => {
          if (f.key === 'apiKey') return { ...f, configured: hasKey, masked: hasKey ? maskSecret(geminiConfig.apiKey) : '', value: null };
          if (f.key === 'model') return { ...f, value: geminiConfig.model };
          return f;
        }),
      };
    }
    if (integ.id === 'edamam') {
      const isConfigured = Boolean(edamamConfig.appId && edamamConfig.appKey);
      return {
        ...integ,
        status: !isConfigured ? 'not_configured' : edamamConfig.enabled ? 'configured' : 'disabled',
        fields: integ.fields.map((f) => {
          if (f.key === 'appId') return { ...f, configured: Boolean(edamamConfig.appId), masked: edamamConfig.appId ? maskSecret(edamamConfig.appId) : '', value: null };
          if (f.key === 'appKey') return { ...f, configured: Boolean(edamamConfig.appKey), masked: edamamConfig.appKey ? maskSecret(edamamConfig.appKey) : '', value: null };
          if (f.key === 'enabled') return { ...f, value: edamamConfig.enabled };
          return f;
        }),
      };
    }
    return integ;
  });
}
