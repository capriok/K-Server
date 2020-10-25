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
// const multer = require('multer')
// const storage = multer.diskStorage({
//   destination: './local/user/icon',
//   filename: (req, file, cb) => {
//     cb(null, `uid-${req.body.uid}${path.extname(file.originalname)}`)
//   }
// })
// const upload = multer({ storage })

// ----------------------------------------------------------------------
// 			 			GAYZO UPLOAD
// ----------------------------------------------------------------------
// const Gyazo = require('gyazo-api');
// const G = new Gyazo('b7850ec374055ef3470b51c1b0842adf41ce21b09debf9cfcc4cb253d0326b9f')
// const GayzoUpload = (file) => {
//   return new Promise((resolve, reject) => {
//     G.upload(file.path)
//       .then(res => {
//         resolve(`https://i.gyazo.com/${res.data.image_id}${path.extname(file.originalname)}`)
//       })
//       .catch(err => reject(err))
//   })
// }

// ----------------------------------------------------------------------
// 			 			COMPOSE VALUES INTO SQL MULTIPLE UPDATE SYNTAX
// ----------------------------------------------------------------------
const composeUpdateProfileValues = (body) => {
  delete body.uid
  delete body.icon
  for (let prop in body) {
    if (body[prop] === 'undefined' || body[prop] === '') {
      delete body[prop]
    }
  }
  let keys = Object.keys(body)
  let values = [keys.map((key, i) => {
    return `${i === 0 ? '' : ' '}${key} = '${body[key]}'`
  })]
  return values.toString()
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
        console.log(`Successfully found user             uid (${results[0].uid})`)
        const user = {
          uid: results[0].uid,
          username: results[0].username
        }
        console.table(results)
        const token = jwt.sign(user, process.env.SECRET)
        console.log(`Successfully signed token           uid (${results[0].uid})`)
        res.send({ user, token })
      } else {
        console.log('Login attempt failed');
        res.status(400).end();
      }
    })
    .catch(err => console.log(err))
})

// ----------------------------------------------
// 			GET ALL USERS
// ----------------------------------------------
router.get('/users/:uid', async (req, res) => {
  const { uid } = req.params
  queries.get.users(uid)
    .then(results => {
      console.log(`Successfully fetched all users      uid (${uid})`)
      const users = results
      users.map(u => {
        u.isFollowed === 0 ? u.isFollowed = false : u.isFollowed = true
      })
      res.json(users)
    })
    .catch(err => console.log(err))
})

// ----------------------------------------------
// 			GET USERS BY SEARCH TERM
// ----------------------------------------------
router.get('/usersByTerm/:uid/:term', async (req, res) => {
  const { uid, term } = req.params
  queries.get.usersByTerm(term, uid)
    .then(results => {
      console.log(`Successfully fetched users by term  (${term})`)
      res.json(results)
    })
    .catch(err => console.log(err))
})

// ----------------------------------------------
// 			GET PROFILE BY QUERY UID AND UID
// ----------------------------------------------
router.get('/profile/:quid/:uid', async (req, res) => {
  const { quid, uid } = req.params
  queries.get.profile(quid, uid)
    .then(results => {
      console.log(`Successfully fetched Profile        uid (${quid})`)
      const profile = JSON.parse(results[0].profile)
      const formattedJoin_Date = moment(profile.join_date).format('LL');
      const formattedBirthday = profile.birthday !== null ? moment(profile.birthday).format('LL') : null;
      const parsedisFollowed = profile.isFollowed === 0 ? profile.isFollowed = false : profile.isFollowed = true
      let payload = {
        ...profile,
        join_date: formattedJoin_Date,
        birthday: formattedBirthday,
        isFollowed: parsedisFollowed
      }
      console.log('Profile Payload', payload);
      res.json(payload)
    })
    .catch(err => console.log(err))
})

