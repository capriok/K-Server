const Pool = require("pg").Pool;
const HOST = process.env.HOST
const PASSWORD = process.env.PASSWORD

const pool = new Pool({
  user: 'postgres',
  password: PASSWORD,
  database: 'sqlifting',
  host: HOST,
  port: 5432
});

module.exports = pool;


// const pool = require("./sqlifting-db");

// app.get('/exercises', async (req, res) => {
//   try {
//     const allExercises = await pool.query("SELECT * FROM exercises")
//     res.json(allExercises.rows)
//   } catch (error) {
//     console.error(error.message)
//   }
// })
