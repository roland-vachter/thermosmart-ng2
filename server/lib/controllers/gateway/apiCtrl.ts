import { Request, Response } from 'express';
import { RESPONSE_STATUS } from '../../types/generic';
import Location from '../../models/Location';
import * as gatewayService from '../../services/gateway';

export async function init(req: Request, res: Response) {
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

  res.json({
    status: RESPONSE_STATUS.OK,
		data: {
      gateway: await gatewayService.getStatus(location._id)
    }
  });
};

export async function reset(req: Request, res: Response) {
  if (!req.body.location) {
    return res.status(400).json({
      status: RESPONSE_STATUS.ERROR,
      reason: 'Location parameter is missing'
    });
  }

  const location = await Location
    .findOne({
      _id: parseInt(req.body.location as string, 10)
    })
    .exec();

  if (!location) {
    return res.status(400).json({
      status: RESPONSE_STATUS.ERROR,
      reason: 'Location not found'
    });
  }

  await gatewayService.reset(location._id);

  res.json({
    status: RESPONSE_STATUS.OK,
    data: {
      gateway: await gatewayService.getStatus(location._id)
    }
  });
}

export async function updateStatus(req: Request, res: Response) {
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

  await gatewayService.updateStatus(location._id, req.query.wasReset === 'true');
  const status = await gatewayService.getStatus(location._id);

  if (status.resetInitialized) {
    await gatewayService.markReset(location._id);
  }

  res.json({
    status: RESPONSE_STATUS.OK,
    data: {
      gateway: status
    }
  });
}
