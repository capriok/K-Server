const Pool = require("pg").Pool;
const HOST = process.env.HOST
const PASSWORD = process.env.PASSWORD

const pool = new Pool({
  user: 'postgres',
  password: PASSWORD,
  database: 'sqlifting',
  host: HOST,
  port: 5432
});

module.exports = pool;