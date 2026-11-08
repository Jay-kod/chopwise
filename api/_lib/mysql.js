import mysql from 'mysql2/promise';

let pool = null;
let tablesEnsured = false;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST || 'localhost',
      port: Number(process.env.MYSQL_PORT) || 3306,
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'chopwise',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });
  }
  return pool;
}

export async function query(sql, params = []) {
  if (!tablesEnsured) {
    try {
      await ensureDatabaseAndTables();
    } catch {
      // Continue and let query proceed or surface connectivity error
    }
  }
  const p = getPool();
  const [rows] = await p.execute(sql, params);
  return rows;
}

export async function ensureDatabaseAndTables() {
  if (tablesEnsured) return;

  const host = process.env.MYSQL_HOST || 'localhost';
  const port = Number(process.env.MYSQL_PORT) || 3306;
  const user = process.env.MYSQL_USER || 'root';
  const password = process.env.MYSQL_PASSWORD || '';
  const database = process.env.MYSQL_DATABASE || 'chopwise';

  const conn = await mysql.createConnection({ host, port, user, password });

  try {
    await conn.query(
      `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await conn.query(`USE \`${database}\`;`);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` VARCHAR(36) NOT NULL,
        \`email\` VARCHAR(255) NOT NULL,
        \`password_hash\` VARCHAR(255) NOT NULL,
        \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`consent_at\` DATETIME NULL,
        \`profile_complete\` TINYINT(1) NOT NULL DEFAULT 0,
        \`profile\` LONGTEXT NULL,
        \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`uq_users_email\` (\`email\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`saved_meals\` (
        \`id\` VARCHAR(100) NOT NULL,
        \`user_id\` VARCHAR(36) NOT NULL,
        \`meal_id\` VARCHAR(100) NOT NULL,
        \`meal\` LONGTEXT NOT NULL,
        \`saved_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`uq_user_meal\` (\`user_id\`, \`meal_id\`),
        KEY \`idx_saved_meals_user\` (\`user_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`latest_recs\` (
        \`user_id\` VARCHAR(36) NOT NULL,
        \`meals\` LONGTEXT NOT NULL,
        \`profile_hash\` VARCHAR(64) NULL,
        \`per_meal_cap_ngn\` DECIMAL(10,2) NULL,
        \`generated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`user_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`nutrition_cache\` (
        \`ingredients_hash\` VARCHAR(64) NOT NULL,
        \`nutrition\` LONGTEXT NOT NULL,
        \`source\` VARCHAR(50) NOT NULL,
        \`fetched_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`ingredients_hash\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`rate_limits\` (
        \`user_id\` VARCHAR(64) NOT NULL,
        \`window_start\` BIGINT NOT NULL,
        \`count\` INT NOT NULL DEFAULT 1,
        PRIMARY KEY (\`user_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`admin_config\` (
        \`section\` VARCHAR(50) NOT NULL,
        \`config\` LONGTEXT NOT NULL,
        \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`section\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    tablesEnsured = true;
  } finally {
    await conn.end();
  }
}

export function isMysqlConfigured() {
  return true;
}

