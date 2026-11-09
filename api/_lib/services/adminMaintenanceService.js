import { getPool, ensureDatabaseAndTables } from '../mysql.js';
import { runAuditedAdminMutation } from './adminAuditService.js';

/**
 * Clears cached nutrition results without touching customer records.
 * @param {string} actorId
 * @returns {Promise<{ok: true, deletedCount: number}>}
 */
export async function clearNutritionCache(actorId) {
  return runAuditedAdminMutation(actorId, 'maintenance.nutrition-cache-cleared', 'system', null, async (connection) => {
    const [result] = await connection.execute('DELETE FROM nutrition_cache');
    return {
      result: { ok: true, deletedCount: result.affectedRows },
      auditDetails: { deletedCount: result.affectedRows },
    };
  });
}

/**
 * Resets rate-limit counters without deleting account data.
 * @param {string} actorId
 * @returns {Promise<{ok: true, deletedCount: number}>}
 */
export async function resetRateLimits(actorId) {
  return runAuditedAdminMutation(actorId, 'maintenance.rate-limits-reset', 'system', null, async (connection) => {
    const [result] = await connection.execute('DELETE FROM rate_limits');
    return {
      result: { ok: true, deletedCount: result.affectedRows },
      auditDetails: { deletedCount: result.affectedRows },
    };
  });
}

export async function runMysqlHealthCheck() {
  await ensureDatabaseAndTables();
  const connection = await getPool().getConnection();
  try {
    await connection.query('SELECT 1');
    return true;
  } finally {
    connection.release();
  }
}
