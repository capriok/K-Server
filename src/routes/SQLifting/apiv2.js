const router = require('express').Router();
const mysql = require('mysql');
const DB = require("../../database/mysqldb");
const queries = require('../../models/queries')

// ----------------------------------------------------------------------
// 					CORS
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
// 					COMPOSE VALUES INTO SQL MULPTIPLE INSERT SYNTAX
// ----------------------------------------------------------------------
const composeCirc_movsValues = (arr, circ_id) => {
	let values = [arr.map(a => {
		let duration = `${a.durationValue.toString()} ${a.durationType}`
		return `(${circ_id}, ${a.id}, '${duration}')`
	})].toString()
	return values
}
const composeWoco_excoORcircValues = (arr, woco_id, type) => {
	let values = [arr.map(a => {
		return `(${woco_id}, ${a.id}, ${a.sets}${type === 'exco' ? `, ${a.reps}, ${a.weight}` : ``})`
	})].toString()
	return values
}

// ----------------------------------------------------------------------
// 					SORT RESOLVED ARRAY BY NAME
// ----------------------------------------------------------------------
const sortByName = (res) => res.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : -1)


// ----------------------------------------------------------------------
//																GET METHODS
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
			console.log(`Successfully fetched ${results.length} Equipmnents 	uid (${uid})`);
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
			console.log(`Successfully fetched ${results.length} Muscles 	uid (${uid})`);
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
			console.log(`Successfully fetched ${results.length} Exercises 	uid (${uid})`);
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
			console.log(`Successfully fetched ${results.length} Movements 	uid (${uid})`);
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
			console.log(`Successfully fetched ${results.length} Excos 	uid (${uid})`);
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
			console.log(`Successfully fetched ${results.length} Circs 	uid (${uid})`);
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
			console.log(`Successfully fetched ${results.length} Wocos 	uid (${uid})`);
			res.json(sortByName(results))
		})
		.catch(err => console.log(err))
})

// ----------------------------------------------------------------------
//																POST METHODS
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
			console.log(`Successfully inserted Circ (${name})`);
			// Returns as string (circ_idVal, mo_idVal, durationVal), ...
			const woco_circVals = composeCirc_movsValues(movements, circ_id)
			// Insert movements in circ_movs relation table
			queries.post.circ_movs(woco_circVals)
				.then(() => console.log(`Successfully inserted Circ_Movs (${circ_id})`))
				.catch(err => console.log(err))

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
			console.log(`Successfully inserted Woco (${name})`);
			// Returns as string (woco_id, exco_id, sets, reps, weight), ...
			let woco_excoVals = composeWoco_excoORcircValues(exercises, woco_id, 'exco')
			// Insert excos in woco_excos relation table
			queries.post.woco_excos(woco_excoVals)
				.then(() => console.log(`Successfully inserted Woco_Excos (${woco_id})`))
				.catch(err => console.log(err))
			// Returns as string (woco_id, woco_id, sets), ...
			let woco_circVals = composeWoco_excoORcircValues(circuits, woco_id, 'circ')
			// Insert circs in woco_circs relation table
			if (woco_circVals) {
				queries.post.woco_circs(woco_circVals)
					.then(() => console.log(`Successfully inserted Woco_Circs (${woco_id})`))
					.catch(err => console.log(err))
			}
			res.json(results)
		})
		.catch(err => console.log(err))
})

// ----------------------------------------------------------------------
//																UPDATE METHODS
// ----------------------------------------------------------------------

// ----------------------------------------------
// 					UPDATE NAME
// ----------------------------------------------
router.post('/updateName', async (req, res) => {
	const { table, name, id, uid } = req.body
	queries.update.name(table, name, id, uid)
		.then(results => {
			console.log(`Successfully updated ${table.capitalize()} name to ${name}`)
			res.json(results)
		})
		.catch(err => console.log(err))
})

// ----------------------------------------------------------------------
//																DELTE METHODS
// ----------------------------------------------------------------------

// ----------------------------------------------
// 					DELETE BY ID
// ----------------------------------------------
router.post('/byId', async (req, res) => {
	const { table, ids, uid } = req.body
	queries.delete.byId(table, ids, uid)
		.then(results => {
			let amt = ids.split(',').length
			console.log(`Successfully deleted ${amt} ${table.capitalize()}s (${ids})`)
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
			let amt = ids.split(',').length
			console.log(`Successfully deleted ${amt} Circ_Movs (${ids})`)
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
			let amt = ids.split(',').length
			console.log(`Successfully deleted ${amt} Woco_Excos (${ids})`)
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
			let amt = ids.split(',').length
			console.log(`Successfully deleted ${amt} Woco_Circs (${ids})`)
			res.json(results)
		})
		.catch(err => console.log(err))
})

module.exports = router

String.prototype.capitalize = function () {
	return this.charAt(0).toUpperCase() + this.slice(1);
}
