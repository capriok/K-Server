const router = require('express').Router();
const mysql = require('mysql');
const DB = require("../../database/mysqldb");
const queries = require('../../models/queries')
const { cors, corsOptions } = require('../../cors/cors');
var whitelist = ['http://localhost:3000', 'https://sqlifting.netlify.app', 'https://sqlifting.kylecaprio.dev']


// ----------------------------------------------------------------------
//																UTIL
// ----------------------------------------------------------------------

// ----------------------------------------------
// 					CORS ACCESS CONTROL
// ----------------------------------------------
router.use(cors(corsOptions(whitelist)), (req, res, next) => {
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	if (req.method === "OPTIONS") {
		res.header("Access-Control-Allow-Methods", "GET, PUT, POST, PATCH, DELETE");
		return res.status(200).json({});
	}
	next();
});

// ----------------------------------------------
// 					SORT RESOLVED ARRAY BY NAME
// ----------------------------------------------
const sortByName = (res) => res.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : -1)

// ----------------------------------------------------------------------
//																GET
// ----------------------------------------------------------------------

// ----------------------------------------------
// 					GET EQUIPMENTS BY UID
// ----------------------------------------------
router.get('/equipments/:uid', async (req, res) => {
	const { uid } = req.params
	queries.get.equipments(uid)
		.then(results => {
			results.forEach(r => {
				r.occ = JSON.parse(r.occ)
				r.table = 'equipment'
				r.group = 'compositions'
			});
			console.log(`Successfully fetched Equipmnents 	(${results.length}) 	for user ${uid}`);
			res.json(sortByName(results))
		})
		.catch(err => console.log(err))
})

// ----------------------------------------------
// 					GET MUSCLES BY UID
// ----------------------------------------------
router.get('/muscles/:uid', async (req, res) => {
	const { uid } = req.params
	queries.get.muscles(uid)
		.then(results => {
			results.forEach(r => {
				r.occ = JSON.parse(r.occ)
				r.table = 'muscle'
				r.group = 'compositions'
			});
			console.log(`Successfully fetched Muscles 	(${results.length}) 	for user ${uid}`);
			res.json(sortByName(results))
		})
		.catch(err => console.log(err))
})

// ----------------------------------------------
// 					GET EXERCISES BY UID
// ----------------------------------------------
router.get('/exercises/:uid', async (req, res) => {
	const { uid } = req.params
	queries.get.exercises(uid)
		.then(results => {
			results.forEach(r => {
				r.occ = JSON.parse(r.occ)
				r.table = 'exercise'
				r.group = 'compositions'
			});
			console.log(`Successfully fetched Exercises 	(${results.length}) 	for user ${uid}`);
			res.json(sortByName(results))
		})
		.catch(err => console.log(err))
})

// ----------------------------------------------
// 					GET MOVEMENTS BY UID
// ----------------------------------------------
router.get('/movements/:uid', async (req, res) => {
	const { uid } = req.params
	queries.get.movements(uid)
		.then(results => {
			results.forEach(r => {
				r.occ = JSON.parse(r.occ)
				r.table = 'movement'
				r.group = 'compositions'
			});
			console.log(`Successfully fetched Movements 	(${results.length}) 	for user ${uid}`);
			res.json(sortByName(results))
		})
		.catch(err => console.log(err))
})

// // ----------------------------------------------
// 					GET EXCOS BY UID
// // ----------------------------------------------
router.get('/excos/:uid', async (req, res) => {
	const { uid } = req.params
	queries.get.excos(uid)
		.then(results => {
			results.forEach(r => {
				r.deps = JSON.parse(r.deps)
				r.table = 'exco'
				r.group = 'composites'
			});
			console.log(`Successfully fetched Excos 		(${results.length}) 	for user ${uid}`);
			res.json(sortByName(results))
		})
		.catch(err => console.log(err))
})

// ----------------------------------------------
// 					GET CIRCS BY UID
// ----------------------------------------------
router.get('/circs/:uid', async (req, res) => {
	const { uid } = req.params
	queries.get.circs(uid)
		.then(results => {
			results.forEach(r => {
				r.deps = JSON.parse(r.deps)
				r.table = 'circ'
				r.group = 'composites'
			});
			console.log(`Successfully fetched Circs 		(${results.length}) 	for user ${uid}`);
			res.json(sortByName(results))
		})
		.catch(err => console.log(err))
})

// // ----------------------------------------------
// 					GET WOCOS BY UID
// // ----------------------------------------------
router.get('/wocos/:uid', async (req, res) => {
	const uid = req.params.uid
	queries.get.wocos(uid)
		.then(results => {
			results.forEach(r => {
				r.circs = JSON.parse(r.circs)
				r.excos = JSON.parse(r.excos)
				r.table = 'woco'
				r.group = 'composites'
			});
			console.log(`Successfully fetched Wocos 		(${results.length}) 	for user ${uid}`);
			res.json(sortByName(results))
		})
		.catch(err => console.log(err))
})