// ----------------------------------------------
// 			GET FOLLOWERS BY QUERY UID AND UID
// ----------------------------------------------
router.get('/followers/:quid/:uid', async (req, res) => {
  const { quid, uid } = req.params
  queries.get.followers(quid, uid)
    .then(results => {
      console.log(`Successfully fetched Followers      uid (${quid})`)
      const followers = JSON.parse(results[0].followers)
      followers.forEach(f => {
        f.follow_date = moment(f.follow_date).format('LL')
        f.isFollowed === 0 ? f.isFollowed = false : f.isFollowed = true
      })
      console.log('Followers Payload', followers);
      res.json(followers)
    })
    .catch(err => console.log(err))
})

// ----------------------------------------------
// 			GET FOLLOWING BY QUERY UID AND UID
// ----------------------------------------------
router.get('/following/:quid/:uid', async (req, res) => {
  const { quid, uid } = req.params
  queries.get.following(quid, uid)
    .then(results => {
      console.log(`Successfully fetched Following      uid (${quid})`)
      const following = JSON.parse(results[0].following)
      following.forEach(f => {
        f.follow_date = moment(f.follow_date).format('LL')
        f.isFollowed === 0 ? f.isFollowed = false : f.isFollowed = true
      })
      console.log('Following Payload', following);
      res.json(following)
    })
    .catch(err => console.log(err))
})

// ----------------------------------------------------------------------
// 			 			POST METHODS
// ----------------------------------------------------------------------

// ----------------------------------------------
// 			POST USER
// ----------------------------------------------
router.post('/user', async (req, res) => {
  const { username } = req.body;
  const { password } = req.body;
  const date = moment().format('YYYY-MM-DD');
  queries.post.user(username, password, date)
    .then(results => {
      console.log(`Successfully created user           uid (${results.insertId})`)
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

// ----------------------------------------------
// 			POST USER_FOLLOWER
// ----------------------------------------------
router.post('/follow', async (req, res) => {
  const { follower_uid, following_uid } = req.body
  const follow_date = moment().format('YYYY-MM-DD');
  queries.post.user_follower(follower_uid, following_uid, follow_date)
    .then(results => {
      console.log(`Successfully followed user          uid (${follower_uid})`)
      res.json(results)
    })
    .catch(err => console.log(err.code))
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
// 			UPDATE PROFILE
// ----------------------------------------------

router.post('/updateProfile', /*upload.single('icon'),*/ async (req, res) => {
  const file = req.file
  const { uid } = req.body
  let values = composeUpdateProfileValues(req.body)
  let concatResults = []
  if (values) {
    queries.update.profile(values, uid)
      .then(results => {
        console.log(`Successfully updated Profile        uid (${results.insertId})`)
        if (!file) {
          return res.json(results)
        } else {
          concatResults.push(results)
        }
      })
      .catch(err => console.log(err))
  }
  if (file) {
    return
    // GayzoUpload(file)
    //   .then((imageURL) => {
    //     queries.update.icon(imageURL, uid)
    //       .then(results => {
    //         console.log(`Successfully updated Profile        uid (${results.insertId})`)
    //         results.data = imageURL
    //         concatResults.push(results)
    //       })
    //       .catch(err => console.log(err))
    //   })
    //   .then(() => res.json(concatResults))
    //   .catch(err => console.log(err))
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

// ----------------------------------------------
// 			DELETE USER_FOLLOWER
// ----------------------------------------------
router.post('/unfollow', async (req, res) => {
  const { follower_uid, following_uid } = req.body
  queries.delete.user_follower(follower_uid, following_uid)
    .then(results => {
      console.log(`Successfully unfollowed user        uid (${follower_uid})`)
      res.json(results)
    })
    .catch(err => console.log(err.code))
})
// ----------------------------------------------
// 			DELETE OWN USER_FOLLOWER
// ----------------------------------------------
router.post('/unfollowOwn', async (req, res) => {
  const { follower_uid, following_uid } = req.body
  queries.delete.own_user_follower(follower_uid, following_uid)
    .then(results => {
      console.log(`Successfully unfollowed own user    uid (${follower_uid})`)
      res.json(results)
    })
    .catch(err => console.log(err.code))
})

module.exports = router