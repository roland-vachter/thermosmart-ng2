import passport from 'passport';
import { ErrorWithStatus } from '../types/generic';


export const auth = passport.authenticate('google', {
	scope: ['email']
});

export const callback = passport.authenticate('google', {
	successRedirect: '/',
	failureRedirect: '/login/google/forbidden'
});

export const forbidden = () => {
	throw new ErrorWithStatus('Forbidden', 403);
};
