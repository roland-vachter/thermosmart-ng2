import { NextFunction, Request, Response } from 'express';
import Location from '../../models/Location';
import { RESPONSE_STATUS } from '../../types/generic';
import { getStatusByLocation, updateRadiatorConsumption } from '../../services/solarSystemHeating';

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

	if (req.query.watthourconsumption && req.query.numberofradiators) {
		await updateRadiatorConsumption(location.id, parseInt(req.query.numberofradiators as string, 10), parseInt(req.query.watthourconsumption as string, 10));
	}

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
