const router = require('express').Router()
let Entry = require('../models/entry.model.js')
const cors = require('cors')

var whitelist = ['http://localhost:3000', 'https://disarray.kylecaprio.dev']
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}
router.use(cors(corsOptions), (req, res, next) => {
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, PATCH, DELETE");
    return res.status(200).json({});
  }
  next();
});

router.get('/', (req, res) => {
  Entry.find()
    .then(entries => res.json(entries))
    .catch(err => res.status(400).json('Error: ' + err))
})

router.post('/update', async (req, res) => {
  let name = req.body.name
  let time = req.body.time
  let seconds = req.body.seconds
  let ip = req.body.ip
  let location = req.body.location
  try {
    let current = await Entry.findOne({ name: name })
    console.log(current);
    if (current.seconds < seconds) {
      time = current.time
      seconds = current.seconds
    }
    let doc = await Entry.findOneAndUpdate({ name: name }, { time: time, seconds: seconds, ip: ip, location: location });
    doc = await Entry.findOne({ name: name });
    console.log(doc);
    res.status(200).json('Entry edit successful')
  } catch (error) {
    console.log('No user by that name.')
    const newEntry = new Entry({ name, time, seconds, ip, location })
    newEntry
      .save()
      .then(() => res.json('Entry created.'))
      .catch(err => res.status(400).json('Error: ' + err))
  }
})

module.exports = router