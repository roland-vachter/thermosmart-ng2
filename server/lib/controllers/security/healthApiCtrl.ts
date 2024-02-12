import { Request, Response } from 'express';
import { RESPONSE_STATUS } from '../../types/generic';
import { motionSensor as securityHealthMotionSensor, securityCamera, securityController, securityKeypad } from '../../services/securityHealth';

export const camera = {
	add: async (req: Request, res: Response) => {
		if (!req.body.ip) {
			return res.status(400).json({
				status: RESPONSE_STATUS.ERROR,
				reason: 'IP parameter is missing'
			});
		}

		if (!req.body.location) {
			return res.status(400).json({
				status: RESPONSE_STATUS.ERROR,
				reason: 'Location parameter is missing'
			});
		}

		const location = parseInt(req.body.location, 10);

		const exists = await securityCamera.ipExists(req.body.ip, location);
		if (exists) {
			res.json({
				status: RESPONSE_STATUS.ERROR,
				reason: 'IP already exists'
			})
		} else {
			await securityCamera.add(req.body.ip, location);
			res.json({
				status: RESPONSE_STATUS.OK
			});
		}
	},
	remove: async (req: Request, res: Response) => {
		if (!req.body.ip) {
			return res.status(400).json({
				status: RESPONSE_STATUS.ERROR,
				reason: 'IP parameter is missing'
			});
		}

		if (!req.body.location) {
			return res.status(400).json({
				status: RESPONSE_STATUS.ERROR,
				reason: 'Location parameter is missing'
			});
		}

		const location = parseInt(req.body.location, 10);

		await securityCamera.remove(req.body.ip, location);
		res.json({
			status: RESPONSE_STATUS.OK
		});
	},
	list: async (req: Request, res: Response) => {
		if (!req.query.location) {
			return res.status(400).json({
				status: RESPONSE_STATUS.ERROR,
				reason: 'Location parameter is missing'
			});
		}

		const location = parseInt(req.query.location as string, 10);

		res.json(await securityCamera.list(location));
	},
	listIps: async (req: Request, res: Response) => {
		if (!req.query.id) {
			return res.status(400).json({
				status: RESPONSE_STATUS.ERROR,
				reason: 'ID parameter is missing'
			});
		}

		const location = await securityController.getLocationByControllerId(parseInt(req.query.id as string, 10));

		res.json({
			ips: location || location === 0 ? await securityCamera.listIPs(location) : []
		});
	},
	reportHealth: async (req: Request, res: Response) => {
		if (!req.query.ip || !req.query.health || !req.query.id) {
			return res.status(400).json({
				status: RESPONSE_STATUS.ERROR,
				reason: 'IP, health or ID parameter is missing'
			});
		}

		await securityCamera.reportHealth(parseInt(req.query.id as string, 10), req.query.ip as string, req.query.health === 'true' || req.query.health === 'true');

		res.json({
			status: RESPONSE_STATUS.OK
		});
	},
	reportMovement: async (req: Request, res: Response) => {
		if (!req.query.id) {
			return res.status(400).json({
				status: RESPONSE_STATUS.ERROR,
				reason: 'ID parameter is missing'
			});
		}

		const location = await securityController.getLocationByControllerId(parseInt(req.query.id as string, 10));

		if (location || location === 0) {
			securityCamera.reportMovement(parseInt(req.query.id as string, 10), location);
		}

		res.sendStatus(200);
	}
};



export const controller = {
	add: async (req: Request, res: Response) => {
		if (!req.body.id) {
			return res.status(400).json({
				status: RESPONSE_STATUS.ERROR,
				reason: 'ID parameter is missing'
			});
		}

		if (!req.body.location) {
			return res.status(400).json({
				status: RESPONSE_STATUS.ERROR,
				reason: 'Location parameter is missing'
			});
		}

		const location = parseInt(req.body.location, 10);

		const exists = await securityController.idExists(req.body.id);
		if (exists) {
			res.json({
				status: RESPONSE_STATUS.ERROR,
				reason: 'ID already exists'
			})
		} else {
			await securityController.add(req.body.id, location);
			res.json({
				status: RESPONSE_STATUS.OK
			});
		}
	},
	remove: async (req: Request, res: Response) => {
		if (!req.body.id) {
			return res.status(400).json({
				status: RESPONSE_STATUS.ERROR,
				reason: 'ID parameter is missing'
			});
		}

		await securityController.remove(req.body.id);
		res.json({
			status: RESPONSE_STATUS.OK
		});
	},
	list: async (req: Request, res: Response) => {
		if (!req.query.location) {
			return res.status(400).json({
				status: RESPONSE_STATUS.ERROR,
				reason: 'Location parameter is missing'
			});
		}

		const location = parseInt(req.query.location as string, 10);

		res.json(await securityController.list(location));
	},
	reportHealth: async (req: Request, res: Response) => {
		if (!req.query.id) {
			return res.status(400).json({
				status: RESPONSE_STATUS.ERROR,
				reason: 'ID parameter is missing'
			});
		}

		await securityController.reportHealth(parseInt(req.query.id as string, 10));

		res.json({
			status: RESPONSE_STATUS.OK
		});
	}
};

export const keypad = {
	reportHealth: async (req: Request, res: Response) => {
		if (!req.query.health || !req.query.id) {
			return res.status(400).json({
				status: RESPONSE_STATUS.ERROR,
				reason: 'ID or health parameter is missing'
			});
		}

		await securityKeypad.reportHealth(parseInt(req.query.id as string, 10), req.query.health === 'true' || req.query.health === 'true');

		res.json({
			status: RESPONSE_STATUS.OK
		});
	}
}

export const motionSensor = {
	reportHealth: async (req: Request, res: Response) => {
		if (!req.query.health || !req.query.id) {
			return res.status(400).json({
				status: RESPONSE_STATUS.ERROR,
				reason: 'ID or health parameter is missing'
			});
		}

		await securityHealthMotionSensor.reportHealth(req.query.id as string, req.query.health === 'true' || req.query.health === 'true');

		res.json({
			status: RESPONSE_STATUS.OK
		});
	}
};
