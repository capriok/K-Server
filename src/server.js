const express = require('express')
const cors = require('cors')
require('dotenv').config
const mongoose = require('mongoose')
const serverless = require("serverless-http");

const app = express()

const port = process.env.PORT
app.listen(port, () => console.log(`Server running on port: ${port}`))

console.log = () => { }

app.use(cors())
app.use(express.json())

//CONNECT TO MONGODB
const uri =
  'mongodb+srv://Tooky:Californeyea7*@cluster0-fatnt.mongodb.net/test?retryWrites=true&w=majority'
mongoose.connect(uri, { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true })
mongoose.set('useFindAndModify', false);
const connection = mongoose.connection
connection.once('open', () => console.log('MongoDB connected successfully'))

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, PATCH, DELETE')
    return res.status(200).json({})
  }
  next()
})

//LEADERBOARD ENTRY ROUTES
const leaderboardRouter = require('./routes/leaderboardEntry')
app.use('/.netlify/functions/server/leaderboard', leaderboardRouter)


//LIFTYPAL ROUTES
const liftypalRouter = require('./routes/liftypal')
app.use('/.netlify/functions/server/api/', liftypalRouter)


//EXPORTS
module.exports = app;
module.exports.handler = serverless(app);
