import { NextFunction, Request, Response } from 'express';
import Location from '../../models/Location';
import { RESPONSE_STATUS } from '../../types/generic';
import { getStatusByLocation, updateRunningRadiators } from '../../services/solarSystemHeating';

export const statusAndUpdate = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.query.location) {
		return res.status(400).json({
			status: RESPONSE_STATUS.ERROR,
			reason: 'Location parameter is missing'
		});
	}

	const location = await Location
		.findOne({
			_id: parseInt(req.query.location as string, 10)
		})
		.exec();

	if (!location) {
		return res.status(400).json({
			status: RESPONSE_STATUS.ERROR,
			reason: 'Location not found'
		});
	}

	let numberOfRunningRadiators = 0;
	let numberOfRadiators = 0;
	if (req.query.runningradiators && req.query.radiators) {
		numberOfRunningRadiators = parseInt(req.query.runningradiators as string, 10);
		numberOfRadiators = parseInt(req.query.radiators as string, 10);
	}

	await updateRunningRadiators(location.id, numberOfRadiators, numberOfRunningRadiators);

  try {
    res.json({
      status: 'ok',
      data: await getStatusByLocation(location.id)
    });
  } catch (e) {
    console.error(e);
    next(e);
  }
}
