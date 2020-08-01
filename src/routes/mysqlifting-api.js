const router = require('express').Router();
const pool = require("../database/mysqldb");
const mysql = require('mysql');
const { cors, corsOptions } = require('../cors/cors');
const { route } = require('./leaderboardEntry');
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

const processTables = (tables, statements) => {
  let query = []
  if (tables === undefined) {
    Object.keys(statements).forEach(s => query.push(statements[s]))
  } else {
    tables.forEach(s => query.push(statements[s]))
  }
  return query.toString().replace(/,SELECT/g, 'SELECT')
}

const composeResult = (type, tables, res) => {
  let obj = {}
  if (tables === undefined) {
    if (type === 'compositions') {
      obj = {
        equipments: res[0],
        muscles: res[1],
        exercises: res[2],
        movements: res[3]
      }
    } else {
      obj = {
        circs: res[0],
        excos: res[1],
        wocos: res[2]
      }
    }
  } else if (tables.length === 1) {
    tables.forEach((t) => {
      obj[t] = res
    })
  } else {
    tables.forEach((t, i) => {
      obj[t] = res[i]
    })
  }
  return obj
}

// ------------------------------------------------------------- //
// GET ALL COMPOSITIONS
router.get('/get/compositions', async (req, res) => {
  const { uid, tables } = req.query
  const statements = {
    equipments: `SELECT eq.eq_id id, eq.name FROM equipment eq WHERE uid = ${_(uid)};`,
    muscles: `SELECT mu.mu_id id, mu.name FROM muscle mu WHERE uid = ${_(uid)};`,
    exercises: `SELECT ex.ex_id id, ex.name FROM exercise ex WHERE uid = ${_(uid)};`,
    movements: `SELECT mo.mo_id id, mo.name FROM movement mo WHERE uid = ${_(uid)};`
  }
  const query = processTables(tables, statements)
  pool.query(query,
    (error, results) => {
      if (error) console.log(error)
      console.log('Compositions fetched successfully');
      const finalResults = composeResult('compositions', tables, results)
      res.json(finalResults)
    })
})

// ------------------------------------------------------------- //
// GET ALL COMPOSITES
router.get('/get/composites', async (req, res) => {
  const { uid, tables } = req.query
  const statements = {
    circs: `SELECT circ.circ_id id, circ.name FROM circ WHERE uid = ${_(uid)};`,
    excos: `SELECT exco.exco_id id, exco.name FROM exco WHERE uid = ${_(uid)};`,
    wocos: `SELECT woco.woco_id id, woco.name FROM woco WHERE uid = ${_(uid)};`
  }
  const query = processTables(tables, statements)
  pool.query(query,
    (error, results) => {
      if (error) console.log(error)
      console.log('Composites fetched successfully');
      const finalResults = composeResult('composites', tables, results)
      res.json(finalResults)
    })
})

// ------------------------------------------------------------- //
// GET ALL COMPOSITES
router.get('/get/woco_excos', async (req, res) => {
  const { uid, id: woco_id } = req.query
  pool.query(`
  SELECT exco.name, sets, reps, weight FROM woco 
  JOIN woco_excos 
  ON woco.uid = ${_(uid)} 
  AND woco.woco_id = ${_(woco_id)} 
  AND woco.woco_id = woco_excos.woco_id
  JOIN exco USING (exco_id);
  `,
    (error, results) => {
      if (error) console.log(error)
      console.log(results);
      res.json(results)
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
  const { name, woco_id, uid, woco_excos } = req.body
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