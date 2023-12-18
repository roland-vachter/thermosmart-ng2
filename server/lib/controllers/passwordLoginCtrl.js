"use strict";

const passport = require('passport');

exports.auth = passport.authenticate('local', {
	successRedirect: '/',
	failureRedirect: '/login/password/forbidden'
});

exports.forbidden = function (req, res) {
	throw {
		status: 403
	};
};
