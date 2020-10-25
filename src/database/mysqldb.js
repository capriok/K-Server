const mysql = require('mysql');
const HOST = process.env.MYSQLHOST
const PASS = process.env.MYSQLPASS

//RDS
// const connection = mysql.createConnection({
//   user: 'admin',
//   password: PASS,
//   database: 'sqlifting',
//   host: HOST,
//   port: 3306,
//   multipleStatements: true
// });

//LOCAL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: PASS,
  database: 'sqlifting',
  multipleStatements: true
});

module.exports = connection