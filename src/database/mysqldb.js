const mysql = require('mysql');
const HOST = process.env.MYSQLHOST
const PASS = process.env.MYSQLPASS

//RDS SERVER
// const pool = mysql.createPool({
//   user: 'admin',
//   password: PASS,
//   database: 'sqlifting',
//   host: HOST,
//   port: 3306
// });

//LOCALHOST
const pool = mysql.createPool({
  user: 'root',
  password: PASS,
  database: 'sqlifting',
  host: 'localhost',
  port: 3306,
  multipleStatements: true
});



module.exports = pool