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
		profile: (uid) => `
			SELECT JSON_OBJECT(
				'username', u.username,
				'join_date', u.join_date,
				'icon', p.icon,
						'first_name', p.first_name,
						'last_name', p.last_name,
						'email', p.email,
						'birthday', p.birthday,
						'location', p.location,
						'followers', (SELECT COUNT(*) as following 
					FROM user_followers 
					WHERE following_uid = 1
						),
				'following', (SELECT COUNT(*) as followers 
					FROM user_followers 
					WHERE follower_uid = 1
						)
			) as profile
			FROM user u
			INNER JOIN user_profiles p
			ON p.uid = 1
			AND u.uid = 1
			LIMIT 1;
	`
	},
	// -------------------------------------
	// 			POST
	// -------------------------------------
	post: {
		user: (username, password, date) => `
			INSERT INTO user (username, password, join_date)
			VALUES('${username}', '${password}', '${date}');
		`,
		user_profile: (uid, first_name, last_name, icon, status) => `
			INSERT INTO user_profiles (uid, first_name, last_name, icon, status)
			VALUES('${uid}', '${first_name}', '${last_name}', '${icon}', '${status}');
	`
	},
	// -------------------------------------
	// 			UPDATE
	// -------------------------------------
	update: {
		name: (name, uid) => `
			UPDATE user
			SET name = '${name}'
			WHERE uid = ${uid};
		`,
		icon: (icon, uid) => `
			UPDATE user_profiles
			SET icon = '${icon}'
			WHERE uid = ${uid};
		`,
		profile: (values, uid) => `
			UPDATE user_profiles
			SET ${values}
			WHERE uid = ${uid};
		`
	},
	// -------------------------------------
	// 			DELTE
	// -------------------------------------
	delete: {
		byId: (uid) => `
			DELETE FROM user
			WHERE uid = ${uid};
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
		profile: (uid) => {
			return query(statements.get.profile(uid))
		}
	},
	post: {
		user: (username, password, date) => {
			return query(statements.post.user(username, password, date))
		},
		user_profile: (uid, first_name, last_name, icon, status) => {
			return query(statements.post.user_profile(uid, first_name, last_name, icon, status))
		}
	},
	update: {
		name: (name, uid) => {
			return query(statements.update.name(name, uid))
		},
		icon: (icon, uid) => {
			return query(statements.update.icon(icon, uid))
		},
		profile: (values, uid) => {
			return query(statements.update.profile(values, uid))
		}
	},
	delete: {
		byId: (uid) => {
			return query(statements.delete.byId(uid))
		},

	}
}

