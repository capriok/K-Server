const router = require('express').Router();
const pool = require("../database/mysqldb");
// const { cors, corsOptions } = require('../cors/cors')
// var whitelist = ['http://localhost:3000', 'https://sqlifting.netlify.app', 'https://sqlifting.kylecaprio.dev']

// router.use(cors(corsOptions(whitelist)), (req, res, next) => {
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   if (req.method === "OPTIONS") {
//     res.header("Access-Control-Allow-Methods", "GET, PUT, POST, PATCH, DELETE");
//     return res.status(200).json({});
//   }
//   next();
// });

const parseRes = (res) => {
  const arr = []
  res.forEach(r => {
    let row = JSON.parse(JSON.stringify(r))
    arr.push(row)
  })
  return arr
}

// ------------------------------------------------------------- //
// SELECT * FROM ALL
router.get('/', async (req, res) => {
  pool.query('SELECT * FROM user', (error, results) => {
    if (error) throw error;
    res.json(results)
    console.log(parseRes(results));
  });
})

module.exports = router