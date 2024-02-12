import passport from 'passport';
import { ErrorWithStatus } from '../types/generic';

export const auth = passport.authenticate('local', {
	successRedirect: '/',
	failureRedirect: '/login/password/forbidden'
});

export const forbidden = () => {
	throw new ErrorWithStatus('Forbidden', 403);
};
