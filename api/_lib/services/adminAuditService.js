import { getPool, ensureDatabaseAndTables, query } from '../mysql.js';
import { adminListSchema } from '../schemas.js';

/**
 * Runs a privileged mutation and appends its audit record in the same transaction.
 * @param {string} actorId
 * @param {string} action
 * @param {string} entityType
 * @param {string|null} entityId
 * @param {(connection: import('mysql2/promise').PoolConnection) => Promise<{result: object, auditDetails?: object, auditEntityId?: string|null}>} operation
 * @returns {Promise<object>}
 */
export async function runAuditedAdminMutation(actorId, action, entityType, entityId, operation) {
  await ensureDatabaseAndTables();
  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();
    const outcome = await operation(connection);
    await connection.execute(
      `INSERT INTO admin_activity (actor_id, action, entity_type, entity_id, details)
       VALUES (?, ?, ?, ?, ?)`,
      [actorId, action, entityType, outcome.auditEntityId ?? entityId, JSON.stringify(outcome.auditDetails || {})]
    );
    await connection.commit();
    return outcome.result;
  } catch (error) {
    try {
      await connection.rollback();
    } catch (rollbackError) {
      throw new AggregateError([error, rollbackError], 'Admin change failed and rollback could not complete.');
    }
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Returns a paginated, read-only view of privileged activity.
 * @param {object} input
 * @returns {Promise<{items: object[], total: number}>}
 */
export async function listAdminActivity(input) {
  const { offset, limit } = adminListSchema.parse(input);
  const totals = await query('SELECT COUNT(*) AS total FROM admin_activity');
  const rows = await query(
    `SELECT id, actor_id, action, entity_type, entity_id, details, created_at
     FROM admin_activity ORDER BY id DESC LIMIT ? OFFSET ?`,
    [limit, offset]
  );
  return {
    total: Number(totals[0]?.total || 0),
    items: rows.map((row) => ({
      id: row.id,
      actorId: row.actor_id,
      action: row.action,
      entityType: row.entity_type,
      entityId: row.entity_id,
      details: JSON.parse(row.details || '{}'),
      createdAt: row.created_at,
    })),
  };
}
