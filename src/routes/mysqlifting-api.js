const router = require('express').Router();
const pool = require("../database/mysqldb");
const mysql = require('mysql');
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

//GET USER BY ID
// pool.query(`SELECT * FROM user WHERE uid = ${_(uid)}`, (error, results) => {
//   if (error) throw error;
//   res.json(results)
//   console.log(parse(results));
// });


const _ = mysql.format

const parse = (res) => {
  const arr = []
  res.forEach(r => {
    let row = JSON.parse(JSON.stringify(r))
    arr.push(row)
  })
  return arr
}


// ------------------------------------------------------------- //
// GET ALL COMPOSITIONS
router.get('/get/compositions', async (req, res) => {
  const { uid } = req.query
  pool.query(`
    SELECT eq.eq_id, eq.name FROM equipment eq WHERE uid = ${_(uid)};
    SELECT mu.mu_id, mu.name FROM muscle mu WHERE uid = ${_(uid)};
    SELECT ex.ex_id, ex.name FROM exercise ex WHERE uid = ${_(uid)};
    `,
    (error, results) => {
      if (error) throw error;
      console.log('Compositions fetched successfully');
      let compositions = {
        equipments: parse(results[0]),
        muscles: parse(results[1]),
        exercises: parse(results[2])
      }
      res.json(compositions)
    })
})

// ------------------------------------------------------------- //
// GET ALL COMPOSITES
router.get('/get/composites', async (req, res) => {
  const { uid } = req.query
  pool.query(`
    SELECT exco.exco_id, exco.name FROM exco WHERE uid = ${_(uid)};
    SELECT woco.woco_id, woco.name FROM woco WHERE uid = ${_(uid)};
    SELECT circ.circ_id, circ.name FROM circ WHERE uid = ${_(uid)};
    `,
    (error, results) => {
      if (error) throw error;
      console.log('Composites fetched successfully');
      let composites = {
        exercises: results[0],
        workouts: results[1],
        circuits: results[2]
      }
      res.json(composites)
    })
})

module.exports = router