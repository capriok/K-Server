const router = require('express').Router()
const axios = require('axios')
const API_KEY = process.env.API_KEY

// RESOURCE https://wger.de/en/software/api

const header = { Authorization: `Token ${API_KEY}` }

const pal = axios.create({
  baseURL: 'https://wger.de/api/v2/',
  headers: header
})

router.route('/muscle').get(async (req, res) => {
  console.log('fired');

  // await pal
  //   .get('/muscle', header)
  //   .then(response => res.send(response.data))
  //   .catch(err => console.log(err))
})

router.route('/exercise').get(async (req, res) => {
  await pal
    .get('/exercise', header)
    .then(response => res.send(response.data))
    .catch(err => console.log(err))
})

router.route('/exerciseinfo').get(async (req, res) => {
  await pal
    .get('/exerciseinfo', header)
    .then(response => res.send(response.data))
    .catch(err => console.log(err))
})

router.route('/exercisecategory').get(async (req, res) => {
  await pal
    .get('/exercisecategory', header)
    .then(response => res.send(response.data))
    .catch(err => console.log(err))
})

router.route('/exerciseimage').get(async (req, res) => {
  await pal
    .get('/exerciseimage', header)
    .then(response => res.send(response.data))
    .catch(err => console.log(err))
})

router.route('/equipment').get(async (req, res) => {
  await pal
    .get('/equipment', header)
    .then(response => res.send(response.data))
    .catch(err => console.log(err))
})

router.route('/language').get(async (req, res) => {
  await pal
    .get('/language', header)
    .then(response => res.send(response.data))
    .catch(err => console.log(err))
})

module.exports = router