// ----------------------------------------------------------------------
//																POST
// ----------------------------------------------------------------------

// ----------------------------------------------
// 					POST COMPOSITION
// ----------------------------------------------
router.post('/composition', async (req, res) => {
	const { table, name, uid } = req.body
	queries.post.composition(table, name, uid)
		.then(results => {
			console.log(`Successfully inserted ${table} (${name})`);
			res.json(results)
		})
		.catch(err => console.log(err))
})

// ----------------------------------------------
// 					POST EXCO
// ----------------------------------------------
router.post('/exco', async (req, res) => {
	const { build, uid } = req.body
	const { name, equipment: { id: eq_id }, muscle: { id: mu_id }, exercise: { id: ex_id } } = build
	queries.post.exco(name, uid, eq_id, mu_id, ex_id)
		.then(results => {
			console.log(`Successfully inserted Exco (${name})`);
			res.json(results)
		})
		.catch(err => console.log(err))
})

// ----------------------------------------------
// 					POST CIRC
// ----------------------------------------------

router.post('/circ', async (req, res) => {
	const { uid, build } = req.body
	const { name, movements } = build
	queries.post.circ(name, uid)
		.then(results => {
			const circ_id = results.insertId
			console.log(`Successfully inserted Circ (${circ_id})`);
			movements.forEach(mov => {
				const mo_id = mov.id
				const duration = `${mov.durationValue} ${mov.durationType}`
				queries.post.circ_movs(circ_id, mo_id, duration)
					.then(() => console.log(`Successfully inserted Circ_Mov (${circ_id})`))
					.catch(err => console.log(err))
			})
			res.json(results)
		})
		.catch(err => console.log(err))
})

// ----------------------------------------------
// 					POST WOCO
// ----------------------------------------------
router.post('/woco', async (req, res) => {
	const { build, uid } = req.body
	const { name, exercises, circuits } = build
	queries.post.woco(name, uid)
		.then(results => {
			const woco_id = results.insertId
			console.log(`Successfully inserted Woco (${woco_id})`);
			exercises.forEach(({ id: exco_id, sets, reps, weight }) => {
				queries.post.woco_excos(woco_id, exco_id, sets, reps, weight)
					.then(() => console.log(`Successfully inserted Woco_Exco (${woco_id})`))
					.catch(err => console.log(err))
			});
			circuits.length > 0 && circuits.forEach(({ id: circ_id, sets }) => {
				queries.post.woco_circs(woco_id, circ_id, sets)
					.then(() => console.log(`Successfully inserted Woco_Circ (${woco_id})`))
					.catch(err => console.log(err))
			});
			res.json(results)
		})
		.catch(err => console.log(err))
})

// ----------------------------------------------------------------------
//																UPDATE
// ----------------------------------------------------------------------

// ----------------------------------------------
// 					UPDATE NAME
// ----------------------------------------------
router.post('/updateName', async (req, res) => {
	const { table, name, id, uid } = req.body
	queries.update.name(table, name, id, uid)
		.then(results => {
			console.log(`Successfully updated ${table.capitalize()} (${id})`)
			res.json(results)
		})
		.catch(err => console.log(err))
})

// ----------------------------------------------------------------------
//																DELTE
// ----------------------------------------------------------------------

// ----------------------------------------------
// 					DELETE BY ID
// ----------------------------------------------
router.post('/byId', async (req, res) => {
	const { table, ids, uid } = req.body
	queries.delete.byId(table, ids, uid)
		.then(results => {
			console.log(`Successfully deleted ${table.capitalize()} (${ids})`)
			res.json(results)
		})
		.catch(err => console.log(err))
})

// ----------------------------------------------
// 					DELETE CIRC_MOVS
// ----------------------------------------------
router.post('/circ_movs', async (req, res) => {
	const { ids } = req.body
	queries.delete.circ_movs(ids)
		.then(results => {
			console.log(`Successfully deleted Circ_Movs (${ids})`)
			res.json(results)
		})
		.catch(err => console.log(err))
})

// ----------------------------------------------
// 					DELETE WOCO_EXCOS
// ----------------------------------------------
router.post('/woco_excos', async (req, res) => {
	const { ids } = req.body
	queries.delete.woco_excos(ids)
		.then(results => {
			console.log(`Successfully deleted Woco_Excos (${ids})`)
			res.json(results)
		})
		.catch(err => console.log(err))
})

// ----------------------------------------------
// 					DELETE WOCO_CIRCS
// ----------------------------------------------
router.post('/woco_circs', async (req, res) => {
	const { ids } = req.body
	console.log(ids);
	queries.delete.circ_movs(ids)
		.then(results => {
			console.log(`Successfully deleted Woco_Circs (${ids})`)
			res.json(results)
		})
		.catch(err => console.log(err))
})

module.exports = router

String.prototype.capitalize = function () {
	return this.charAt(0).toUpperCase() + this.slice(1);
}
