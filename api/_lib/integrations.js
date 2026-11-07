import { getAdminDb } from './firebaseAdmin.js';
import { getGeminiConfig, getEdamamConfig, maskSecret } from './configStore.js';
import { generateJson } from './clients/gemini.js';
import { analyzeIngredients } from './clients/edamam.js';

export const INTEGRATIONS_REGISTRY = [
  {
    id: 'gemini',
    title: 'Google Gemini API',
    description:
      'Powers structured Nigerian meal recommendations and initial calorie/macronutrient estimations.',
    helpLinks: [
      { label: 'Get API Key (Docs)', url: 'https://ai.google.dev/gemini-api/docs/api-key' },
      { label: 'Google AI Studio', url: 'https://aistudio.google.com/' },
      { label: 'Gemini Models List', url: 'https://ai.google.dev/gemini-api/docs/models' },
      { label: 'Structured Output Guide', url: 'https://ai.google.dev/gemini-api/docs/structured-output' },
    ],
    steps: [
      'Open Google AI Studio and sign in with your Google account.',
      'Navigate to API Keys and select "Create API key" (new or existing Google Cloud project).',
      'Copy your API key (starts with AIza).',
      'Paste the key into the API key field below.',
      'Specify a Flash-tier model (e.g. gemini-2.5-flash) from the Models list.',
      'Click Save, then Test to verify connection.',
    ],
    notes: [
      'Free tier has generous per-minute rate limits.',
      'Secrets are encrypted at rest with AES-256-GCM and never returned to the client.',
    ],
    fields: [
      {
        key: 'apiKey',
        label: 'API Key',
        type: 'secret',
        help: 'Starts with AIza. Write-only; leave blank to keep current key.',
      },
      {
        key: 'model',
        label: 'Model Name',
        type: 'text',
        help: 'Recommended: gemini-2.5-flash or gemini-1.5-flash.',
      },
    ],
  },
  {
    id: 'edamam',
    title: 'Edamam Nutrition Analysis API',
    description:
      'Performs ingredient-level dietary analysis and calculates vitamins/minerals for recipe details.',
    helpLinks: [
      { label: 'Developer Portal', url: 'https://developer.edamam.com/' },
      { label: 'API FAQ', url: 'https://developer.edamam.com/api/faq' },
      { label: 'Sign-up Guide', url: 'https://edamamhelp.zendesk.com/hc/en-us/articles/4422823511959-Signing-Up-For-an-API-Without-an-Account' },
      { label: 'Nutrition API Documentation', url: 'https://developer.edamam.com/edamam-docs-nutrition-api' },
    ],
    steps: [
      'Create a developer account at developer.edamam.com.',
      'In Dashboard > Applications, select "Create New Application".',
      'Choose the "Nutrition Analysis API" with the free Developer plan.',
      'Copy your Application ID and Application Key.',
      'Paste both fields below, toggle Enabled to On, click Save, and run Test.',
    ],
    notes: [
      'Keys from the Recipe Search API will fail with 401; you must use the Nutrition Analysis API.',
      'When Edamam cannot parse an indigenous Nigerian ingredient, ChopWise automatically falls back to AI estimates.',
      'Edamam requires visible attribution ("Powered by Edamam") wherever its data is shown.',
    ],
    fields: [
      {
        key: 'appId',
        label: 'Application ID',
        type: 'secret',
        help: 'Found on your Edamam developer dashboard.',
      },
      {
        key: 'appKey',
        label: 'Application Key',
        type: 'secret',
        help: 'Found on your Edamam developer dashboard.',
      },
      {
        key: 'enabled',
        label: 'Enable Edamam Nutrition',
        type: 'toggle',
        help: 'When disabled, ChopWise relies entirely on Gemini nutrition estimates.',
      },
    ],
  },
];

/**
 * Persist an integration or function test result to adminConfig/testResults.
 * @param {string} target
 * @param {object} result
 */
export async function recordTestResult(target, result) {
  try {
    const db = getAdminDb();
    await db
      .collection('adminConfig')
      .doc('testResults')
      .set(
        {
          [target]: {
            ...result,
            testedAt: new Date().toISOString(),
          },
        },
        { merge: true }
      );
  } catch (err) {
    // Non-fatal if recording fails
  }
}

