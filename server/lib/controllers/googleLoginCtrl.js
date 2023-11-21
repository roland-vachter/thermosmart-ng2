"use strict";

const passport = require('passport');

exports.auth = passport.authenticate('google', {
	scope: ['email']
});

exports.callback = passport.authenticate('google', {
	successRedirect: '/',
	failureRedirect: '/login/google/forbidden'
});

exports.forbidden = function (req, res) {
	throw {
		status: 403
	};
};
