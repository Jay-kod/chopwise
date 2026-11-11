import mysql from 'mysql2/promise';

let pool = null;
let tablesEnsured = false;
let tablesEnsurePromise = null;

const TABLES = [
  `CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) NOT NULL PRIMARY KEY, email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    consent_at DATETIME NULL, profile_complete TINYINT(1) NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1, profile LONGTEXT NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_users_email (email)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS saved_meals (
    id VARCHAR(100) NOT NULL PRIMARY KEY, user_id VARCHAR(36) NOT NULL, meal_id VARCHAR(100) NOT NULL,
    meal LONGTEXT NOT NULL, saved_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_meal (user_id, meal_id), KEY idx_saved_meals_user (user_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS latest_recs (
    user_id VARCHAR(36) NOT NULL PRIMARY KEY, meals LONGTEXT NOT NULL, profile_hash VARCHAR(64) NULL,
    per_meal_cap_ngn DECIMAL(10,2) NULL, generated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS nutrition_cache (
    ingredients_hash VARCHAR(64) NOT NULL PRIMARY KEY, nutrition LONGTEXT NOT NULL,
    source VARCHAR(50) NOT NULL, fetched_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS rate_limits (
    user_id VARCHAR(64) NOT NULL PRIMARY KEY, window_start BIGINT NOT NULL, count INT NOT NULL DEFAULT 1
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS admin_config (
    section VARCHAR(50) NOT NULL PRIMARY KEY, config LONGTEXT NOT NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS admin_roles (
    user_id VARCHAR(36) NOT NULL PRIMARY KEY, granted_by VARCHAR(36) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, KEY idx_admin_roles_granted_by (granted_by)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS recipe_catalog (
    id VARCHAR(36) NOT NULL PRIMARY KEY, recipe LONGTEXT NOT NULL, created_by VARCHAR(36) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_recipe_catalog_updated (updated_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS admin_activity (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, actor_id VARCHAR(36) NOT NULL,
    action VARCHAR(80) NOT NULL, entity_type VARCHAR(40) NOT NULL, entity_id VARCHAR(100) NULL,
    details LONGTEXT NOT NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_admin_activity_created (created_at), KEY idx_admin_activity_actor (actor_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
];

function getConnectionConfig() {
  const database = process.env.MYSQL_DATABASE || 'chopwise';
  if (!/^[A-Za-z0-9_]+$/.test(database)) throw new Error('MYSQL_DATABASE has an invalid name.');
  return {
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database,
    connectTimeout: 4000,
  };
}

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      ...getConnectionConfig(),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 4000,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });
  }
  return pool;
}

export async function query(sql, params = []) {
  await ensureDatabaseAndTables();
  const [rows] = await getPool().execute(sql, params);
  return rows;
}

async function addActiveAccountMigration(connection) {
  const [columns] = await connection.query("SHOW COLUMNS FROM users LIKE 'is_active'");
  if (columns.length === 0) {
    await connection.query(
      'ALTER TABLE users ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1 AFTER profile_complete'
    );
  }
}

async function addAvatarColumnMigration(connection) {
  const [columns] = await connection.query("SHOW COLUMNS FROM users LIKE 'avatar'");
  if (columns.length === 0) {
    await connection.query('ALTER TABLE users ADD COLUMN avatar LONGTEXT NULL AFTER profile');
  }
}

async function removeLegacyEdamamConfig(connection) {
  for (const section of ['integrations', 'testResults']) {
    const [rows] = await connection.execute(
      'SELECT config FROM admin_config WHERE section = ? LIMIT 1',
      [section]
    );
    if (!rows.length) continue;

    const stored = typeof rows[0].config === 'string' ? JSON.parse(rows[0].config) : rows[0].config;
    if (!stored || !Object.hasOwn(stored, 'edamam')) continue;
    delete stored.edamam;
    await connection.execute(
      'UPDATE admin_config SET config = ?, updated_at = NOW() WHERE section = ?',
      [JSON.stringify(stored), section]
    );
  }
  await connection.execute("DELETE FROM nutrition_cache WHERE source = 'edamam'");
}

export async function ensureDatabaseAndTables() {
  if (tablesEnsured) return;
  if (!tablesEnsurePromise) {
    tablesEnsurePromise = initializeDatabase().catch((error) => {
      tablesEnsurePromise = null;
      throw error;
    });
  }
  await tablesEnsurePromise;
}

async function initializeDatabase() {
  const config = getConnectionConfig();
  const { database, ...connectionConfig } = config;
  const connection = await mysql.createConnection({
    ...connectionConfig,
    connectTimeout: 4000,
  });
  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    await connection.query(`USE \`${database}\``);
    for (const statement of TABLES) await connection.query(statement);
    await addActiveAccountMigration(connection);
    await addAvatarColumnMigration(connection);
    await removeLegacyEdamamConfig(connection);
    tablesEnsured = true;
  } finally {
    await connection.end();
  }
}

export function isMysqlConfigured() {
  return true;
}
