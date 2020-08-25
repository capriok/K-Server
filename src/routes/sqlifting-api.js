const router = require('express').Router();
const DB = require("../database/mysqldb");
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


const composeResult = (req, res, group, statements) => {
  let keys = Object.keys(statements)
  let obj = {}
  req.forEach((t, i) => {
    if (req.length === 1) {
      obj[t] = res
      obj[t].forEach(j => {
        j.table = keys[keys.indexOf(t)].slice(0, -1)
        j.group = group
      })
    } else {
      obj[t] = res[i]
      obj[t].forEach(j => {
        j.table = keys[keys.indexOf(t)].slice(0, -1)
        j.group = group
      })
    }
  })
  return obj
}

const composeTableId = (table) => {
  let tableId
  if (table === 'circ' || table === 'exco' || table === 'woco') {
    tableId = table.substring(0, 4).concat('_id')
  } else {
    tableId = table.substring(0, 2).concat('_id')
  }
  return tableId
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
  DB.query(query,
    (error, results) => {
      if (error) console.log(error)
      const finalResults = composeResult(requests, results, 'compositions', statements)
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
  DB.query(query,
    (error, results) => {
      if (error) console.log(error)
      const finalResults = composeResult(requests, results, 'composites', statements)
      console.log('Composites fetched successfully');
      res.json(finalResults)
    })
})


// ------------------------------------------------------------- //
// GET COMPOSITION OCCURANCES IN COMPOSITES
router.get('/get/occurrences', async (req, res) => {
  const { table, entId } = req.query
  let tableId = table.substring(0, 2).concat('_id')
  let statements = {
    exco: `
    SELECT b.name
    FROM ${_(table)} a
    JOIN exco b
    ON a.${_(tableId)} = ${_(entId)}
    AND a.${_(tableId)} = b.${_(tableId)};`,
    circ: `
    SELECT c.name
    FROM movement a
    JOIN circ_movs b
    ON a.${_(tableId)} = ${_(entId)}
    AND a.${_(tableId)}= b.${_(tableId)}
    JOIN circ c 
    ON b.circ_id = c.circ_id;`
  }
  let query
  table !== 'movement' ? query = statements.exco : query = statements.circ
  DB.query(query,
    (error, result) => {
      if (error) console.log(error)
      console.log('Composition occurrences attached successfully');
      res.json(result)
    })
})


// ------------------------------------------------------------- //
// GET WOCO DEPS FOR EACH WOCO
router.get('/get/woco_deps', async (req, res) => {
  const { woco_id } = req.query
  DB.query(`
    SELECT a.sets, a.reps, a.weight, b.name, eq.name equipment, mu.name muscle, ex.name exercise
    FROM woco_excos a
    JOIN exco b
    ON a.exco_id = b.exco_id
    AND a.woco_id = ${ _(woco_id)}
    INNER JOIN muscle mu ON b.mu_id = mu.mu_id
    INNER JOIN exercise ex ON b.ex_id = ex.ex_id
    INNER JOIN equipment eq ON b.eq_id = eq.eq_id;
    SELECT a.circ_id  id, b.name, a.reps
    FROM woco_circs a
    JOIN circ b
    ON a.circ_id = b.circ_id
    AND a.woco_id = ${ _(woco_id)};
    `,
    (error, result) => {
      if (error) console.log(error)
      console.log('Woco deps attached successfully');
      res.json(result)
    })
})


// ------------------------------------------------------------- //
// GET EXCO DEPS FOR EACH EXCO
router.get('/get/exco_deps', async (req, res) => {
  const { exco_id } = req.query
  DB.query(`
    SELECT a.exco_id id, eq.name equipment , mu.name muscle, ex.name exercise
    FROM exco a 
    JOIN exco b
    ON a.exco_id = b.exco_id
    AND a.exco_id = ${_(exco_id)}
    INNER JOIN muscle mu ON a.mu_id = mu.mu_id
    INNER JOIN exercise ex ON a.ex_id = ex.ex_id
    INNER JOIN equipment eq ON a.eq_id = eq.eq_id;
    `,
    (error, result) => {
      if (error) console.log(error)
      console.log('Exco deps attached successfully');
      res.json(result)
    })
})


// ------------------------------------------------------------- //
// GET CIRC DEPS FOR EACH CIRC
router.get('/get/circ_deps', async (req, res) => {
  const { circ_id } = req.query
  DB.query(`
    SELECT a.circ_id  id, b.name, a.duration
    FROM circ_movs a
    JOIN movement b
    ON a.mo_id = b.mo_id
    AND a.circ_id = ${_(circ_id)};
    `,
    (error, result) => {
      if (error) console.log(error)
      console.log('Circ deps attached successfully');
      res.json(result)
    })
})


// ------------------------------------------------------------- //
// UPDATE COMPOSITION OR COMPOSITE NAME BY name 
router.post('/post/entity_edit', async (req, res) => {
  const { table, id, edit } = req.body
  let tableId = composeTableId(table)
  DB.query(`
    UPDATE ${_(table)}
    SET name = '${_(edit)}'
    WHERE ${_(tableId)} = ${_(id)};
  `,
    (error, results) => {
      if (error) console.log(error)
      console.log('Updated entity name');
      res.json(results)
    })
})


// ------------------------------------------------------------- //
// GET MAX PRIMARY KEY OF table BY tableId
router.get('/get/MAXpk', async (req, res) => {
  const { table, id: tableId } = req.query
  DB.query(`
  SELECT MAX(${_(tableId)}) id FROM ${_(table)}
  `,
    (error, results) => {
      if (error) console.log(error)
      res.json(results[0].id)
    })
})


// ------------------------------------------------------------- //
// INSERT INTO (composition table) with name and uid
router.post('/post/composition', async (req, res) => {
  const { table, name, uid } = req.body
  DB.query(`
    INSERT INTO ${_(table)} (name, uid)
    VALUES ('${_(name)}', '${_(uid)}');
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
  let tableId = composeTableId(table)
  DB.query(`
    UPDATE ${_(table)}
    SET uid = 0
    WHERE ${_(tableId)} = ${_(id)};
    `,
    (error, results) => {
      if (error) console.log(error)
      console.log(`Record successfully deleted from ${table} (${id})`);
      res.json(results)
    })
})


// ------------------------------------------------------------- //
// DELTE FROM dependency by pk id
router.post('/delete/deps', async (req, res) => {
  const { table, id } = req.body
  const tableId = table.substring(0, 4).concat('_id')
  DB.query(`
    DELETE FROM ${_(table)}
    WHERE ${_(tableId)} = ${_(id)};
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
  DB.query(`
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
  DB.query(`
    INSERT INTO woco (name, uid)
    VALUES ('${_(name)}', '${_(uid)}');
    `, (error, results) => {
    if (error) console.log(error)
    console.log(`Record successfully inserted (woco)`);
    woco_excos.forEach(({ id: exco_id, sets, reps, weight }) => {
      DB.query(`
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