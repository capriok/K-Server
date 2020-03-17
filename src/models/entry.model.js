const mongoose = require('mongoose')

const Schema = mongoose.Schema

const entrySchema = new Schema({
  name: {
    type: String,
    trim: true
  },
  time: {
    type: String,
    trim: true
  },
  seconds: {
    type: Number,
    trim: true
  },
  ip: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
})

const Entry = mongoose.model('Entry', entrySchema)

module.exports = Entry