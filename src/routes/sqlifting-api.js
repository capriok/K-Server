const router = require('express').Router();
const pool = require("../database/mysqldb");
const mysql = require('mysql');
const { cors, corsOptions } = require('../cors/cors');
var whitelist = ['http://localhost:3000', 'https://sqlifting.netlify.app', 'https://sqlifting.kylecaprio.dev']

router.use(cors(corsOptions(whitelist)), (req, res, next) => {
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, PATCH, DELETE");
    return res.status(200).json({});
  }
  next();
});

const _ = mysql.format

const composeQuery = (req, statements) => {
  let query = []
  req.forEach(s => query.push(statements[s]))
  return query.toString().replace(/,SELECT/g, 'SELECT')
}


const composeResult = (req, res) => {
  let obj = {}
  req.forEach((t, i) => {
    req.length === 1 ? obj[t] = res : obj[t] = res[i]
  })
  return obj
}

// ------------------------------------------------------------- //
// GET COMPOSITIONS BASED ON REQUESTS PASSED IN
router.get('/get/compositions', async (req, res) => {
  const { uid, requests } = req.query
  const statements = {
    equipments: `SELECT eq.eq_id id, eq.name FROM equipment eq WHERE uid = ${_(uid)};`,
    muscles: `SELECT mu.mu_id id, mu.name FROM muscle mu WHERE uid = ${_(uid)};`,
    exercises: `SELECT ex.ex_id id, ex.name FROM exercise ex WHERE uid = ${_(uid)};`,
    movements: `SELECT mo.mo_id id, mo.name FROM movement mo WHERE uid = ${_(uid)};`
  }
  const query = composeQuery(requests, statements)
  pool.query(query,
    (error, results) => {
      if (error) console.log(error)
      const finalResults = composeResult(requests, results)
      console.log('Compositions fetched successfully');
      res.json(finalResults)
    })
})


// ------------------------------------------------------------- //
// GET COMPOSITES BASED ON REQUESTS PASSED IN
router.get('/get/composites', async (req, res) => {
  const { uid, requests } = req.query
  const statements = {
    circs: `SELECT circ.circ_id id, circ.name FROM circ WHERE uid = ${_(uid)};`,
    excos: `SELECT exco.exco_id id, exco.name FROM exco WHERE uid = ${_(uid)};`,
    wocos: `SELECT woco.woco_id id, woco.name FROM woco WHERE uid = ${_(uid)};`
  }
  const query = composeQuery(requests, statements)
  pool.query(query,
    (error, results) => {
      if (error) console.log(error)
      const finalResults = composeResult(requests, results)
      console.log('Composites fetched successfully');
      res.json(finalResults)
    })
})


// ------------------------------------------------------------- //
// GET WOCO_EXCOS FOR EACH WOCO
router.get('/get/woco_excos', async (req, res) => {
  const { woco_id } = req.query
  pool.query(`SELECT a.sets, a.reps, a.weight, b.name, eq.name equipment, mu.name muscle, ex.name exercise
              FROM woco_excos a
              JOIN exco b ON a.exco_id = b.exco_id
              AND a.woco_id = ${ _(woco_id)}
              INNER JOIN muscle mu ON b.mu_id = mu.mu_id
              INNER JOIN exercise ex ON b.ex_id = ex.ex_id
              INNER JOIN equipment eq ON b.eq_id = eq.eq_id;`,
    (error, result) => {
      if (error) console.log(error)
      console.log('Woco_excos successfully attached for woco ', woco_id);
      res.json(result)
    })
})


// ------------------------------------------------------------- //
// INSERT INTO (composition table) with name and uid
router.post('/post/composition', async (req, res) => {
  const { table, name, uid } = req.body
  pool.query(`
    INSERT INTO ${table} (name, uid)
    VALUES ('${name}', '${uid}');
    `,
    (error, results) => {
      if (error) console.log(error)
      console.log(`Record successfully inserted into ${table} (${name})`);
      res.json(results)
    })
})


// ------------------------------------------------------------- //
// DELTE FROM table BY id
router.post('/delete/byid', async (req, res) => {
  const { table, id } = req.body
  let tableId
  if (table === 'circ' || table === 'exco' || table === 'woco') {
    tableId = table.substring(0, 4).concat('_id')
  } else {
    tableId = table.substring(0, 2).concat('_id')
  }

  pool.query(`
    DELETE FROM ${_(table)} WHERE ${_(tableId)} = ${_(id)};
    `,
    (error, results) => {
      if (error) console.log(error)
      console.log(`Record successfully deleted from ${table} (${id})`);
      res.json(results)
    })
})


// ------------------------------------------------------------- //
// INSERT INTO exco with name, uid, eq_id, mu_id, ex_id
router.post('/post/exco', async (req, res) => {
  const { name, uid, eq_id, mu_id, ex_id } = req.body

  pool.query(`
    INSERT INTO exco (name, uid, eq_id, mu_id, ex_id)
    VALUES ('${_(name)}', '${_(uid)}', '${_(eq_id)}', '${_(mu_id)}', '${_(ex_id)}');
    `,
    (error, results) => {
      if (error) console.log(error)
      console.log(`Record successfully inserted`);
      res.json(results)
    })
})


// ------------------------------------------------------------- //
// INSERT INTO woco with name and uid
// INSERT INTO woco with woco_id, exco_id, reps, sets, weight
router.post('/post/woco', async (req, res) => {
  const { name, id: woco_id, uid, woco_excos } = req.body
  pool.query(`
    INSERT INTO woco (name, uid)
    VALUES ('${_(name)}', '${_(uid)}');
    `,
    (error, results) => {
      if (error) console.log(error)
      console.log(`Record successfully inserted (woco)`);
      woco_excos.forEach(({ id: exco_id, sets, reps, weight }) => {
        pool.query(`
          INSERT INTO woco_excos (woco_id, exco_id, sets, reps, weight)
          VALUES ('${_(woco_id)}', '${_(exco_id)}', '${_(sets)}', '${_(reps)}', '${_(weight)}');
          `,
          (error, results) => {
            if (error) console.log(error)
            console.log(`Record successfully inserted (woco_exco)`);
          })
      });
      res.json(results)
    })
})


module.exports = router