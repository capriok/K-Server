const express = require('express')
const serverless = require("serverless-http");
const mongo = require('./database/mongodb')
const mysql = require('./database/mysqldb')
require('dotenv').config()

const app = express()
const port = process.env.PORT || 9000

app.listen(port, () => console.log(`Server running on port ${port}`))
// mongo.once('open', () => console.log('MongoDB connected successfully'))
mysql.connect(() => console.log('MySQL connected successfully'))

app.use(express.json())


let netlifyEndpoint = '/.netlify/functions/server'

// -------------------------------------
// 			DISARRAY | LEADERBOARD ENTRY
// -------------------------------------
const leaderboardRouter = require('./routes/DisArray/leaderboard')
app.use(`${netlifyEndpoint}/leaderboard`, leaderboardRouter)

// -------------------------------------
// 			SQLIFTING | DATA API 
// -------------------------------------
const SQLiftingRouter = require('./routes/SQLifting/api')
app.use(`${netlifyEndpoint}/sqlifting/api`, SQLiftingRouter)

// -------------------------------------
// 			SQLIFTING | ACCOUNT API
// -------------------------------------
const SQLiftingAccRouter = require('./routes/SQLifting/acc.js')
app.use(`${netlifyEndpoint}/sqlifting/acc`, SQLiftingAccRouter)

// -------------------------------------
// 			PERSONAL PORTFOLIO | CLIENT EMAIL
// -------------------------------------
const PortfolioEmailRouter = require('./routes/Portfolio/email.js')
app.use(`${netlifyEndpoint}/portfolioemail`, PortfolioEmailRouter)

// -------------------------------------
// 			KEITH PHILLINGANE LLC | CLIENT EMAIL
// -------------------------------------
const KPClientEmailRouter = require('./routes/KP-Construction/email.js');
app.use(`${netlifyEndpoint}/kpclientemail`, KPClientEmailRouter)

module.exports = app;
module.exports.handler = serverless(app);
