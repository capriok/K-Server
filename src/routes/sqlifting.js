const router = require('express').Router();
const pool = require("../database/sqlifting-db");
const cors = require('cors')

var whitelist = ['http://localhost:3000', 'https://sqlifting.netlify.app']
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

router.use(cors(corsOptions), (req, res, next) => {
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, PATCH, DELETE");
    return res.status(200).json({});
  }
  next();
});

// ------------------------------------------------------------- //
// SELECT * FROM _____
router.get('/', async (req, res) => {
  try {
    const allDatabase = await pool.query("SELECT * FROM database")
    const allExercises = await pool.query("SELECT * FROM exercises")
    const allEquipment = await pool.query("SELECT * FROM workouts")
    res.json(allDatabase.rows)
    res.json(allExercises.rows)
    res.json(allEquipment.rows)
  } catch (error) {
    console.error(error.message)
  }
})

// ------------------------------------------------------------- //
// SELECT FROM DATABASE TABLE
const parseDatabaseResponse = (res, payload, type) => {
  const data = payload.rows
  const reOrderDataProperties = data.map((item, i) => {
    return {
      id: i + 1,
      name: item[type]
    }
  })
  return res.status(200).json(reOrderDataProperties)
}
router.get('/get/muscles', async (req, res) => {
  try {
    const getMuscle = await pool.query(
      "SELECT muscle FROM database WHERE muscle IS NOT NULL"
    )
    parseDatabaseResponse(res, getMuscle, 'muscle')
  } catch (error) {
    console.error(error.message)
  }
})
router.get('/get/exercises', async (req, res) => {
  try {
    const getExercise = await pool.query(
      "SELECT exercise FROM database WHERE exercise IS NOT NULL"
    )
    parseDatabaseResponse(res, getExercise, 'exercise')
  } catch (error) {
    console.error(error.message)
  }
})
router.get('/get/equipment', async (req, res) => {
  try {
    const getEquipment = await pool.query(
      "SELECT equipment FROM database WHERE equipment IS NOT NULL"
    )
    parseDatabaseResponse(res, getEquipment, 'equipment')
  } catch (error) {
    console.error(error.message)
  }
})

// ------------------------------------------------------------- //
// INSERT INTO DATABASE TABLE
router.post('/post/muscledata', async (req, res) => {
  const { muscle } = req.body
  try {
    const postMuscles = await pool.query(
      "INSERT INTO database (muscle) VALUES ($1)", [muscle]
    )
    res.status(200).json(postMuscles.rows)
  } catch (error) {
    console.error(error.message)
  }
})
router.post('/post/exercisedata', async (req, res) => {
  const { exercise } = req.body
  try {
    const postExercise = await pool.query(
      "INSERT INTO database (exercise) VALUES ($1)", [exercise]
    )
    res.status(200).json(postExercise.rows)
  } catch (error) {
    console.error(error.message)
  }
})
router.post('/post/equipmentdata', async (req, res) => {
  const { equipment } = req.body
  try {
    const postEquipment = await pool.query(
      "INSERT INTO database (equipment) VALUES ($1)", [equipment]
    )
    res.status(200).json(postEquipment.rows)
  } catch (error) {
    console.error(error.message)
  }
})
// ------------------------------------------------------------- //
// DELETE FROM DATABASE TABLE
router.post('/delete/fromdatabase', async (req, res) => {
  const { column, row } = req.body
  console.log(column);
  console.log(row);
  try {
    const database = await pool.query(
      `DELETE FROM database WHERE ${column} = $1`, [row]
    )
    console.log('deleted', row, 'from', column, 'column');
    res.status(200).json(database)
  } catch (error) {
    console.error(error.message)
  }
})

// ------------------------------------------------------------- //
// SELECT FROM EXERCISES TABLE
router.get('/get/builtexercises', async (req, res) => {
  try {
    const getExercise = await pool.query(
      "SELECT * FROM exercises"
    )
    res.status(200).json(getExercise.rows)
  } catch (error) {
    console.error(error.message)
  }
})

// ------------------------------------------------------------- //
// INSERT INTO EXERCISES TABLE
router.post('/post/builtexercise', async (req, res) => {
  const { name, equipment, muscle, exercise } = req.body
  try {
    const postExercises = await pool.query(
      "INSERT INTO exercises (name, equipment, muscle, exercise) VALUES ($1, $2, $3, $4)"
      , [name, equipment, muscle, exercise]
    )
    res.status(200).json(postExercises.rows)
  } catch (error) {
    console.error(error.message)
  }
})

// ------------------------------------------------------------- //
// SELECT FROM WORKOUTS TABLE
router.get('/get/builtworkouts', async (req, res) => {
  try {
    const getWorkouts = await pool.query(
      "SELECT * FROM workouts"
    )
    res.status(200).json(getWorkouts.rows)
  } catch (error) {
    console.error(error.message)
  }
})

// ------------------------------------------------------------- //
// INSERT INTO WORKOUTS TABLE
router.post('/post/builtworkouts', async (req, res) => {
  const { name, workout } = req.body
  try {
    const postWorkout = await pool.query(
      "INSERT INTO workouts (name, workout) VALUES ($1, $2)"
      , [name, JSON.stringify(workout)]
    )
    res.status(200).json(postWorkout.rows)
  } catch (error) {
    console.error(error.message)
  }
})

module.exports = router