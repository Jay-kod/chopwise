import { randomUUID } from 'node:crypto';
import { AppError } from '../http.js';
import { query } from '../mysql.js';
import {
  catalogListSchema,
  catalogRecipeSchema,
  recipeIdSchema,
  recipeMutationSchema,
  recipeUpdateSchema,
} from '../schemas.js';
import { runAuditedAdminMutation } from './adminAuditService.js';

function parseStoredRecipe(row) {
  let recipe;
  try {
    recipe = catalogRecipeSchema.parse(JSON.parse(row.recipe));
  } catch {
    throw AppError.internal('A stored catalogue recipe is invalid and could not be displayed.');
  }
  return { id: row.id, recipe, createdAt: row.created_at, updatedAt: row.updated_at };
}

/**
 * Lists shared recipes for either the admin catalogue manager or customers.
 * @param {object} input
 * @returns {Promise<{items: object[], total: number}>}
 */
export async function listRecipes(input) {
  const { search, offset, limit } = catalogListSchema.parse(input);
  const filter = search ? 'WHERE recipe LIKE ?' : '';
  const values = search ? [`%${search}%`] : [];
  const totals = await query(`SELECT COUNT(*) AS total FROM recipe_catalog ${filter}`, values);
  const rows = await query(
    `SELECT id, recipe, created_at, updated_at FROM recipe_catalog ${filter}
     ORDER BY updated_at DESC LIMIT ? OFFSET ?`,
    [...values, limit, offset]
  );
  return { total: Number(totals[0]?.total || 0), items: rows.map(parseStoredRecipe) };
}

/**
 * Adds a validated recipe to the shared catalogue.
 * @param {string} actorId
 * @param {object} input
 * @returns {Promise<{ok: true, item: object}>}
 */
export async function createRecipe(actorId, input) {
  const { recipe } = recipeMutationSchema.parse(input);
  const id = randomUUID();
  return runAuditedAdminMutation(actorId, 'recipe.created', 'recipe', id, async (connection) => {
    await connection.execute(
      'INSERT INTO recipe_catalog (id, recipe, created_by) VALUES (?, ?, ?)',
      [id, JSON.stringify(recipe), actorId]
    );
    const now = new Date().toISOString();
    return {
      result: { ok: true, item: { id, recipe, createdAt: now, updatedAt: now } },
      auditDetails: { name: recipe.name },
    };
  });
}

/**
 * Replaces a catalogue recipe with a validated version.
 * @param {string} actorId
 * @param {object} input
 * @returns {Promise<{ok: true, item: object}>}
 */
export async function updateRecipe(actorId, input) {
  const { id, recipe } = recipeUpdateSchema.parse(input);
  return runAuditedAdminMutation(actorId, 'recipe.updated', 'recipe', id, async (connection) => {
    const [existing] = await connection.execute('SELECT id, created_at FROM recipe_catalog WHERE id = ? FOR UPDATE', [id]);
    if (!existing.length) throw AppError.notFound('Catalogue recipe not found.');
    await connection.execute('UPDATE recipe_catalog SET recipe = ? WHERE id = ?', [JSON.stringify(recipe), id]);
    return {
      result: {
        ok: true,
        item: { id, recipe, createdAt: existing[0].created_at, updatedAt: new Date().toISOString() },
      },
      auditDetails: { name: recipe.name },
    };
  });
}

/**
 * Permanently removes a recipe from the shared catalogue.
 * @param {string} actorId
 * @param {object} input
 * @returns {Promise<{ok: true}>}
 */
export async function deleteRecipe(actorId, input) {
  const { id } = recipeIdSchema.parse(input);
  return runAuditedAdminMutation(actorId, 'recipe.deleted', 'recipe', id, async (connection) => {
    const [result] = await connection.execute('DELETE FROM recipe_catalog WHERE id = ?', [id]);
    if (!result.affectedRows) throw AppError.notFound('Catalogue recipe not found.');
    return { result: { ok: true }, auditDetails: { deleted: true } };
  });
}
