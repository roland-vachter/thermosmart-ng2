import { NextFunction, Request, Response } from 'express';
import { ErrorWithStatus } from '../types/generic';

const apiKey = process.env.API_KEY;

export default function (req: Request, res: Response, next: NextFunction) {
	if (req.query?.apiKey === apiKey ||
			req.body?.apiKey === apiKey ||
			req.headers['X-API-KEY'] === apiKey) {
		next();
	} else {
		const err = new ErrorWithStatus('Forbidden', 403);
		next(err);
	}
};
