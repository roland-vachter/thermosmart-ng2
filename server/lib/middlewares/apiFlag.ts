import { NextFunction, Response } from 'express';
import { RequestWithFlags } from '../types/generic';

export default function (req: RequestWithFlags, res: Response, next: NextFunction) {
	req.apiCall = true;
	next();
};
