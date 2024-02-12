import { Request, Response } from 'express';
import { RESPONSE_STATUS } from '../../types/generic';
import { getAlarmTriggeredCount, getLastArmedDate, getLastMovementDate, getSecurityStatus, movementDetected, toggleArm as securityToggleArm } from '../../services/securityStatus';
import { motionSensor, securityCamera, securityController, securityKeypad } from '../../services/securityHealth';


export const toggleArm = async (req: Request, res: Response) => {
	if (!req.body.location && !req.query.id) {
		return res.status(400).json({
			status: RESPONSE_STATUS.ERROR,
			reason: 'Location or ID parameter is missing'
		});
	}

	const location = req.body.location ? parseInt(req.body.location, 10) : await securityController.getLocationByControllerId(parseInt(req.query.id as string, 10));

	if (location) {
		await securityToggleArm(location);

		res.json({
			status: RESPONSE_STATUS.OK,
			data: {
				security: {
					status: getSecurityStatus(location)
				}
			}
		});
	} else {
		return res.status(400).json({
			status: RESPONSE_STATUS.ERROR,
			reason: 'Location not found for ID parameter'
		});
	}
};

export const status = async (req: Request, res: Response) => {
	if (!req.query.id) {
		return res.status(400).json({
			status: RESPONSE_STATUS.ERROR,
			reason: 'ID parameter is missing'
		});
	}

	const location = await securityController.getLocationByControllerId(parseInt(req.query.id as string, 10));

	if (location) {
		res.json({
			status: RESPONSE_STATUS.OK,
			data: {
				security: {
					status: getSecurityStatus(location)
				}
			}
		});
	} else {
		return res.status(400).json({
			status: RESPONSE_STATUS.ERROR,
			reason: 'Location not found for ID parameter'
		});
	}
};

export const init = (req: Request, res: Response) => {
	if (!req.query.location) {
		return res.status(400).json({
			status: RESPONSE_STATUS.ERROR,
			reason: 'Location parameter is missing'
		});
	}

	const location = parseInt(req.query.location as string, 10);

	res.json({
		status: RESPONSE_STATUS.OK,
		data: {
			security: {
				status: getSecurityStatus(location),
				lastActivity: getLastMovementDate(location)?.getTime(),
				lastArmedAt: getLastArmedDate(location)?.getTime(),
				alarmTriggeredCount: getAlarmTriggeredCount(location),
				cameraHealth: securityCamera.getHealth(location),
				controllerHealth: securityController.getHealth(location),
				keypadHealth: securityKeypad.getHealth(location),
				motionSensorHealth: motionSensor.getHealth(location)
			}
		}
	});
};



export const movement = async (req: Request, res: Response) => {
	if (!req.query.id) {
		return res.status(400).json({
			status: RESPONSE_STATUS.ERROR,
			reason: 'ID parameter is missing'
		});
	}

	const location = await securityController.getLocationByControllerId(parseInt(req.query.id as string, 10));
	if (location) {
		await movementDetected(location);

		res.json({
			status: getSecurityStatus(location)
		});
	} else {
		res.status(400).json({
			status: RESPONSE_STATUS.ERROR,
			reason: 'Location not found by ID parameter'
		})
	}
};
