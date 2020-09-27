const DB = require("../database/mysqldb");

const statements = {
	getEquipments: `
	SELECT eq.id, eq.name, (
		SELECT IFNULL(JSON_ARRAYAGG(exco.name), "[]")
		FROM exco
		WHERE eq.id = exco.eq_id
		) as occ
		FROM equipment eq;
	`,
	getMuscles: `
	SELECT mu.id, mu.name, (
		SELECT IFNULL(JSON_ARRAYAGG(exco.name), "[]")
		FROM exco
		WHERE mu.id = exco.mu_id
    ) as occ
    FROM muscle mu;
`,
	getExercises: `
	SELECT ex.id, ex.name, (
		SELECT IFNULL(JSON_ARRAYAGG(exco.name), "[]")
		FROM exco
		WHERE ex.id = exco.ex_id
    ) as occ
    FROM exercise ex;
`,
	getMovements: `
	SELECT mo.name, (
		SELECT IFNULL(JSON_ARRAYAGG(circ.name),"[]")
		FROM circ 
		INNER JOIN circ_movs cmov
		WHERE circ.id = cmov.circ_id
		AND mo.id = cmov.mo_id
	) as occ
    FROM movement mo;
`,
	getCircs: `
	SELECT circ.name, (
		SELECT JSON_ARRAYAGG(
		 JSON_OBJECT(
			'name', mo.name,
			'duration', cmov.duration
			)
		)
		FROM circ_movs cmov
		INNER JOIN movement mo
		ON cmov.mo_id = mo.id
		AND circ.id = cmov.circ_id 
	) as deps 
	FROM circ;
`,
	getExcos: `
	SELECT exco.id, exco.name, JSON_OBJECT(
		'equipment', eq.name,
		'muscle', mu.name,
		'exercise', ex.name
	) as deps 
    FROM exco 
	INNER JOIN muscle mu ON exco.mu_id = mu.id
	INNER JOIN exercise ex ON exco.ex_id = ex.id
	INNER JOIN equipment eq ON exco.eq_id = eq.id;
`,
	getWocos: `
	SELECT woco.id, woco.name, (SELECT JSON_ARRAYAGG(
		JSON_OBJECT(
			'id', exco.id,
			'name', exco.name,
			'sets', we.sets,
			'reps', we.reps, 
			'weight', we.weight,
				'deps', JSON_OBJECT(
				'equipment', eq.name,
				'muscle', mu.name,
				'exercise', ex.name
				)
			)
		) 
		FROM woco_excos we
		INNER JOIN exco
		ON we.exco_id = exco.id
		INNER JOIN muscle mu ON exco.mu_id = mu.id
		INNER JOIN exercise ex ON exco.ex_id = ex.id
		INNER JOIN equipment eq ON exco.eq_id = eq.id
	) as excos, (SELECT JSON_ARRAYAGG(
		JSON_OBJECT(
			'id', circ.id,
			'name', circ.name,
			'sets', wc.sets,
			'deps', (SELECT JSON_ARRAYAGG(
				JSON_OBJECT(
					'id', mo.id,
					'name', mo.name,
					'duration', cmov.duration
					)
				)
				FROM circ_movs cmov
				INNER JOIN movement mo
				ON cmov.mo_id = mo.id
				AND circ.id = cmov.circ_id)
			)
		)
		FROM woco_circs wc
		INNER JOIN circ
		ON wc.circ_id = circ.id
		AND woco.id = wc.woco_id
	) as circs
	FROM woco;
`,
}

module.exports = SQLifting = {
	get: {
		equipments: async () => {
			return new Promise((res, rej) => {

				DB.query(statements.getEquipments, (err, results) => { if (err) return rej(err); res(results) })
			})
		},
		muscles: () => {
			DB.query(statements.getMuscles, (err, results) => { })
		},
		exercises: () => {
			DB.query(statements.getExercises, (err, results) => { })
		},
		movements: () => {
			DB.query(statements.getMovements, (err, results) => { })
		},
		circs: () => {
			DB.query(statements.getCircss, (err, results) => { })
		},
		excos: () => {
			DB.query(statements.getExcos, (err, results) => { })
		},
		wocos: () => {
			DB.query(statements.getWocos, (err, results) => { })
		}
	},
	post: {
		composition: (table, entity) => { },
		circ: (entity) => { },
		exco: (entity) => { },
		woco: (entity) => { }
	},
	delete: {
		byId: (table, id) => { },
		relation: (table, id) => { },
	}
}
