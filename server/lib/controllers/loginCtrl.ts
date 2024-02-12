import { Request, Response } from 'express';

export default function (req: Request, res: Response) {
	if (req.isAuthenticated()) {
		res.redirect('/');
		return;
	}

	res.render('login', {
		title: 'SmartHome'
	});
};
