const router = require('express').Router();
const pool = require("../database/postgresdb");
const jwt = require('jsonwebtoken')
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

// console.log(jwt);

// const auth = async (req, res, next) => {
//   const token = req.cookies.access_token;

//   console.log("cookies", token);

//   try {
//     const userAuth = jwt.verify(token, SECRET);
//     res.user = userAuth;
//   } catch (error) {
//     res.status(400);
//     throw error;
//   }
//   next();
//   res.status(200);
// };

// SIGN UP
router.post('/register', async (req, res) => {
  try {
    const { username } = req.body;
    const { password } = req.body;
    console.log(username, password);
    const existingUsers = await pool.query("SELECT * FROM users")
    let isUser = false
    existingUsers.rows.forEach((user) => {
      if (user.username === username) isUser = true
    })
    if (isUser) {
      res.status(403).end()
    } else {
      await pool.query(
        "INSERT INTO users (username, password) VALUES($1,$2)",
        [username, password]
      );
      res.status(200).send("Account created");
      console.table(existingUsers.rows)
    }
  } catch (err) {
    console.error(err.message);
    res.end()
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { username } = req.body;
    const { password } = req.body;
    const existingUsers = await pool.query(
      "SELECT * FROM users WHERE username = $1 AND password = $2",
      [username, password]
    );
    if (!existingUsers.rows[0]) {
      console.log('Username ->', username);
      console.log('Password ->', password);
    } else {
      console.log('Username found');
      console.table(existingUsers.rows)
    }
    const matchedUser = existingUsers.rows[0];
    if (!matchedUser) {
      res.status(409).end()
      console.log('Username not found');
    } else {
      const user = {
        username: username,
        user_id: matchedUser.user_id,
      };

      const token = jwt.sign(user, process.env.SECRET);
      res.status(200).send({ user, token });
    }
  } catch (error) {
    console.log(error);
    res.end()
  }
});

module.exports = router