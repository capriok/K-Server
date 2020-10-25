const mysql = require('mysql');
require('dotenv').config()
const HOST = process.env.MYSQLHOST
const PASS = process.env.MYSQLPASS

const isDev = process.env.NODE_ENV === 'development'

const connection = mysql.createConnection({
  user: isDev ? 'root' : 'admin',
  password: PASS,
  host: isDev ? 'localhost' : HOST,
  database: 'sqlifting',
  port: 3306,
  multipleStatements: true
});

module.exports = connection