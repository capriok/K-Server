const express = require('express')
const mongoose = require('mongoose')
const serverless = require("serverless-http");
require('dotenv').config()

const app = express()

const port = process.env.PORT || 9000
app.listen(port, () => console.log(`Server running on port: ${port}`))

app.use(express.json())

//CONNECT TO MONGODB
const uri =
  'mongodb+srv://Tooky:Californeyea7*@cluster0-fatnt.mongodb.net/test?retryWrites=true&w=majority'
mongoose.connect(uri, { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true })
mongoose.set('useFindAndModify', false);
const connection = mongoose.connection
connection.once('open', () => console.log('MongoDB connected successfully'))

//LEADERBOARD ENTRY ROUTE
const leaderboardRouter = require('./routes/leaderboardEntry')
app.use('/.netlify/functions/server/leaderboard', leaderboardRouter)

//API ROUTES
const SQLiftingRouter = require('./routes/sqlifting-api')
app.use('/.netlify/functions/server/api', SQLiftingRouter)

// SQLifting Login / Sign up
const SQLiftingAccRouter = require('./routes/sqlifting-account.js')
app.use('/.netlify/functions/server/sqlifting', SQLiftingAccRouter)


//EXPORTS
module.exports = app;
module.exports.handler = serverless(app);
