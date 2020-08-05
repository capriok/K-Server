const router = require('express').Router();
const pool = require("../database/mysqldb");
const mysql = require('mysql');
const jwt = require('jsonwebtoken')
const moment = require('moment')
const { cors, corsOptions } = require('../cors/cors')
var whitelist = ['http://localhost:3000', 'https://sqlifting.netlify.app', 'https://sqlifting.kylecaprio.dev']

router.use(cors(corsOptions(whitelist)), (req, res, next) => {
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, PATCH, DELETE");
    return res.status(200).json({});
  }
  next();
});

//JWT HERE

const _ = mysql.format

// SIGN UP
router.post('/register', async (req, res) => {
  const { username } = req.body;
  const { password } = req.body;
  const date = moment().format('YYYY-MM-DD H:mm:ss');
  console.log(date);
  try {
    pool.query(`
      INSERT INTO user (username, password, join_date)
      VALUES('${_(username)}', '${_(password)}', '${_(date)}')
      `,
      (error, results) => {
        if (error) throw error
        console.table(results)
        res.status(200).send("Account created");
      }
    );
  } catch (err) {
    console.error(err.message);
    res.end()
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  const { username } = req.body;
  const { password } = req.body;
  try {
    pool.query(`
      SELECT u.uid, u.username, u.join_date
      FROM user u
      WHERE username = '${_(username)}' AND password = '${_(password)}'
      `,
      (error, results) => {
        if (error) throw error
        const validCredentials = results.length > 0
        if (validCredentials) {
          console.log('Account found');
          const user = {
            uid: results[0].uid,
            name: results[0].username
          }
          console.table(results)
          const token = jwt.sign(user, process.env.SECRET)
          res.status(200).send({ user, token })
        } else {
          console.log('Invalid Credentials');
          res.status(409).end()
        }
      });
  } catch (error) {
    console.log(error);
    res.end()
  }
});

module.exports = router