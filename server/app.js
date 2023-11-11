"use strict";

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

var store = new MongoStore({
	url: process.env.DATABASE_URL || process.env.MONGODB_URI || process.env.MONGO_URL,
	collection: 'sessions',
	fallbackMemory: true
});

const UserModel = require('./lib/models/User');

const fingerprint = require('./build_config/js/fingerprint');

const prodEnv = process.env.ENV === 'prod' ? true : false;

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));


const alphavilleHbs = exphbs.create({
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


app.engine('handlebars', alphavilleHbs.engine);
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

passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(user, done) {
	done(null, user);
});

const FacebookStrategy = require('passport-facebook').Strategy;
passport.use(new FacebookStrategy({
		clientID: process.env.FACEBOOK_APP_ID,
		clientSecret: process.env.FACEBOOK_APP_SECRET,
		callbackURL: `https://${process.env.OWN_HOST}/login/facebook/callback`,
		profileFields: ['id', 'emails', 'name']
	},
	function(accessToken, refreshToken, profile, done) {
		console.log('user emails', JSON.stringify(profile.emails));
		if (profile && profile.emails && profile.emails.length) {
			Promise.all(profile.emails.map(email => {
				return UserModel.findOne({
					email: email.value
				}).exec().then((user) => {
					if (user) {
						return true;
					} else {
						return false;
					}
				}).catch((err) => {
					console.log(err);

					return false;
				});
			})).then(results => {
				let hasAccess = false;

				results.forEach(result => {
					if (result) {
						hasAccess = true;
					}
				});

				if (hasAccess) {
					done(null, profile);
				} else {
					console.log(`user with email ${profile.emails} has no access`);
					done(new Error("Forbidden."));
				}
			});
		} else {
			done(new Error("Forbidden"));
		}
	})
);

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
		const viewModel = _.merge({}, viewOptions, defaultOptions);

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

	if (err.status === 404) {
		res.status(404);
		res.render('error_404');
	} else {
		res.status(err.status || 503);
		res.render('error', {
			message: err.errMsg || err.message,
			error: isNotProdEnv ? err : {}
		});
	}
};

app.use(errorHandler);

require('./lib/services/statistics');

module.exports = app;
