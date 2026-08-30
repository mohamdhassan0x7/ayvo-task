require('dotenv').config();

// Config consumed by sequelize-cli (see ../../../.sequelizerc). Kept as
// plain JS/CommonJS since the CLI doesn't run through ts-node.
const base = {
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'ayvo_task',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  dialect: 'postgres',
};

module.exports = {
  development: base,
  test: base,
  production: base,
};
