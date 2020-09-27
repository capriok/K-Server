const router = require('express').Router();
const DB = require("../../database/mysqldb");
const mysql = require('mysql');
const jwt = require('jsonwebtoken')
const moment = require('moment')
const { cors, corsOptions } = require('../../cors/cors')
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

  DB.query(`
    INSERT INTO user (username, password, join_date)
    VALUES('${_(username)}', '${_(password)}', '${_(date)}')
    `,
    (error, results) => {
      if (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          return res.send('Username taken')
        }
        throw error
      }
      console.table(results)
      res.send("Account created");
    }
  );
});

// LOGIN
router.post('/login', async (req, res) => {
  const { username } = req.body;
  const { password } = req.body;
  DB.query(`
    SELECT u.uid, u.username, u.join_date
    FROM user u
    WHERE username = '${_(username)}'
    AND password LIKE BINARY '${_(password)}'
    `,
    (error, results) => {
      if (error) throw error
      const matchedUsername = results.length > 0
      if (matchedUsername) {
        console.log('Account found');
        const user = {
          uid: results[0].uid,
          username: results[0].username
        }
        console.table(results)
        const token = jwt.sign(user, process.env.SECRET)
        res.send({ user, token })
      } else {
        console.log('Login attempt failed');
        res.status(400).end();
      }
    });
});

module.exports = router