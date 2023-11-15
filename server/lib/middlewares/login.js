"use strict";

const UserModel = require('../models/User');

//const AuthToken = require('../models/AuthToken');
//const generateRandomString = require('../utils/generateRandomString');

async function getUserByEmail(user) {
	if (user?.emails?.length) {
		for (let email of user?.emails) {
			const dbUser = await UserModel.findOne({
				email: email.value
			}).populate({
				path: 'locations'
			}).exec();

			if (dbUser) {
				return dbUser;
			}
		}
	} else {
		return null;
	}
}

function getUserById(user) {
	return UserModel.findOne({
		facebookid: user?.id
	}).populate({
		path: 'locations'
	}).exec();
}

async function login (req, res, next) {
	if (req.isAuthenticated()) {
		if (!req.user) {
			return res.json({
				status: 'error',
				error: 'No user found'
			})
		}

		try {
			const user = await getUserByEmail(req.user) ?? await getUserById(req.user);

			if (!user) {
				return res.json({
					status: 'error',
					error: 'No user found'
				})
			}

			req.userModel = user;
			return next();
		} catch(e) {
			console.error(e);
			res.json({
				status: 'error',
				error: e.message
			})
		}
	} else {
		res.redirect('/login/facebook');
	}
}

/*function login (req, res, next) {
	if (req.isAuthenticated()) {
		if (!req.cookies.auth_token) {
			const authToken = new AuthToken({
				token: generateRandomString()
			});

			authToken.save().then(() => {
				next();
			}).catch(() => {
				next();
			});
		}
	}

	if (req.cookies.auth_token) {
		AuthToken.findOne({
			token: req.cookies.auth_token
		}).then(entry => {
			if (entry) {
				next();
			} else {
				res.redirect('/login/facebook');
			}
		}).catch((err) => {
			console.log("Error fetching auth token.", err);
			res.redirect('/login/facebook');
		});
	} else {
		res.redirect('/login/facebook');
	}
}*/

module.exports = login;
