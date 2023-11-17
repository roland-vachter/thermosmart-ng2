"use strict";

const db = require('./lib/services/db');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const compression = require('compression');
const cacheHeaders = require('./lib/utils/cacheHeaders');
const _ = require('lodash');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const passportAuth = require('./lib/services/passportAuth');
const outsideConditions = require('./lib/services/outsideConditions');
const mongoose = require('mongoose');

var store = new MongoStore({
	mongooseConnection: mongoose.connection,
	collection: 'sessions',
	fallbackMemory: false,
	autoRemove: 'native'
});

const prodEnv = process.env.ENV === 'prod' ? true : false;

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));


const hbs = exphbs.create({
	defaultLayout: path.join(__dirname, 'views/layout'),
	extname: '.handlebars',
	partialsDir: [
		path.join(__dirname, 'views', 'partials'),
		path.join(__dirname, 'bower_components')
	],
	helpers: {
		block: function (name) {
			const blocks = this._blocks;
			const content = blocks && blocks[name];

			return content ? content.join('\n') : null;
		},

		contentFor: function (name, options) {
			const blocks = this._blocks || (this._blocks = {});
			const block = blocks[name] || (blocks[name] = []);

			block.push(options.fn(this));
		}
	}
});


app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
	name: 'sess',
	secret: process.env.SESSION_SECRET,
	cookie: {
		maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
	},
	store: store,
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate('session'));

passportAuth.init();

app.use(compression());

const defaultOptions = {
	assetsBasePath: `/assets`,
	assetsStaticBasePath: `/assets/static`,
	basePath: '/',
	isTest: !prodEnv,
	isProd: prodEnv
};

app.use( function( req, res, next ) {
	const _render = res.render;

	res.render = function( view, viewOptions, fn ) {
		const viewModel = _.merge({}, viewOptions, defaultOptions, { backgroundImage: outsideConditions.get().backgroundImage });

		_render.call( this, view, viewModel, fn );
	};
	next();
});

const ayear = 365 * 24 * 60 * 60 * 1000;

app.use(`/assets/static/`, express.static(path.join(__dirname, 'public'), {
	maxage: process.env.CACHE_ENABLED === 'true' ? ayear : 0
}));
app.use(`/assets/`, express.static(path.join(__dirname, '../dist'), {
	maxage: process.env.CACHE_ENABLED === 'true' ? ayear : 0
}));

app.use('/privacy-policy', (req, res) => {
	res.render('privacy-policy');
});

app.use('/data-deletion', (req, res) => {
	res.render('data-deletion');
});

app.use('/', require('./router'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	cacheHeaders.setNoCache(res);
	const err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handlers
const errorHandler = (err, req, res, next) => {
	cacheHeaders.setNoCache(res);

	const isNotProdEnv = app.get('env') === 'development' || !prodEnv;

	console.log(err);

	if (err.status === 404) {
		res.status(404);
		res.render('error_404');
	} else if (err.type === 'OAuthException') {
		res.status(err.status || 503);
		res.render('error_login', {
			message: err.errMsg || err.message,
			error: isNotProdEnv ? err : { status: err?.status }
		});
	} else {
		res.status(err.status || 503);
		res.render('error', {
			message: err.errMsg || err.message,
			error: isNotProdEnv ? err : { status: err?.status }
		});
	}
};

app.use(errorHandler);

require('./lib/services/statistics');

module.exports = app;
