"use strict";

module.exports = function (req, res) {
	if (req.isAuthenticated()) {
		res.redirect('/');
		return;
	}

	res.render('login', {
		title: "SmartHome"
	});
};
