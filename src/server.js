const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const serverless = require("serverless-http");
require('dotenv').config()

const app = express()

const port = process.env.PORT || 9000
app.listen(port, () => console.log(`Server running on port: ${port}`))

app.use(express.json())

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

app.options('*', cors(corsOptions))

//CONNECT TO MONGODB
const uri =
  'mongodb+srv://Tooky:Californeyea7*@cluster0-fatnt.mongodb.net/test?retryWrites=true&w=majority'
mongoose.connect(uri, { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true })
mongoose.set('useFindAndModify', false);
const connection = mongoose.connection
connection.once('open', () => console.log('MongoDB connected successfully'))

// app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', '*')
//   res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   if (req.method === 'OPTIONS') {
//     res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, PATCH, DELETE')
//     return res.status(200).json({})
//   }
//   next()
// })

//LEADERBOARD ENTRY ROUTE
const leaderboardRouter = require('./routes/leaderboardEntry')
app.use('/.netlify/functions/server/leaderboard', leaderboardRouter)

//API ROUTES
const SQLiftingRouter = require('./routes/sqlifting')
app.use('/.netlify/functions/server/api', SQLiftingRouter)

//EXPORTS
module.exports = app;
module.exports.handler = serverless(app);