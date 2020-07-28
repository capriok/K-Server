var mysql = require('mysql');
const HOST = process.env.MYSQLHOST
const PASS = process.env.MYSQLPASS

const pool = mysql.createPool({
  user: 'admin',
  password: PASS,
  database: 'sqlifting',
  host: HOST,
  port: 3306
});


module.exports = pool
