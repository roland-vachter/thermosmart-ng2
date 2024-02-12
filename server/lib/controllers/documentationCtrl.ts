import { Request, Response } from 'express';
import { getOutsideConditions } from '../services/outsideConditions';


export default function (req: Request, res: Response) {
	res.render('documentation', {
		title: 'SmartHome',
		backgroundImage: getOutsideConditions().backgroundImage
	});
};
