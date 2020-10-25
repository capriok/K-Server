const DB = require("../database/mysqldb");

// -------------------------------------------------------------
// 		 				STATEMENTS
// -------------------------------------------------------------

const statements = {
	// -------------------------------------
	// 			GET
	// -------------------------------------
	get: {
		equipments: (uid) => `
			SELECT eq.id, eq.name, (
				SELECT IFNULL(JSON_ARRAYAGG(exco.name), "[]")
				FROM exco
				WHERE eq.id = exco.eq_id
			) as occ
			FROM equipment eq
			WHERE uid = ${uid};
		`,
		muscles: (uid) => `
			SELECT mu.id, mu.name, (
				SELECT IFNULL(JSON_ARRAYAGG(exco.name), "[]")
				FROM exco
				WHERE mu.id = exco.mu_id
			) as occ
			FROM muscle mu
			WHERE uid = ${uid};
		`,
		exercises: (uid) => `
			SELECT ex.id, ex.name, (
				SELECT IFNULL(JSON_ARRAYAGG(exco.name), "[]")
				FROM exco
				WHERE ex.id = exco.ex_id
			) as occ
			FROM exercise ex
			WHERE uid = ${uid};
		`,
		movements: (uid) => `
			SELECT mo.id, mo.name, (
				SELECT IFNULL(JSON_ARRAYAGG(circ.name),"[]")
				FROM circ 
				INNER JOIN circ_movs cmov
				WHERE circ.id = cmov.circ_id
				AND mo.id = cmov.mo_id
			) as occ
			FROM movement mo
			WHERE uid = ${uid};
		`,
		circs: (uid) => `
			SELECT circ.id, circ.name, (
				SELECT JSON_ARRAYAGG(
				JSON_OBJECT(
					'name', mo.name,
					'duration', cmov.duration
					)
				)
				FROM circ_movs cmov
				INNER JOIN movement mo
				WHERE cmov.mo_id = mo.id
				AND circ.id = cmov.circ_id
			) as deps 
			FROM circ
			WHERE circ.uid = ${uid};
		`,
		excos: (uid) => `
			SELECT exco.id, exco.name, JSON_OBJECT(
				'equipment', eq.name,
				'muscle', mu.name,
				'exercise', ex.name
			) as deps 
			FROM exco 
			INNER JOIN muscle mu ON exco.mu_id = mu.id
			INNER JOIN exercise ex ON exco.ex_id = ex.id
			INNER JOIN equipment eq ON exco.eq_id = eq.id
			WHERE exco.uid = ${uid};
		`,
		wocos: (uid) => `
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
        INNER JOIN muscle mu ON exco.mu_id = mu.id
				INNER JOIN exercise ex ON exco.ex_id = ex.id
				INNER JOIN equipment eq ON exco.eq_id = eq.id
        WHERE we.exco_id = exco.id
        AND woco.id = we.woco_id
			) as exercises, (SELECT IFNULL(JSON_ARRAYAGG(
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
						WHERE  cmov.mo_id = mo.id
						AND circ.id = cmov.circ_id
						)
					)
				), '[]')
				FROM woco_circs wc
				INNER JOIN circ
				WHERE wc.circ_id = circ.id
				AND woco.id = wc.woco_id
			) as circuit
			FROM woco
			WHERE woco.uid = ${uid};
		`,
	},
	// -------------------------------------
	// 			POST
	// -------------------------------------
	post: {
		composition: (table, name, uid) => `
			INSERT INTO ${table} (name, uid)
			VALUES ('${name}', '${uid}');
		`,
		exco: (name, uid, eq_id, mu_id, ex_id) => `
			INSERT INTO exco (name, uid, eq_id, mu_id, ex_id)
			VALUES ('${name}', '${uid}', '${eq_id}', '${mu_id}', '${ex_id}');
		`,
		circ: (name, uid) => `
			INSERT INTO circ (name, uid)
			VALUES ('${name}', '${uid}');
		`,
		circ_movs: (values) => `
			INSERT INTO circ_movs (circ_id, mo_id, duration)
			VALUES ${values};
		`,
		woco: (name, uid) => `
			INSERT INTO woco (name, uid)
			VALUES ('${name}', '${uid}');
		`,
		woco_excos: (values) => `
			INSERT INTO woco_excos (woco_id, exco_id, sets, reps, weight)
			VALUES ${values};
		`,
		woco_circs: (values) => `
			INSERT INTO woco_circs (woco_id,  circ_id, sets)
			VALUES ${values};
		`,
	},
	// -------------------------------------
	// 			UPDATE
	// -------------------------------------
	update: {
		name: (table, name, id, uid) => `
			UPDATE ${table}
			SET name = '${name}'
			WHERE id = ${id}
			AND uid = ${uid};
		`,
	},
	// -------------------------------------
	// 			DELTE
	// -------------------------------------
	delete: {
		byId: (table, ids, uid) => `
			DELETE FROM ${table}
			WHERE id IN (${ids})
			AND uid = ${uid};
		`,
		circ_movs: (ids) => `
			DELETE FROM circ_movs
			WHERE circ_id IN (${ids});
		`,
		woco_excos: (ids) => `
			DELETE FROM woco_excos
			WHERE woco_id IN (${ids});
		`,
		woco_circs: (ids) => `
			DELETE FROM woco_circs
			WHERE woco_id IN (${ids});
		`,
	},
}

