const UserModel = require('../models/User');
const passport = require('passport');
const crypto = require('crypto');

const userCache = {};

async function getUserByEmail(profile) {
	if (profile?.emails?.length) {
		for (let email of profile?.emails) {
			const dbUser = await UserModel.findOne({
				emails: email.value
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

function getUserByUsername(username) {
	return UserModel.findOne({
		username: username
	}).populate({
		path: 'locations'
	}).exec();
}

exports.init = () => {
	passport.serializeUser(async function(user, done) {
		done(null, user._id);
	});

	passport.deserializeUser(async function(userId, done) {
		try {
			if (userCache[userId]) {
				done(null, userCache[userId]);
				return;
			}

			const userModel = await UserModel.findById(userId, { password: 0 }).populate({
				path: 'locations'
			}).exec();
			userCache[userId] = userModel;
			done(null, userModel);
		} catch (e) {
			console.log(e);
			done({
				invalidSession: true
			});
		}
	});

	const LocalStrategy = require('passport-local');
	passport.use(new LocalStrategy(async (username, password, done) => {
		const user = await getUserByEmail({ emails: [{ value: username }] }) || await getUserByUsername(username);

		if (user) {
			crypto.pbkdf2(password, process.env.SALT, 1000, 32, 'sha256', (err, hashedPassword) => {
				if (err) {
					return done(err);
				}

				if (hashedPassword.toString('hex') !== user.password) {
					return done({
						message: 'Forbidden',
						type: 'OAuthException'
					});
				}

				delete user.password;
				done(null, user);
			});
		} else {
			done({
				message: 'Forbidden',
				type: 'OAuthException'
			});
		}
	}));

	const GoogleStrategy = require('passport-google-oidc');
	passport.use(new GoogleStrategy({
			clientID: process.env.GOOGLE_APP_ID,
			clientSecret: process.env.GOOGLE_APP_SECRET,
			callbackURL: `https://${process.env.OWN_HOST}/login/google/callback`
		},
		async function(issuer, profile, done) {
			console.log('google user emails', JSON.stringify(profile.emails));

			const user = await getUserByEmail(profile);

			if (user) {
				delete user.password;
				done(null, user);
			} else {
				done({
					message: 'Forbidden',
					type: 'OAuthException'
				});
			}
		}
	));
}
