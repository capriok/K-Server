const router = require('express').Router();
const axios = require('axios')

// RESOURCE https://wger.de/en/software/api

const header = { Authorization: `Token ${process.env.API_KEY}` }
const wgerFetch = axios.create({ baseURL: 'https://wger.de/api/v2/', headers: header })

const logAndSend = (res, response) => {
  res.json(response.data)
  console.log(response.data)
}

router.route('/muscle').get(async (req, res) => {
  await wgerFetch
    .get('/muscle')
    .then(response => logAndSend(res, response))
    .catch(err => console.log(err))
})

router.route('/exercise').get(async (req, res) => {
  await wgerFetch
    .get('/exercise')
    .then(response => logAndSend(res, response))
    .catch(err => console.log(err))
})

router.route('/exerciseinfo').get(async (req, res) => {
  await wgerFetch
    .get('/exerciseinfo')
    .then(response => logAndSend(res, response))
    .catch(err => console.log(err))
})

router.route('/exercisecategory').get(async (req, res) => {
  await wgerFetch
    .get('/exercisecategory')
    .then(response => logAndSend(res, response))
    .catch(err => console.log(err))
})

router.route('/exerciseimage').get(async (req, res) => {
  await wgerFetch
    .get('/exerciseimage')
    .then(response => logAndSend(res, response))
    .catch(err => console.log(err))
})

router.route('/equipment').get(async (req, res) => {
  await wgerFetch
    .get('/equipment')
    .then(response => logAndSend(res, response))
    .catch(err => console.log(err))
})

router.route('/language').get(async (req, res) => {
  await wgerFetch
    .get('/language')
    .then(response => logAndSend(res, response))
    .catch(err => console.log(err))
})

module.exports = router