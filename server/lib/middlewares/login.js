"use strict";

async function login (req, res, next) {
	if (req.isAuthenticated()) {
		if (!req.user) {
			if (req.apiCall) {
				return res.json({
					status: 'error',
					error: 'No user found'
				});
			} else {
				throw new Error('No user found');
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

module.exports = login;
