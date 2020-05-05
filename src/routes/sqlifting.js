const router = require('express').Router();

const pool = require("../database/sqlifting-db");

// ------------------------------------------------------------- //
// SELECT * FROM _____
router.route('/').get(async (req, res) => {
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
router.route('/get/muscles').get(async (req, res) => {
  try {
    const getMuscle = await pool.query(
      "SELECT muscle FROM database WHERE muscle IS NOT NULL"
    )
    parseDatabaseResponse(res, getMuscle, 'muscle')
  } catch (error) {
    console.error(error.message)
  }
})
router.route('/get/exercises').get(async (req, res) => {
  try {
    const getExercise = await pool.query(
      "SELECT exercise FROM database WHERE exercise IS NOT NULL"
    )
    parseDatabaseResponse(res, getExercise, 'exercise')
  } catch (error) {
    console.error(error.message)
  }
})
router.route('/get/equipment').get(async (req, res) => {
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
router.route('/post/muscledata').post(async (req, res) => {
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
router.route('/post/exercisedata').post(async (req, res) => {
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
router.route('/post/equipmentdata').post(async (req, res) => {
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
router.route('/delete/fromdatabase').post(async (req, res) => {
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
router.route('/get/builtexercises').get(async (req, res) => {
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
router.route('/post/builtexercise').post(async (req, res) => {
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
router.route('/get/builtworkouts').get(async (req, res) => {
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
router.route('/post/builtworkouts').post(async (req, res) => {
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