const mongoose = require('mongoose')
require('dotenv').config()
const USER = process.env.MONGOUSER
const PASS = process.env.MONGOPASS

const uri =
  `mongodb+srv://${USER}:${PASS}@cluster0-fatnt.mongodb.net/test?retryWrites=true&w=majority`
mongoose.connect(uri, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true
})
mongoose.set('useFindAndModify', false);
const mongo = mongoose.connection

module.exports = mongo