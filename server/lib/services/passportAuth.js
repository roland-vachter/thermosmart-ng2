const UserModel = require('../models/User');
const passport = require('passport');

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

function getUserByFacebookId(profile) {
	return UserModel.findOne({
		facebookid: profile?.id
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
			const userModel = await UserModel.findById(userId).populate({
				path: 'locations'
			}).exec();
			done(null, userModel);
		} catch (e) {
			console.log(e);
			done({
				invalidSession: true
			});
		}
	});

	const FacebookStrategy = require('passport-facebook').Strategy;
	passport.use(new FacebookStrategy({
			clientID: process.env.FACEBOOK_APP_ID,
			clientSecret: process.env.FACEBOOK_APP_SECRET,
			callbackURL: `https://${process.env.OWN_HOST}/login/facebook/callback`,
			profileFields: ['id', 'emails', 'name']
		},
		async function(accessToken, refreshToken, profile, done) {
			console.log('facebook user emails', JSON.stringify(profile.emails), 'facebook.id', profile.id, typeof profile.id);

			const user = await getUserByEmail(profile) || await getUserByFacebookId(profile);

			if (user) {
				console.log('user found', user);
				done(null, user);
			} else {
				done({
					message: 'Forbidden',
					type: 'OAuthException'
				});
			}
		})
	);

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
				console.log('user found', user);
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
