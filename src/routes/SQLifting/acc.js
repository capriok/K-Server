const router = require('express').Router();
const DB = require("../../database/mysqldb");
const jwt = require('jsonwebtoken')
const moment = require('moment')
const queries = require('../../models/acc-queries')

// ----------------------------------------------------------------------
// 			 			CORS
// ----------------------------------------------------------------------
var whitelist = ['http://localhost:3000', 'https://sqlifting.netlify.app', 'https://sqlifting.kylecaprio.dev']
const { cors, corsOptions } = require('../../cors/cors');

router.use(cors(corsOptions(whitelist)), (req, res, next) => {
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, PATCH, DELETE");
    return res.status(200).json({});
  }
  next();
});

// ----------------------------------------------------------------------
// 			 			GET METHODS
// ----------------------------------------------------------------------

// ----------------------------------------------
// 			GET USER BY USERNAME, PASSWORD
// ----------------------------------------------
router.get('/user', async (req, res) => {
  const { username, password } = req.query;
  queries.get.user(username, password)
    .then(results => {
      console.log(results);
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
    })
    .catch(err => console.log(err))
})

// ----------------------------------------------------------------------
// 			 			POST METHODS
// ----------------------------------------------------------------------

// ----------------------------------------------
// 			POST USER BY USERNAME, PASSWORD, DATE
// ----------------------------------------------
router.post('/user', async (req, res) => {
  const { username } = req.body;
  const { password } = req.body;
  const date = moment().format('YYYY-MM-DD H:mm:ss');
  queries.post.user(username, password, date)
    .then(results => {
      console.table(results)
      res.send("Account created");
    })
    .catch(err => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.send('Username taken')
        }
        throw err
      } console.log(err)
    }
    )
})

// ----------------------------------------------------------------------
// 			 			UPDATE METHODS
// ----------------------------------------------------------------------

// ----------------------------------------------
// 			UPDATE NAME
// ----------------------------------------------
router.post('/updateName', async (req, res) => {
  const { name, uid } = req.body
  queries.update.name(name, uid)
    .then(results => {
      res.json(results)
    })
    .catch(err => console.log(err))
})

// ----------------------------------------------------------------------
// 			 			DELTE METHODS
// ----------------------------------------------------------------------

// ----------------------------------------------
// 			DELETE BY ID
// ----------------------------------------------
router.post('/byId', async (req, res) => {
  const { uid } = req.body
  queries.delete.byId(uid)
    .then(results => {
      res.json(results)
    })
    .catch(err => console.log(err))
})

module.exports = router