// -------------------------------------------------------------
// 			MYSQL QUERY RETURNING AS PROMISE
// -------------------------------------------------------------

const query = async (statement) => {
	return new Promise((resolve, reject) => {
		DB.query(statement, (err, results) => {
			if (err) return reject(err)
			resolve(results)
		})
	})
}

// -------------------------------------------------------------
// 			EXPORT METHODS TO CALL QUERY FUNCTION
// -------------------------------------------------------------

module.exports = {
	get: {
		equipments: (uid) => {
			return query(statements.get.equipments(uid))
		},
		muscles: (uid) => {
			return query(statements.get.muscles(uid))
		},
		exercises: (uid) => {
			return query(statements.get.exercises(uid))
		},
		movements: (uid) => {
			return query(statements.get.movements(uid))
		},
		excos: (uid) => {
			return query(statements.get.excos(uid))
		},
		circs: (uid) => {
			return query(statements.get.circs(uid))
		},
		wocos: (uid) => {
			return query(statements.get.wocos(uid))
		}
	},
	post: {
		composition: (table, name, uid) => {
			return query(statements.post.composition(table, name, uid))
		},
		exco: (name, uid, eq_id, mu_id, ex_id) => {
			return query(statements.post.exco(name, uid, eq_id, mu_id, ex_id))
		},
		circ: (name, uid) => {
			return query(statements.post.circ(name, uid))
		},
		circ_movs: (values) => {
			return query(statements.post.circ_movs(values))
		},
		woco: (name, uid) => {
			return query(statements.post.woco(name, uid)
			)
		},
		woco_excos: (woco_id, exco_id, sets, reps, weight) => {
			return query(statements.post.woco_excos(woco_id, exco_id, sets, reps, weight))
		},
		woco_circs: (woco_id, circ_id, sets) => {
			return query(statements.post.woco_circs(woco_id, circ_id, sets))
		}
	},
	update: {
		name: (table, name, id, uid) => {
			return query(statements.update.name(table, name, id, uid))
		}
	},
	delete: {
		byId: (table, ids, uid) => {
			return query(statements.delete.byId(table, ids, uid))
		},
		circ_movs: (ids) => {
			return query(statements.delete.circ_movs(ids))
		},
		woco_excos: (ids) => {
			return query(statements.delete.woco_excos(ids))
		},
		woco_circs: (ids) => {
			return query(statements.delete.woco_circs(ids))
		},

	}
}

