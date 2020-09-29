const DB = require("../database/mysqldb");

// -------------------------------------------------------------
// 		 				STATEMENTS
// -------------------------------------------------------------

const statements = {
	// -------------------------------------
	// 			GET
	// -------------------------------------
	get: {
		user: (username, password) => `
			SELECT u.uid, u.username, u.join_date
			FROM user u
			WHERE username = '${username}'
			AND password LIKE BINARY '${password}'
		`,

	},
	// -------------------------------------
	// 			POST
	// -------------------------------------
	post: {
		user: (username, password, date) => `
			INSERT INTO user (username, password, join_date)
			VALUES('${username}', '${password}', '${date}')
		`,

	},
	// -------------------------------------
	// 			UPDATE
	// -------------------------------------
	update: {
		name: (name, uid) => `
			UPDATE user
			SET name = '${name}'
			WHERE id = ${uid};
		`,
	},
	// -------------------------------------
	// 			DELTE
	// -------------------------------------
	delete: {
		byId: (uid) => `
			DELETE FROM user
			WHERE id = ${uid};
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
		user: (username, password) => {
			return query(statements.get.user(username, password))
		},
	},
	post: {
		user: (username, password, date) => {
			return query(statements.post.user(username, password, date))
		}
	},
	update: {
		name: (name, uid) => {
			return query(statements.update.name(name, uid))
		}
	},
	delete: {
		byId: (uid) => {
			return query(statements.delete.byId(uid))
		},

	}
}