/**
 * Execute healthcheck for a registered target.
 * Targets supported in P5: firestore, gemini, edamam.
 * @param {'firestore'|'gemini'|'edamam'|'recommend'|'nutrition'} target
 */
export async function runHealthCheck(target) {
  const start = Date.now();

  if (target === 'firestore') {
    try {
      const db = getAdminDb();
      await db.collection('adminConfig').doc('settings').get();
      const testRef = db.collection('adminConfig').doc('_healthcheck');
      await testRef.set({ ping: true, at: new Date().toISOString() });
      await testRef.delete();
      const latencyMs = Date.now() - start;
      const result = {
        ok: true,
        message: 'Firestore read/write succeeded',
        latencyMs,
      };
      await recordTestResult(target, result);
      return result;
    } catch (err) {
      const latencyMs = Date.now() - start;
      const result = {
        ok: false,
        message: `Firestore check failed: ${err.message}`,
        latencyMs,
      };
      await recordTestResult(target, result);
      return result;
    }
  }

  if (target === 'gemini') {
    try {
      const prompt = 'Return a JSON object with key "status" and value "ok".';
      const res = await generateJson('You are a ping tester.', prompt);
      const latencyMs = Date.now() - start;
      const ok = res?.status === 'ok';
      const result = {
        ok,
        message: ok
          ? 'Gemini API call and JSON parsing verified'
          : 'Gemini responded with unexpected JSON',
        latencyMs,
      };
      await recordTestResult(target, result);
      return result;
    } catch (err) {
      const latencyMs = Date.now() - start;
      const result = {
        ok: false,
        message: `Gemini test failed: ${err.message}`,
        latencyMs,
      };
      await recordTestResult(target, result);
      return result;
    }
  }

  if (target === 'edamam') {
    try {
      const res = await analyzeIngredients('Test Bowl', ['1 cup white rice']);
      const latencyMs = Date.now() - start;
      const ok = res.calories > 0;
      const result = {
        ok,
        message: ok
          ? `Edamam parsed test line successfully (${res.calories} kcal)`
          : 'Edamam returned 0 calories',
        latencyMs,
      };
      await recordTestResult(target, result);
      return result;
    } catch (err) {
      const latencyMs = Date.now() - start;
      const result = {
        ok: false,
        message: `Edamam test failed: ${err.message}`,
        latencyMs,
      };
      await recordTestResult(target, result);
      return result;
    }
  }

  throw new Error(`Target "${target}" is not supported or not implemented yet.`);
}

/**
 * Build safe integrations array for the /admin UI with masked secrets.
 */
export async function getIntegrationsStatus() {
  const geminiConfig = await getGeminiConfig();
  const edamamConfig = await getEdamamConfig();

  return INTEGRATIONS_REGISTRY.map((integ) => {
    if (integ.id === 'gemini') {
      const hasKey = Boolean(geminiConfig.apiKey);
      return {
        ...integ,
        status: hasKey ? 'configured' : 'not_configured',
        fields: integ.fields.map((f) => {
          if (f.key === 'apiKey') {
            return {
              ...f,
              configured: hasKey,
              masked: hasKey ? maskSecret(geminiConfig.apiKey) : '',
              value: null, // NEVER return secret value
            };
          }
          if (f.key === 'model') {
            return {
              ...f,
              value: geminiConfig.model,
            };
          }
          return f;
        }),
      };
    }

    if (integ.id === 'edamam') {
      const hasAppId = Boolean(edamamConfig.appId);
      const hasAppKey = Boolean(edamamConfig.appKey);
      const isConfigured = hasAppId && hasAppKey;
      return {
        ...integ,
        status: !isConfigured ? 'not_configured' : edamamConfig.enabled ? 'configured' : 'disabled',
        fields: integ.fields.map((f) => {
          if (f.key === 'appId') {
            return {
              ...f,
              configured: hasAppId,
              masked: hasAppId ? maskSecret(edamamConfig.appId) : '',
              value: null,
            };
          }
          if (f.key === 'appKey') {
            return {
              ...f,
              configured: hasAppKey,
              masked: hasAppKey ? maskSecret(edamamConfig.appKey) : '',
              value: null,
            };
          }
          if (f.key === 'enabled') {
            return {
              ...f,
              value: edamamConfig.enabled,
            };
          }
          return f;
        }),
      };
    }

    return integ;
  });
}
