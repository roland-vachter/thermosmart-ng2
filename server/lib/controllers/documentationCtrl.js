"use strict";

const outsideConditions = require('../services/outsideConditions');

module.exports = function (req, res) {
	res.render('documentation', {
		title: "SmartHome",
		backgroundImage: outsideConditions.get().backgroundImage
	});
};
