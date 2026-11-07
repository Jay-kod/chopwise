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
import {
  getIntegrationsStatus,
  runHealthCheck,
} from './_lib/integrations.js';
import { getAdminDb } from './_lib/firebaseAdmin.js';

export default withHandler(async (req, res) => {
  const body = req.body || {};
  const action = body.action;

  if (!action) {
    throw AppError.validation({ action: 'Action is required.' });
  }

  // 1. Action: me (Open to any authenticated Firebase user)
  if (action === 'me') {
    const { uid } = await verifyRequest(req);
    const isAdmin = checkIsAdmin(uid);
    return res.status(200).json({ isAdmin });
  }

  // All subsequent actions require verified admin access
  await requireAdmin(req);

  // 2. Action: status
  if (action === 'status') {
    const bootstrap = {
      firebaseAdmin: Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_B64),
      adminUidsSet: Boolean(process.env.ADMIN_UIDS),
      encryptionKeySet: Boolean(process.env.CONFIG_ENCRYPTION_KEY),
    };

    const integrations = await getIntegrationsStatus();
    const settings = await getSettingsConfig();
    const safety = await getSafetyConfig();
    const pricesData = await getPricesConfig();

    // Load persisted test results
    let testResults = {};
    try {
      const db = getAdminDb();
      const snap = await db.collection('adminConfig').doc('testResults').get();
      if (snap.exists) testResults = snap.data();
    } catch {
      testResults = {};
    }

    const geminiConf = await getGeminiConfig();
    const edamamConf = await getEdamamConfig();

    // Build functions & APIs status list (contains items built so far)
    const functions = [
      {
        id: 'firestore',
        title: 'Firestore (Admin SDK)',
        kind: 'function',
        status: testResults.firestore
          ? testResults.firestore.ok
            ? 'ok'
            : 'failing'
          : bootstrap.firebaseAdmin
          ? 'untested'
          : 'not_configured',
        lastTest: testResults.firestore || null,
        testTarget: 'firestore',
      },
      {
        id: 'gemini',
        title: 'Gemini API',
        kind: 'integration',
        status: !geminiConf.apiKey
          ? 'not_configured'
          : testResults.gemini
          ? testResults.gemini.ok
            ? 'ok'
            : 'failing'
          : 'untested',
        lastTest: testResults.gemini || null,
        testTarget: 'gemini',
      },
      {
        id: 'edamam',
        title: 'Edamam Nutrition Analysis API',
        kind: 'integration',
        status: !edamamConf.appId || !edamamConf.appKey
          ? 'not_configured'
          : testResults.edamam
          ? testResults.edamam.ok
            ? 'ok'
            : 'failing'
          : 'untested',
        lastTest: testResults.edamam || null,
        testTarget: 'edamam',
      },
    ];

    const items = pricesData.items || [];
    const pricedCount = items.filter((i) => i.priceNGN !== null).length;

    return res.status(200).json({
      bootstrap,
      functions,
      integrations,
      settings,
      safety,
      prices: {
        items,
        updatedAt: pricesData.updatedAt || null,
        pricedCount,
        total: items.length,
      },
    });
  }

  // 3. Action: saveConfig
  if (action === 'saveConfig') {
    const { section, values } = body;
    if (!section || !values) {
      throw AppError.validation({
        section: 'Section and values are required for saveConfig.',
      });
    }

    await saveConfig(section, values);
    return res.status(200).json({ ok: true });
  }

  // 4. Action: resetSection
  if (action === 'resetSection') {
    const { section } = body;
    if (!section) {
      throw AppError.validation({ section: 'Section is required for resetSection.' });
    }

    await resetSection(section);
    return res.status(200).json({ ok: true });
  }

  // 5. Action: test
  if (action === 'test') {
    const { target } = body;
    if (!target) {
      throw AppError.validation({ target: 'Test target is required.' });
    }

    const result = await runHealthCheck(target);
    return res.status(200).json(result);
  }

  throw AppError.validation({ action: `Unknown admin action: ${action}` });
});

