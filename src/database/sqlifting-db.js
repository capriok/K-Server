const Client = require("pg").Client;
const HOST = process.env.HOST
const PASSWORD = process.env.PASSWORD

module.exports = new Client({
  user: 'postgres',
  password: PASSWORD,
  database: 'sqlifting',
  host: HOST,
  port: 5432
});
