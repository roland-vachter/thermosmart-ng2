const UserModel = require('../models/User');
const passport = require('passport');

async function getUserByEmail(profile) {
	if (profile?.emails?.length) {
		for (let email of profile?.emails) {
			const dbUser = await UserModel.findOne({
				email: email.value
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
		done(null, user.email);
	});

	passport.deserializeUser(async function(userEmail, done) {
		const userModel = await UserModel.findOne({ email: userEmail });
		done(null, userModel);
	});

	const FacebookStrategy = require('passport-facebook').Strategy;
	passport.use(new FacebookStrategy({
			clientID: process.env.FACEBOOK_APP_ID,
			clientSecret: process.env.FACEBOOK_APP_SECRET,
			callbackURL: `https://${process.env.OWN_HOST}/login/facebook/callback`,
			profileFields: ['id', 'emails', 'name']
		},
		async function(accessToken, refreshToken, profile, done) {
			console.log('user emails', JSON.stringify(profile.emails), 'facebook.id', profile.id, typeof profile.id);

			const user = await getUserByEmail(profile) || await getUserByFacebookId(profile);

			if (user) {
				done(null, user);
			} else {
				done({
					message: 'Forbidden',
					type: 'OAuthException'
				});
			}
		})
	);
}
