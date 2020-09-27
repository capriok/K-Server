const express = require('express')
const serverless = require("serverless-http");
const mongo = require('./database/mongodb')
const mysql = require('./database/mysqldb')
require('dotenv').config()

const app = express()
const port = process.env.PORT || 9000

app.listen(port, () => console.log(`Server running on port ${port}`))
mongo.once('open', () => console.log('MongoDB connected successfully'))
mysql.connect(() => console.log('MySQL connected successfully'))

app.use(express.json())

//Disarray Leaderboard Entry Route
const leaderboardRouter = require('./routes/Disarray/leaderboard')
app.use('/.netlify/functions/server/leaderboard', leaderboardRouter)

//API Routes
const SQLiftingRouter = require('./routes/SQLifting/api')
app.use('/.netlify/functions/server/sqlifting/api', SQLiftingRouter)

// SQLifting Login / Register
const SQLiftingAccRouter = require('./routes//SQLifting/account.js')
app.use('/.netlify/functions/server/sqlifting', SQLiftingAccRouter)

//Personal Portfolio Email Dispatch Route
const PortfolioEmailRouter = require('./routes/Portfolio/email.js')
app.use('/.netlify/functions/server/portfolioemail', PortfolioEmailRouter)

//Keith Phillingane LLC Client Email Dispatch Route
const KPClientEmailRouter = require('./routes/KP-Construction/email.js');
app.use('/.netlify/functions/server/kpclientemail', KPClientEmailRouter)

//EXPORTS
module.exports = app;
module.exports.handler = serverless(app);
