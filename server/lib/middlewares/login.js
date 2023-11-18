"use strict";

//const generateRandomString = require('../utils/generateRandomString');

async function login (req, res, next) {
	if (req.isAuthenticated()) {
		if (!req.user) {
			if (req.apiCall) {
				return res.json({
					status: 'error',
					error: 'No facebook user found'
				});
			} else {
				throw new Error('No facebook user found');
			}
		}

		return next();
	} else {
		if (req.apiCall) {
			res.sendStatus(401);
		} else {
			res.redirect('/login');
		}
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
