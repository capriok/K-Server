const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const serverless = require("serverless-http");

const app = express()

// DEV PORT SPECIFICATION
// const port = process.env.PORT || 9000
// app.listen(port, () => console.log(`Server running on port: ${port}`))

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

//ROUTER
const router = express.Router();

//ENTRY ROUTES
let Entry = require('./models/entry.model.js')
app.use('/.netlify/functions/server', router)

router.route('/').get((req, res) => {
  Entry.find()
    .then(entries => res.json(entries))
    .catch(err => res.status(400).json('Error: ' + err))
})

router.route('/update').post(async (req, res) => {
  let name = req.body.name
  let time = req.body.time
  let seconds = req.body.seconds
  try {
    let current = await Entry.findOne({ name: name })
    console.log(current);
    if (current.seconds < seconds) {
      time = current.time
      seconds = current.seconds
    }
    let doc = await Entry.findOneAndUpdate({ name: name }, { time: time, seconds: seconds });
    doc = await Entry.findOne({ name: name });
    console.log(doc);
    res.status(200).json('Edit Successful')
  } catch (error) {
    console.log('No user by that name.')
    const newEntry = new Entry({ name, time, seconds })
    newEntry
      .save()
      .then(() => res.json('Entry created.'))
      .catch(err => res.status(400).json('Error: ' + err))
  }
})

//EXPORTS
module.exports = app;
module.exports.handler = serverless(app);
