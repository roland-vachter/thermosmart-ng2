"use strict";

const htmlParser = require('node-html-parser');
const fs = require('fs');
const path = require('path');
const indexHtml = fs.readFileSync(path.join(__dirname, '../../../dist/index.html'));
const indexHtmlParsed = htmlParser.parse(indexHtml);
const outsideConditions = require('../services/outsideConditions');

indexHtmlParsed.querySelectorAll('script').forEach(s => {
	s.setAttribute('src', '/assets/' + s.attributes.src);
});

indexHtmlParsed.querySelector('head').removeChild(indexHtmlParsed.querySelector('head link[href=favicon.ico]'));

indexHtmlParsed.querySelectorAll('link').forEach(s => {
	s.setAttribute('href', '/assets/' + s.attributes.href);
});

indexHtmlParsed.querySelector('title').innerHTML = 'SmartHome';

indexHtmlParsed.querySelector('head').appendChild(htmlParser.parse('<link rel="icon" type="image/png" href="/assets/static/favicon-32x32.png" sizes="32x32">'));
indexHtmlParsed.querySelector('head').appendChild(htmlParser.parse('<link rel="icon" type="image/png" href="/assets/static/favicon-194x194.png" sizes="194x194">'));
indexHtmlParsed.querySelector('head').appendChild(htmlParser.parse('<link href="https://fonts.googleapis.com/css?family=Jura" rel="stylesheet"></link>'));

module.exports = function (req, res) {
	if (!req.isAuthenticated()) {
		res.redirect('/login');
		return;
	}

	indexHtmlParsed.querySelector('body').setAttribute('style', `background-image: url(/assets/static/images/${outsideConditions.get()?.backgroundImage})`);
	res.send(indexHtmlParsed.toString());
};
