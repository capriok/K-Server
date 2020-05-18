const router = require('express').Router();
const pool = require("../database/sqlifting-db");
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

// ------------------------------------------------------------- //
// SELECT * FROM ALL
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
// ------------------------------------------------------------- //
// ------------------------------------------------------------- //
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
router.get('/get/equipment', async (req, res) => {
  const { user_id } = req.query
  try {
    const getEquipment = await pool.query(
      "SELECT equipment FROM database WHERE equipment IS NOT NULL AND user_id = $1", [user_id]
    )
    parseDatabaseResponse(res, getEquipment, 'equipment')
  } catch (error) {
    console.error(error.message)
  }
})
router.get('/get/muscles', async (req, res) => {
  const { user_id } = req.query
  try {
    const getMuscle = await pool.query(
      "SELECT muscle FROM database WHERE muscle IS NOT NULL AND user_id = $1", [user_id]
    )
    parseDatabaseResponse(res, getMuscle, 'muscle')
  } catch (error) {
    console.error(error.message)
  }
})
router.get('/get/exercises', async (req, res) => {
  const { user_id } = req.query
  try {
    const getExercise = await pool.query(
      "SELECT exercise FROM database WHERE exercise IS NOT NULL AND user_id = $1", [user_id]
    )
    parseDatabaseResponse(res, getExercise, 'exercise')
  } catch (error) {
    console.error(error.message)
  }
})
// ------------------------------------------------------------- //
// INSERT INTO DATABASE TABLE
router.post('/post/equipmentdata', async (req, res) => {
  const { user_id, equipment } = req.body
  try {
    const postEquipment = await pool.query(
      "INSERT INTO database (user_id, equipment) VALUES ($1, $2)", [user_id, equipment]
    )
    res.status(200).json(postEquipment.rows)
  } catch (error) {
    console.error(error.message)
  }
})
router.post('/post/muscledata', async (req, res) => {
  const { user_id, muscle } = req.body
  try {
    const postMuscles = await pool.query(
      "INSERT INTO database (user_id, muscle) VALUES ($1, $2)", [user_id, muscle]
    )
    res.status(200).json(postMuscles.rows)
  } catch (error) {
    console.error(error.message)
  }
})
router.post('/post/exercisedata', async (req, res) => {
  const { user_id, exercise } = req.body
  try {
    const postExercise = await pool.query(
      "INSERT INTO database (user_id, exercise) VALUES ($1, $2)", [user_id, exercise]
    )
    res.status(200).json(postExercise.rows)
  } catch (error) {
    console.error(error.message)
  }
})
// ------------------------------------------------------------- //
// DELETE FROM DATABASE TABLE
router.post('/delete/fromdatabase', async (req, res) => {
  const { user_id, column, row } = req.body
  try {
    const database = await pool.query(
      `DELETE FROM database WHERE user_id = $1 AND ${column}= $2`, [user_id, row]
    )
    console.log('deleted', row, 'from', column, 'column of user', user_id);
    res.status(200).json(database)
  } catch (error) {
    console.error(error.message)
  }
})
// ------------------------------------------------------------- //
// ------------------------------------------------------------- //
// ------------------------------------------------------------- //
// ------------------------------------------------------------- //
// SELECT FROM EXERCISES TABLE
router.get('/get/builtexercises', async (req, res) => {
  const { user_id } = req.query
  try {
    const getExercise = await pool.query(
      "SELECT * FROM exercises WHERE user_id = $1", [user_id]
    )
    res.status(200).json(getExercise.rows)
  } catch (error) {
    console.error(error.message)
  }
})
// ------------------------------------------------------------- //
// INSERT INTO EXERCISES TABLE
router.post('/post/builtexercise', async (req, res) => {
  const { user_id, name, equipment, muscle, exercise } = req.body
  try {
    const postExercises = await pool.query(
      "INSERT INTO exercises (user_id, name, equipment, muscle, exercise) VALUES ($1, $2, $3, $4, $5)"
      , [user_id, name, equipment, muscle, exercise]
    )
    res.status(200).json(postExercises.rows)
  } catch (error) {
    console.error(error.message)
  }
})
// ------------------------------------------------------------- //
// DELETE FROM EXERCISE TABLE
router.post('/delete/frombuiltexercises', async (req, res) => {
  const { user_id, column, row } = req.body
  try {
    const exercises = await pool.query(
      `DELETE FROM exercises WHERE user_id = $1 AND ${column}= $2`, [user_id, row]
    )
    console.log('deleted', row, 'from', column, 'column of user', user_id);
    res.status(200).json(exercises)
  } catch (error) {
    console.error(error.message)
  }
})
// ------------------------------------------------------------- //
// ------------------------------------------------------------- //
// ------------------------------------------------------------- //
// ------------------------------------------------------------- //
// SELECT FROM WORKOUTS TABLE
router.get('/get/builtworkouts', async (req, res) => {
  const { user_id } = req.query
  try {
    const getWorkouts = await pool.query(
      "SELECT * FROM workouts WHERE user_id = $1", [user_id]
    )
    res.status(200).json(getWorkouts.rows)
  } catch (error) {
    console.error(error.message)
  }
})
// ------------------------------------------------------------- //
// INSERT INTO WORKOUTS TABLE
router.post('/post/builtworkouts', async (req, res) => {
  const { user_id, name, workout } = req.body
  try {
    const postWorkout = await pool.query(
      "INSERT INTO workouts (user_id, name, workout) VALUES ($1, $2, $3)"
      , [user_id, name, JSON.stringify(workout)]
    )
    res.status(200).json(postWorkout.rows)
  } catch (error) {
    console.error(error.message)
  }
})
// ------------------------------------------------------------- //
// DELETE FROM EXERCISE TABLE
router.post('/delete/frombuiltworkouts', async (req, res) => {
  const { user_id, column, row } = req.body
  try {
    const workouts = await pool.query(
      `DELETE FROM workouts WHERE user_id = $1 AND ${column}= $2`, [user_id, row]
    )
    console.log('deleted', row, 'from', column, 'column of user', user_id);
    res.status(200).json(workouts)
  } catch (error) {
    console.error(error.message)
  }
})
module.exports = router