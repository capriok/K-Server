const router = require('express').Router();

const client = require("../database/sqlifting-db");

router.route('/').get(async (req, res) => {
  try {
    const allExercises = await client.query("SELECT * FROM exercises")
    res.json(allExercises.rows)
  } catch (error) {
    console.error(error.message)
  }
})

// INJECT INTO DATABASE
router.route('/post/muscle').post(async (req, res) => {
  const { muscle } = req.body
  try {
    const postMuscles = await client.query(
      "INSERT INTO database (muscle) VALUES ($1)", [muscle]
    )
    res.status(200).json(postMuscles.rows)
  } catch (error) {
    console.error(error.message)
  }
})
router.route('/post/exercise').post(async (req, res) => {
  const { exercise } = req.body
  try {
    const postExercise = await client.query(
      "INSERT INTO database (exercise) VALUES ($1)", [exercise]
    )
    res.status(200).json(postExercise.rows)
  } catch (error) {
    console.error(error.message)
  }
})
router.route('/post/equipment').post(async (req, res) => {
  const { equipment } = req.body
  try {
    const postEquipment = await client.query(
      "INSERT INTO database (equipment) VALUES ($1)", [equipment]
    )
    res.status(200).json(postEquipment.rows)
  } catch (error) {
    console.error(error.message)
  }
})

// GET REQUESTS FROM DATABASE
router.route('/get/muscles').get(async (req, res) => {
  try {
    const getMuscle = await client.query(
      "SELECT muscle FROM database WHERE muscle IS NOT NULL"
    )
    const parsedData = getMuscle.rows
    parsedData.forEach((item, i) => item.id = i + 1)
    res.status(200).json(parsedData)
  } catch (error) {
    console.error(error.message)
  }
})
router.route('/get/exercises').get(async (req, res) => {
  try {
    const getExercise = await client.query(
      "SELECT exercise FROM database WHERE exercise IS NOT NULL"
    )
    const parsedData = getExercise.rows
    parsedData.forEach((item, i) => item.id = i + 1)
    res.status(200).json(parsedData)
  } catch (error) {
    console.error(error.message)
  }
})
router.route('/get/equipment').get(async (req, res) => {
  try {
    const getEquipment = await client.query(
      "SELECT equipment FROM database WHERE equipment IS NOT NULL"
    )
    const parsedData = getEquipment.rows
    parsedData.forEach((item, i) => item.id = i + 1)
    res.status(200).json(parsedData)
  } catch (error) {
    console.error(error.message)
  }
})

module.exports = router