const Pool = require("pg").Pool;
const HOST = process.env.POSTGRESHOST
const PASS = process.env.POSTGRESPASS

const pool = new Pool({
  user: 'postgres',
  password: PASS,
  database: 'sqlifting',
  host: HOST,
  port: 5432
});

module.exports = pool;