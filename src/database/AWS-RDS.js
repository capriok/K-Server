const Pool = require("pg").Pool;
const DB = process.env.DB
const PORT = process.env.PORT
const HOST = process.env.HOST
const USER = process.env.USER
const PASSWORD = process.env.PASSWORD

const pool = new Pool({
  user: USER,
  password: PASSWORD,
  host: HOST,
  port: PORT,
  database: DB
});

module.exports = pool;