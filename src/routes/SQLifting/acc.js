const router = require('express').Router();
const path = require('path')
const jwt = require('jsonwebtoken')
const moment = require('moment')
const queries = require('../../models/acc-queries')

// ----------------------------------------------------------------------
// 			 			CORS
// ----------------------------------------------------------------------
var whitelist = ['http://localhost:3000', 'https://sqlifting.netlify.app', 'https://sqlifting.kylecaprio.dev']
const { cors, corsOptions } = require('../../cors/cors');
router.use(cors(corsOptions(whitelist)), (req, res, next) => {
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, PATCH, DELETE");
    return res.status(200).json({});
  }
  next();
});
// ----------------------------------------------------------------------
// 			 			MULTER UPLOAD
// ----------------------------------------------------------------------
const multer = require('multer')
const storage = multer.diskStorage({
  destination: './local/user/icon',
  filename: (req, file, cb) => {
    cb(null, `uid${req.body.uid}-${path.extname(file.originalname)}`)
  }
})
const upload = multer({ storage })

// ----------------------------------------------------------------------
// 			 			GAYZO UPLOAD
// ----------------------------------------------------------------------

const Gyazo = require('gyazo-api');
const G = new Gyazo('b7850ec374055ef3470b51c1b0842adf41ce21b09debf9cfcc4cb253d0326b9f')
const GayzoUpload = (file) => {
  return new Promise((resolve, reject) => {
    G.upload(file.path)
      .then(res => {
        resolve(`https://i.gyazo.com/${res.data.image_id}${path.extname(file.originalname)}`)
      })
      .catch(err => reject(err))
  })
}


// ----------------------------------------------------------------------
// 			 			GET METHODS
// ----------------------------------------------------------------------

// ----------------------------------------------
// 			GET USER BY USERNAME, PASSWORD
// ----------------------------------------------
router.get('/user', async (req, res) => {
  const { username, password } = req.query;
  queries.get.user(username, password)
    .then(results => {
      console.log('Attempting to login...');
      const matchedUsername = results.length > 0
      if (matchedUsername) {
        console.log(`Successfully found user             uid (${results[0].uid})`);
        const user = {
          uid: results[0].uid,
          username: results[0].username
        }
        console.table(results)
        const token = jwt.sign(user, process.env.SECRET)
        console.log(`Successfully signed token           uid (${results[0].uid})`);
        res.send({ user, token })
      } else {
        console.log('Login attempt failed');
        res.status(400).end();
      }
    })
    .catch(err => console.log(err))
})

// ----------------------------------------------
// 			GET PROFILE BY UID
// ----------------------------------------------
router.get('/profile/:uid', async (req, res) => {
  const { uid } = req.params;
  queries.get.profile(uid)
    .then(results => {
      console.log(`Successfully fetched Profile Data   uid (${uid})`)
      const profile = JSON.parse(results[0].profile)
      const formattedDate = moment(profile.join_date).format('LL');
      const formattedBirthday = moment(profile.birthday).format('LL');
      let payload = {
        ...profile,
        join_date: formattedDate,
        birthday: formattedBirthday
      }
      console.log('Profile Payload', payload);
      res.json(payload)
    })
    .catch(err => console.log(err))
})

// ----------------------------------------------------------------------
// 			 			POST METHODS
// ----------------------------------------------------------------------

// ----------------------------------------------
// 			POST USER BY USERNAME, PASSWORD, DATE
// ----------------------------------------------
router.post('/user', async (req, res) => {
  const { username } = req.body;
  const { password } = req.body;
  const date = moment().format('YYYY-MM-DD');
  queries.post.user(username, password, date)
    .then(results => {
      console.log(`Successfully created user           uid (${results.insertId})`);
      queries.post.user_profile(results.insertId, '', '', null, '')
        .then(() => console.log(`Successfully created user_profile   uid (${results.insertId})`))
        .catch(err => console.log(err))

      res.send("Account created");
    })
    .catch(err => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.send('Username taken')
        }
        throw err
      } console.log(err)
    }
    )
})


// ----------------------------------------------------------------------
// 			 			UPDATE METHODS
// ----------------------------------------------------------------------

// ----------------------------------------------
// 			UPDATE NAME
// ----------------------------------------------
router.post('/updateName', async (req, res) => {
  const { name, uid } = req.body
  queries.update.name(name, uid)
    .then(results => {
      res.json(results)
    })
    .catch(err => console.log(err))
})

// ----------------------------------------------
// 			UPDATE NAME
// ----------------------------------------------
router.post('/updateProfile', upload.single('icon'), async (req, res) => {
  const file = req.file
  const { uid } = req.body

  let body = {}
  // Removes undefined values from req.body
  const reqKeys = Object.keys(req.body)
  reqKeys.forEach(key => {
    if (key !== 'uid' && key !== 'icon') {
      if (req.body[key] !== 'undefined' && req.body[key] !== '') {
        body[key] = req.body[key]
      }
    }
  })
  const values = []
  // composes values for SQL multiple update syntax
  const bodyKeys = Object.keys(body)
  bodyKeys.forEach((key, i) => {
    let value = `${i === 0 ? '' : ' '}${key} = '${body[key]}'`
    values.push(value)
  })

  if (bodyKeys.length > 0) {
    queries.update.profile(values.toString(), uid)
      .then(results => {
        console.log(`Successfully updated Profile Data   uid (${results.insertId})`)
        !file && res.json(results)
      })
      .catch(err => console.log(err))
  }

  if (file) {
    GayzoUpload(file)
      .then((imageURL) => {
        queries.update.icon(imageURL, uid)
          .then(results => {
            console.log(`Successfully updated Profile Icon   uid (${results.insertId})`)
            results.data = imageURL
            res.json(results)
          })
          .catch(err => console.log(err))
      })
      .catch(err => console.log(err))
  }
})

// ----------------------------------------------------------------------
// 			 			DELTE METHODS
// ----------------------------------------------------------------------

// ----------------------------------------------
// 			DELETE BY ID
// ----------------------------------------------
router.post('/byId', async (req, res) => {
  const { uid } = req.body
  queries.delete.byId(uid)
    .then(results => {
      res.json(results)
    })
    .catch(err => console.log(err))
})

module.exports = router