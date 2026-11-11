import { query } from './mysql.js';
import { getGeminiConfig, getUsdaConfig, maskSecret } from './configStore.js';
import { generateJson } from './clients/gemini.js';
import { analyzeIngredients } from './clients/usda.js';
import { INTEGRATIONS_REGISTRY } from './data/integrationsRegistry.js';

export { INTEGRATIONS_REGISTRY };

export async function recordTestResult(target, result) {
  try {
    const recordPromise = (async () => {
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
    })();

    // Non-blocking timeout: maximum 2s wait so DB persistence never hangs the response
    await Promise.race([
      recordPromise,
      new Promise((resolve) => setTimeout(resolve, 2000)),
    ]);
  } catch {}
}

async function testDatabase(start) {
  try {
    const pingPromise = query('SELECT 1');
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Database query timed out after 4s')), 4000)
    );
    await Promise.race([pingPromise, timeoutPromise]);
    return { ok: true, message: 'MySQL (XAMPP) database query succeeded', latencyMs: Date.now() - start };
  } catch (err) {
    return { ok: false, message: `MySQL check failed: ${err.message}`, latencyMs: Date.now() - start };
  }
}

async function testGemini(start, values = {}) {
  try {
    const keyOverride = values?.apiKey ? String(values.apiKey).trim() : null;
    const modelOverride = values?.model ? String(values.model).trim() : null;

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Gemini ping timed out after 12s. Check network connection.')), 12000)
    );

    const pingPromise = generateJson(
      'You are a ping tester.',
      'Return JSON: {"status":"ok"}',
      null,
      modelOverride,
      keyOverride
    );

    const res = await Promise.race([pingPromise, timeoutPromise]);
    const ok = res?.status === 'ok';
    return {
      ok,
      message: ok ? 'Gemini API call and JSON parsing verified' : 'Unexpected response from Gemini',
      latencyMs: Date.now() - start,
    };
  } catch (err) {
    return { ok: false, message: `Gemini test failed: ${err.message}`, latencyMs: Date.now() - start };
  }
}

async function testUsda(start, values = {}) {
  try {
    const apiKeyOverride = values?.apiKey ? String(values.apiKey).trim() : null;
    const config = apiKeyOverride ? null : await getUsdaConfig();

    if (!apiKeyOverride && !config.enabled) {
      return {
        ok: true,
        message: 'USDA FoodData Central is disabled; nutrition uses Gemini AI estimates',
        latencyMs: Date.now() - start,
      };
    }

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('USDA FoodData Central test timed out after 12s')), 12000)
    );

    const res = await Promise.race([
      analyzeIngredients(
        [{ item: 'white rice', quantity: 100, unit: 'g' }],
        apiKeyOverride ? { apiKey: apiKeyOverride } : null
      ),
      timeoutPromise,
    ]);
    const ok = res.nutrition.calories > 0;
    return {
      ok,
      message: ok ? `USDA FoodData Central analyzed white rice (${res.nutrition.calories} kcal)` : '0 calories returned',
      latencyMs: Date.now() - start,
    };
  } catch (err) {
    return { ok: false, message: `USDA test failed: ${err.message}`, latencyMs: Date.now() - start };
  }
}

async function testRecommendPipeline(start) {
  try {
    const { getRecommendations } = await import('./services/recommendationService.js');
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Recommendation pipeline test timed out after 15s')), 15000)
    );
    const res = await Promise.race([
      getRecommendations(null, { isSampleTest: true }),
      timeoutPromise,
    ]);
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
      ingredients: [{ item: 'rice', quantity: 100, unit: 'g' }],
      aiNutritionEstimate: { calories: 500, proteinG: 30, carbsG: 60, fatG: 12, sodiumMg: 400, sugarG: 3 },
    };
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Nutrition pipeline test timed out after 15s')), 15000)
    );
    const res = await Promise.race([
      getMealNutrition(null, null, { sampleMeal }),
      timeoutPromise,
    ]);
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

export async function runHealthCheck(target, values = {}) {
  const start = Date.now();
  let result;
  if (target === 'mysql') {
    result = await testDatabase(start);
  } else if (target === 'gemini') {
    result = await testGemini(start, values);
  } else if (target === 'usda') {
    result = await testUsda(start, values);
  } else if (target === 'recommend') {
    result = await testRecommendPipeline(start);
  } else if (target === 'nutrition') {
    result = await testNutritionPipeline(start);
  } else {
    throw new Error(`Target "${target}" is not supported.`);
  }

  const finalResult = {
    ...result,
    testedAt: new Date().toISOString(),
  };

  await recordTestResult(target, finalResult);
  return finalResult;
}

export async function getIntegrationsStatus(testResults = {}) {
  const [geminiConfig, usdaConfig] = await Promise.all([
    getGeminiConfig(),
    getUsdaConfig(),
  ]);

  return INTEGRATIONS_REGISTRY.map((integ) => {
    const lastTest = testResults[integ.id] || null;
    if (integ.id === 'gemini') {
      const hasKey = Boolean(geminiConfig.apiKey);
      return {
        ...integ,
        status: hasKey ? 'configured' : 'not_configured',
        lastTest,
        fields: integ.fields.map((f) => {
          if (f.key === 'apiKey') return { ...f, configured: hasKey, masked: hasKey ? maskSecret(geminiConfig.apiKey) : '', value: null };
          if (f.key === 'model') return { ...f, value: geminiConfig.model };
          return f;
        }),
      };
    }
    if (integ.id === 'usda') {
      const isConfigured = Boolean(usdaConfig.apiKey);
      return {
        ...integ,
        status: !isConfigured ? 'not_configured' : usdaConfig.enabled ? 'configured' : 'disabled',
        lastTest,
        fields: integ.fields.map((f) => {
          if (f.key === 'apiKey') return { ...f, configured: isConfigured, masked: isConfigured ? maskSecret(usdaConfig.apiKey) : '', value: null };
          if (f.key === 'enabled') return { ...f, value: usdaConfig.enabled };
          return f;
        }),
      };
    }
    return { ...integ, lastTest };
  });
}
