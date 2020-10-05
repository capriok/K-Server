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
		users: (uid) => `
			SELECT u.uid, u.username, u.join_date, p.icon, p.location, (
				SELECT COUNT(*) 
				FROM user_followers f
				WHERE f.follower_uid = ${uid}
				AND f.following_uid = u.uid
			) as isFollowed
			FROM user u 
			INNER JOIN user_profiles p
			ON u.uid = p.uid;
		`,
		usersByTerm: (term, uid) => `
			SELECT u.uid, u.username, u.join_date, p.icon, p.location, (
				SELECT COUNT(*) 
				FROM user_followers f
				WHERE f.follower_uid = ${uid}
				AND f.following_uid = u.uid
			) as isFollowed
			FROM user u 
			INNER JOIN user_profiles p
			ON u.uid = p.uid
			AND u.username LIKE '${term}%';
		`,
		profile: (quid, uid) => `
			SELECT JSON_OBJECT(
				'username', u.username,
				'join_date', u.join_date,
				'icon', p.icon,
        'status', p.status,
				'first_name', p.first_name,
				'last_name', p.last_name,
				'email', p.email,
				'birthday', p.birthday,
				'location', p.location,
				'isFollowed', (SELECT COUNT(*)
					FROM user_followers f
					WHERE f.follower_uid = ${uid}
					AND f.following_uid = ${quid}
				),
				'follower_count', (SELECT COUNT(*) as following 
					FROM user_followers 
					WHERE following_uid = ${quid}
				),
				'following_count', (SELECT COUNT(*) as followers 
					FROM user_followers 
					WHERE follower_uid = ${quid}
				),
				'data', (SELECT JSON_OBJECT(
					'equipments', (SELECT COUNT(*) as ammout
						FROM equipment
						WHERE uid = ${quid}
					),
					'muscles', (SELECT COUNT(*) as ammout
						FROM muscle
						WHERE uid = ${quid}
					),
					'exercises', (SELECT COUNT(*) as ammout
						FROM exercise
						WHERE uid = ${quid}
					),
					'movements', (SELECT COUNT(*) as ammout
						FROM movement
						WHERE uid = ${quid}
					),
					'excos', (SELECT COUNT(*) as ammout
						FROM exco
						WHERE uid = ${quid}
					),
					'circs', (SELECT COUNT(*) as ammout
						FROM circ
						WHERE uid = ${quid}
					),
					'wocos', (SELECT COUNT(*) as ammout
						FROM woco
						WHERE uid = ${quid}
					)
				) as data
				FROM user
				WHERE uid = ${quid}
				)
			) as profile
			FROM user u
			INNER JOIN user_profiles p
			ON p.uid = ${quid}
			AND u.uid = ${quid}
			LIMIT 1;
		`,
		followers: (quid, uid) => `
			SELECT IFNULL(JSON_ARRAYAGG(
				JSON_OBJECT(
					'uid', user.uid,
					'username', user.username,
					'follow_date', f.follow_date,
					'icon', p.icon,
					'isFollowed', (SELECT COUNT(*) 
						FROM user_followers uf 
						WHERE uf.follower_uid = ${uid}
						AND uf.following_uid = user.uid
					)
				)
			), "[]") as followers
			FROM user_followers f 
			INNER JOIN user user
			ON user.uid = f.follower_uid
			AND f.following_uid = ${quid}
			INNER JOIN user_profiles p
			ON p.uid = user.uid;
		`,
		following: (quid, uid) => `
			SELECT IFNULL(JSON_ARRAYAGG(
				JSON_OBJECT(
					'uid', user.uid,
					'username', user.username,
					'follow_date', f.follow_date,
					'icon', p.icon,
					'isFollowed', (SELECT COUNT(*) 
						FROM user_followers uf 
						WHERE uf.follower_uid = ${uid}
						AND uf.following_uid = user.uid
					)
				)
			), "[]") as following
			FROM user_followers f 
			INNER JOIN user user
			ON user.uid = f.following_uid
			AND f.follower_uid = ${quid}
			INNER JOIN user_profiles p
			ON p.uid = user.uid;
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
		`,
		user_follower: (follower_uid, following_uid, follow_date) => `
			INSERT INTO user_followers (follower_uid, following_uid, follow_date)
			VALUES('${follower_uid}', '${following_uid}', '${follow_date}');
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
		user_follower: (follower_uid, following_uid) => `
			DELETE FROM user_followers f
			WHERE f.follower_uid = ${follower_uid}
			AND f.following_uid = ${following_uid};
		`,
		own_user_follower: (follower_uid, following_uid) => `
			DELETE FROM user_followers f
			WHERE f.follower_uid = ${follower_uid}
			AND f.following_uid = ${following_uid};
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
		users: (uid) => {
			return query(statements.get.users(uid))
		},
		usersByTerm: (term, uid) => {
			return query(statements.get.usersByTerm(term, uid))
		},
		profile: (quid, uid) => {
			return query(statements.get.profile(quid, uid))
		},
		followers: (quid, uid) => {
			return query(statements.get.followers(quid, uid))
		},
		following: (quid, uid) => {
			return query(statements.get.following(quid, uid))
		}
	},
	post: {
		user: (username, password, date) => {
			return query(statements.post.user(username, password, date))
		},
		user_profile: (uid, first_name, last_name, icon, status) => {
			return query(statements.post.user_profile(uid, first_name, last_name, icon, status))
		},
		user_follower: (following_uid, follower_uid, follow_date) => {
			return query(statements.post.user_follower(following_uid, follower_uid, follow_date))
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
		user_follower: (follower_uid, following_uid) => {
			return query(statements.delete.user_follower(follower_uid, following_uid))
		},
		own_user_follower: (follower_uid, following_uid) => {
			return query(statements.delete.user_follower(follower_uid, following_uid))
		}
	}
}

