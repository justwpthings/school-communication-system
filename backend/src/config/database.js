const knex = require('knex');
const { dbConfig, env } = require('./env');

const db = knex({
  client: 'mysql2',
  connection: dbConfig,
  pool: {
    min: 2,
    max: 10
  },
  acquireConnectionTimeout: 10000,
  debug: env === 'development'
});

module.exports = db;
