import { Request, Response } from 'express';
import { RESPONSE_STATUS } from '../types/generic';
import { getConfig as getConfigItem, setConfig } from '../services/config';


// exports.plantWateringInit = async (req: Request, res: Response) => {
// 	res.json({
// 		status: 'ok',
// 		data: {
// 			plantWatering: {
// 				status: getPlantWateringStatus()
// 			}
// 		}
// 	});
// };

// exports.plantWateringSensor = async (req: Request, res: Response) => {
// 	if (!req.query.id || !req.query.status) {
// 		return res.status(400).json({
// 			status: 'error',
// 			reason: 'id or status parameters missing'
// 		});
// 	}

// 	if (req.query.status === PLANT_WATERING_STATUS.WET.toString()) {
// 		plantWateringService.changeStatus(req.query.id, true);
// 	} else if (req.query.status === PLANT_WATERING_STATUS.DRY.toString()) {
// 		plantWateringService.changeStatus(req.query.id, false);
// 	}

// 	res.json({
// 		status: 'ok'
// 	});
// };


export const log = (req: Request, res: Response) => {
	if (!req.body.id || !req.body.log) {
		return res.status(400).json({
			status: 'error',
			reason: 'id or log parameter is missing'
		});
	}

	let level: string = 'LOG';
	if (req.body.level && ['LOG', 'WARN', 'ERROR'].includes(req.body.level)) {
		level = req.body.level as string;
	}

	let fn = console.log;
	switch(level) {
		case 'LOG':
			fn = console.log;
			break;
		case 'WARN':
			fn = console.warn;
			break;
		case 'ERROR':
			fn = console.error;
			break;
	}

	fn.call(this, `>>> ID=${req.body.id} || ${level} || ${req.body.log} |`);

	res.sendStatus(200);
}

export const changeConfig = async (req: Request, res: Response) => {
	if (!req.body.name || !req.body.value || !req.body.location) {
		return res.status(400).json({
			status: RESPONSE_STATUS.ERROR,
			reason: 'name, value or location parameter is missing'
		});
	}

	const location = parseInt(req.body.location, 10);

	try {
		await setConfig(req.body.name, req.body.value, location);
		res.json({
			status: 'ok'
		});
	} catch(e: any) {
		console.error(e);
		res.json({
			status: 'error',
			error: e.message as string
		});
	}
};

export const getConfig = async (req: Request, res: Response) => {
	if (!req.query.name || !req.query.location) {
		return res.status(400).json({
			status: RESPONSE_STATUS.ERROR,
			reason: 'name or location parameter is missing'
		});
	}

	const location = parseInt(req.query.location as string, 10);

	try {
		const configItem = await getConfigItem(req.query.name as string, location);
		res.json(configItem?.value);
	} catch(e: any) {
		console.error(e);
		res.json({
			status: 'error',
			error: e.message as string
		});
	}
}



export const initUser = (req: Request, res: Response) => {
	if (!req.user) {
		return res.json({
			status: 'error',
			error: 'No saved user found.'
		})
	}

	res.json({
		status: 'ok',
		data: {
			user: req.user
		}
	});
}
