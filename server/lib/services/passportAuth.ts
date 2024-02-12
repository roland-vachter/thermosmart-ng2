import User, { IUser } from '../models/User';
import passport from 'passport';
import crypto from 'crypto';
import { HydratedDocument } from 'mongoose';
import { Strategy as GoogleStrategy} from 'passport-google-oauth20';
import { Strategy as LocalStrategy} from 'passport-local';

interface UserProfile {
	emails?: {
		value: string;
	}[];
}

interface LoginError {
	message: string;
	type: string;
}

const userCache: Record<string, HydratedDocument<IUser>> = {};

async function getUserByEmail(profile: UserProfile) {
	if (profile?.emails?.length) {
		for (const email of profile?.emails) {
			const dbUser = await User.findOne({
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

function getUserByUsername(username: string) {
	return User.findOne({
		username
	}).populate({
		path: 'locations'
	}).exec();
}

export const init = () => {
	passport.serializeUser((user, done) => {
		const u = user as unknown as HydratedDocument<IUser>;
		done(null, u._id);
	});

	passport.deserializeUser<string>(async (userId, done) => {
		try {
			if (userCache[userId]) {
				done(null, userCache[userId]);
				return;
			}

			const user = await User.findById(userId, { password: 0 }).populate({
				path: 'locations'
			}).exec();
			if (user) {
				userCache[userId] = user;
				done(null, User);
			} else {
				throw new Error('User session not found');
			}
		} catch (e) {
			console.log(e);
			done({
				invalidSession: true
			});
		}
	});

	passport.use(new LocalStrategy(async (username, password, done: (err: Error | LoginError | null, user?: HydratedDocument<IUser>) => void) => {
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


	passport.use(new GoogleStrategy({
			clientID: process.env.GOOGLE_APP_ID,
			clientSecret: process.env.GOOGLE_APP_SECRET,
			callbackURL: `https://${process.env.OWN_HOST}/login/google/callback`
		},
		async (accessToken, refreshToken, profile, done) => {
			console.log('google user emails', JSON.stringify(profile.emails));

			const user = await getUserByEmail(profile);

			if (user) {
				delete user.password;
				done(null, user);
			} else {
				done({
					message: 'Forbidden',
					type: 'OAuthException'
				} as unknown as Error);
			}
		}
	));
}
