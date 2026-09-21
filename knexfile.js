// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
const dotenv = require('dotenv');
dotenv.config();

const createConfig = () => ({
  client: 'mysql',
  connection: {
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT || 3306),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    timezone: 'Z',
    charset: 'utf8mb4',
  },
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    directory: './migrations',
    tableName: 'knex_migrations',
  },
  seeds: {
    directory: './seeds',
  },
});

module.exports = {
  local: createConfig(),
  development: createConfig(),
  staging: createConfig(),
  production: createConfig(),
};
