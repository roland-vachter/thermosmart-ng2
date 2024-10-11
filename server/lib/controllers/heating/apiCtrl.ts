import { NextFunction, Request, Response } from 'express';
import { RESPONSE_STATUS } from '../../types/generic';
import Temperature, { triggerTemperatureChange } from '../../models/Temperature';
import HeatingDefaultPlan, { triggerHeatingDefaultPlanChange } from '../../models/HeatingDefaultPlan';
import HeatingPlan from '../../models/HeatingPlan';
import HeatingPlanOverrides, { triggerHeatingPlanOverridesChange } from '../../models/HeatingPlanOverrides';
import { getStatisticsByDay, getStatisticsByMonth, getStatisticsByYear, getStatisticsForToday } from '../../services/statistics';
import { getTargetTempByLocation, updateTargetTemp } from '../../services/targetTemp';
import { getAllConfigs } from '../../services/config';
import { getOutsideConditions } from '../../services/outsideConditions';
import { changeSensorSettings as insideConditionsChangeSensorSettings, getLocationBySensorId, getSensors, disableSensorWindowOpen as insideConditionsDisableSensorWindowOpen,
	setSensorInput, toggleSensorStatus as insideConditionsToggleSensorStatus } from '../../services/insideConditions';
import { endIgnoringHoldConditions, getHeatingConditions, getPowerStatus, ignoreHoldConditions, isHeatingOn, togglePower } from '../../services/heating';
import moment from 'moment-timezone';
import { getRestartStatus, initiateRestart } from '../../services/restartSensor';
import { isNumber } from '../../utils/utils';
import SensorSetting, { ISensorSetting } from '../../models/SensorSetting';
import HeatingHistory, { IHeatingHistory } from '../../models/HeatingHistory';
import HeatingSensorHistory, { IHeatingSensorHistory } from '../../models/HeatingSensorHistory';
import { HydratedDocument } from 'mongoose';
import Location from '../../models/Location';
import HeatingHoldConditionHistory, { HeatingHoldConditionTypes, IHeatingHoldConditionHistory } from '../../models/HeatingHoldConditionHistory';


type HeatingHistoryWithSensor = HydratedDocument<IHeatingSensorHistory & { sensor: ISensorSetting }>;

export const initHeating = async (req: Request, res: Response) => {
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

	const [
		temps,
		heatingDefaultPlans,
		heatingPlans,
		heatingPlanOverrides,
		statisticsForToday,
		targetTemp,
		config
	] = await Promise.all([
		Temperature
			.find()
			.lean()
			.exec(),
		HeatingDefaultPlan
			.find()
			.lean()
			.exec(),
		HeatingPlan
			.find()
			.lean()
			.sort({
				displayOrder: 1
			})
			.exec(),
		HeatingPlanOverrides
			.find({
				location
			})
			.sort({
				date: 1
			})
			.lean()
			.exec(),
		getStatisticsForToday(location._id),
		getTargetTempByLocation(location._id),
		getAllConfigs(location._id)
	]);

	res.json({
		status: 'ok',
		data: {
			outside: getOutsideConditions(),
			sensors: getSensors(location._id),
			isHeatingOn: isHeatingOn(location._id),
			heatingPower: {
				status: getPowerStatus(location._id).poweredOn,
				until: getPowerStatus(location._id).until
			},
			heatingConditions: getHeatingConditions(location._id),
			targetTempId: targetTemp ? targetTemp._id : null,
			temperatures: (temps || []).map(t => ({
				...t,
				value: t.values?.find(v => v.location === location._id)?.value || t.defaultValue,
				values: null
			})),
			heatingPlans: heatingPlans || [],
			heatingDefaultPlans: (heatingDefaultPlans || []).map(hdp => ({
				...hdp,
				plan: hdp.plans?.find(p => p.location === location._id)?.plan || hdp.defaultPlan,
				plans: null
			})),
			heatingPlanOverrides: heatingPlanOverrides.map(hp => {
				hp.date = moment(hp.date).tz(location.timezone).startOf('day').valueOf();
				return hp;
			}),
			statisticsForToday,
			restartInProgress: getRestartStatus(),
			config
		}
	});
};

export const tempAdjust = async (req: Request, res: Response) => {
	if (!isNumber(req.body.id) || !isNumber(req.body.value) || !isNumber(req.body.location)) {
		res.status(400).json({
			status: 'error',
			reason: 'Missing or incorrect parameters'
		});
		return;
	}

	const location = parseInt(req.body.location, 10);

	const temp = await Temperature.findOne({
		_id: req.body.id
	})
	.exec();

	if (temp) {
		const valueByLocation = temp.values.find(v => v.location === location);
		if (valueByLocation) {
			valueByLocation.value = parseFloat(req.body.value);
		} else {
			temp.values.push({
				location,
				value: parseFloat(req.body.value)
			});
		}

		await temp.save();

		triggerTemperatureChange(temp._id, location);

		res.json({
			status: 'ok',
			temp
		});
	} else {
		res.json({
			status: 'error',
			reason: 'Temperature was not found'
		});
	}
};

export const changeDefaultPlan = (req: Request, res: Response, next: NextFunction) => {
	if (!isNumber(req.body.dayOfWeek) || !isNumber(req.body.planId) || !isNumber(req.body.location)) {
		res.status(400).json({
			status: 'error',
			reason: 'Missing or incorrect parameters'
		});
		return;
	}

	const location = parseInt(req.body.location, 10);

	HeatingDefaultPlan.findOne({
		dayOfWeek: req.body.dayOfWeek
	})
	.exec()
	.then(async heatingDefaultPlan => {
		if (heatingDefaultPlan) {
			const planByLocation = heatingDefaultPlan.plans.find(v => v.location === location);
			if (planByLocation) {
				planByLocation.plan = parseFloat(req.body.planId);
			} else {
				heatingDefaultPlan.plans.push({
					location,
					plan: parseFloat(req.body.planId)
				});
			}

			await heatingDefaultPlan.save();

			triggerHeatingDefaultPlanChange(heatingDefaultPlan.toObject(), location);
			await updateTargetTemp();

			res.json({
				status: 'ok',
				plan: heatingDefaultPlan
			});
		} else {
			res.json({
				status: 'error',
				reason: 'Heating plan was not found.'
			});
		}
	})
	.catch((e) => {
		console.error(e);
		next(e);
	});
};

export const listHeatingPlanOverride = async (req: Request, res: Response) => {
	if (!req.query.location) {
		return res.status(400).json({
			status: RESPONSE_STATUS.ERROR,
			reason: 'Location parameter is missing'
		});
	}

	const location = parseInt(req.query.location as string, 10);

	const heatingPlanOverrides = await HeatingPlanOverrides.find({
		location
	}).exec();

	res.json({
		status: 'ok',
		data: heatingPlanOverrides
	});
};

export const addOrUpdateHeatingPlanOverride = async (req: Request, res: Response) => {
	if (!req.body.date || !isNumber(req.body.planId) || !isNumber(req.body.location)) {
		res.status(400).json({
			status: 'error',
			reason: 'Date of plan parameters are missing'
		});
		return;
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

	const date = moment(parseInt(req.body.date, 10)).tz(location.timezone).startOf('day');

	await HeatingPlanOverrides
		.findOneAndUpdate({
			date: date.valueOf(),
			location
		}, {
			plan: req.body.planId
		}, {
			upsert: true,
			new: true
		})
		.lean()
		.exec();

	triggerHeatingPlanOverridesChange(location._id);
	await updateTargetTemp();

	return res.json({
		status: 'ok',
	});
};

export const removeHeatingPlanOverride = async (req: Request, res: Response) => {
	if (!req.body.date || !isNumber(req.body.location)) {
		res.status(400).json({
			status: 'Date parameter is missing'
		});
		return;
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

	const date = moment(parseInt(req.body.date, 10)).tz(location.timezone).startOf('day');

	await HeatingPlanOverrides
		.deleteOne({
			date: date.valueOf(),
			location
		})
		.lean()
		.exec();

	triggerHeatingPlanOverridesChange(location._id);
	await updateTargetTemp();

	res.json({
		status: 'ok'
	});
}

export const toggleHeatingPower = async (req: Request, res: Response) => {
	if (!isNumber(req.body.location)) {
		return res.status(400).json({
			status: RESPONSE_STATUS.ERROR,
			reason: 'Location parameter is missing'
		});
	}

	const location = parseInt(req.body.location, 10);

	await togglePower(location);

	res.json({
		status: 'ok',
		data: {
			heatingPower: {
				status: getPowerStatus(location).poweredOn,
				until: getPowerStatus(location).until
			}
		}
	});
};

export const ignoreHeatingHoldConditions = (req: Request, res: Response) => {
	if (!isNumber(req.body.location)) {
		return res.status(400).json({
			status: RESPONSE_STATUS.ERROR,
			reason: 'Location parameter is missing'
		});
	}

	const location = parseInt(req.body.location, 10);

	ignoreHoldConditions(location);
	insideConditionsDisableSensorWindowOpen();

	res.json({
		status: 'ok',
		data: {
			heatingConditions: getHeatingConditions(location)
		}
	});
};

export const endIgnoringHeatingHoldConditions = (req: Request, res: Response) => {
	if (!isNumber(req.body.location)) {
		return res.status(400).json({
			status: RESPONSE_STATUS.ERROR,
			reason: 'Location parameter is missing'
		});
	}

	const location = parseInt(req.body.location, 10);

	endIgnoringHoldConditions(location);

	res.json({
		status: 'ok',
		data: {
			heatingConditions: getHeatingConditions(location)
		}
	});
};

export const disableSensorWindowOpen = (req: Request, res: Response) => {
	if (!isNumber(req.body.location)) {
		return res.status(400).json({
			status: RESPONSE_STATUS.ERROR,
			reason: 'Location parameter is missing'
		});
	}

	const location = parseInt(req.body.location, 10);

	insideConditionsDisableSensorWindowOpen(req.body.id);

	res.json({
		status: 'ok',
		data: {
			sensors: getSensors(location)
		}
	});
}


export const restartSensor = (req: Request, res: Response) => {
	initiateRestart();

	res.json({
		status: 'ok'
	});
};

export const toggleSensorStatus = async (req: Request, res: Response, next: NextFunction) => {
	if (!isNumber(req.body.id)) {
		return res.sendStatus(400);
	}

	const result = await insideConditionsToggleSensorStatus(req.body.id);

	const location = getLocationBySensorId(req.body.id);

	if (!result) {
		next();
	} else {
		res.json({
			status: 'ok',
			data: {
				sensors: location || location === 0 ? getSensors(location) : []
			}
		});
	}
};

export const changeSensorSettings = async (req: Request, res: Response, next: NextFunction) => {
	if (!isNumber(req.body.id) || !req.body.label || !isNumber(req.body.tempadjust) || !isNumber(req.body.humidityadjust)) {
		return res.sendStatus(400);
	}

	const tempAdj = parseFloat(req.body.tempadjust || 0);
	const humidityAdjust = parseInt(req.body.humidityadjust || 0, 10);

	const result = await insideConditionsChangeSensorSettings(req.body.id, {
		label: req.body.label,
		tempAdjust: tempAdj,
		humidityAdjust
	});

	const location = getLocationBySensorId(req.body.id);

	if (!result) {
		next();
	} else {
		res.json({
			status: 'ok',
			data: {
				sensors: location || location === 0 ? getSensors(location) : []
			}
		});
	}
};

export const sensorPolling = async (req: Request, res: Response) => {
	const id = parseInt(req.query.id as string, 10);
	if (!id) {
		return res.json({
			error: 'Sensor ID is missing'
		});
	}

	const sensorSetting = await SensorSetting.findOne({
		_id: id
	}).lean().exec();

	if (!sensorSetting) {
		return res.json({
			error: 'Sensor setting not found'
		});
	}

	await setSensorInput({
		id,
		temperature: parseFloat(req.query.t as string),
		humidity: parseFloat(req.query.h as string)
	});

	setTimeout(() => res.json({
		isHeatingOn: isHeatingOn(sensorSetting.location, sensorSetting.controller),
		restart: getRestartStatus()
	}), 200);
};

export const statistics = async (req: Request, res: Response) => {
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

	const [lastHeatingHistory, heatingForToday, statisticsForLastMonth, statisticsByMonth, statisticsByYear, sensorTempHistory,
		lastFavorableWeatherForecastHistory, favorableWeatherForecastForToday,
		lastIncreasingTrendHistory, increasingTrendForToday,
		lastWindowOpenHistory, windowOpenForToday
	] = await Promise.all([
		HeatingHistory
			.findOne({
				datetime: {
					$lt: new Date(moment().tz(location.timezone).subtract(1, 'day').toISOString())
				},
				location
			})
			.sort({
				datetime: -1
			})
			.exec(),
		HeatingHistory
			.find({
				datetime: {
					$gt: new Date(moment().tz(location.timezone).subtract(1, 'day').toISOString())
				},
				location
			})
			.exec(),
		getStatisticsByDay(location._id, new Date(moment().tz(location.timezone).subtract(1, 'month').toISOString()), new Date(moment().tz(location.timezone).toISOString())),
		getStatisticsByMonth(location._id, new Date(moment('2017-01-01 12:00:00').tz(location.timezone).toISOString()), new Date(moment().tz(location.timezone).toISOString())),
		getStatisticsByYear(location._id, new Date(moment('2017-01-01 12:00:00').tz(location.timezone).toISOString()), new Date(moment().tz(location.timezone).toISOString())),
		HeatingSensorHistory
			.find({
				datetime: {
					$gt: new Date(moment().tz(location.timezone).subtract(1, 'day').toISOString())
				}
			})
			.populate<{ sensor: ISensorSetting }>({
				path: 'sensor'
			})
			.exec()
			.then(result => result.filter(r => r.sensor.location === location._id)),

		HeatingHoldConditionHistory
			.findOne({
				datetime: {
					$lt: new Date(moment().tz(location.timezone).subtract(1, 'day').toISOString())
				},
				type: HeatingHoldConditionTypes.FAVORABLE_WEATHER_FORECAST,
				location
			})
			.sort({
				datetime: -1
			})
			.exec(),
		HeatingHoldConditionHistory
			.find({
				datetime: {
					$gt: new Date(moment().tz(location.timezone).subtract(1, 'day').toISOString())
				},
				type: HeatingHoldConditionTypes.FAVORABLE_WEATHER_FORECAST,
				location
			})
			.exec(),

		HeatingHoldConditionHistory
			.findOne({
				datetime: {
					$lt: new Date(moment().tz(location.timezone).subtract(1, 'day').toISOString())
				},
				type: HeatingHoldConditionTypes.INCREASING_TREND,
				location
			})
			.sort({
				datetime: -1
			})
			.exec(),
		HeatingHoldConditionHistory
			.find({
				datetime: {
					$gt: new Date(moment().tz(location.timezone).subtract(1, 'day').toISOString())
				},
				type: HeatingHoldConditionTypes.INCREASING_TREND,
				location
			})
			.exec(),

		HeatingHoldConditionHistory
			.findOne({
				datetime: {
					$lt: new Date(moment().tz(location.timezone).subtract(1, 'day').toISOString())
				},
				type: HeatingHoldConditionTypes.WINDOW_OPEN,
				location
			})
			.sort({
				datetime: -1
			})
			.exec(),
		HeatingHoldConditionHistory
			.find({
				datetime: {
					$gt: new Date(moment().tz(location.timezone).subtract(1, 'day').toISOString())
				},
				type: HeatingHoldConditionTypes.WINDOW_OPEN,
				location
			})
			.exec(),
	]);

	heatingForToday.unshift({
		datetime: new Date(moment().tz(location.timezone).subtract(1, 'day').toISOString()),
		status: lastHeatingHistory ? lastHeatingHistory.status : false
	} as HydratedDocument<IHeatingHistory>);
	heatingForToday.push({
		datetime: new Date(moment().tz(location.timezone).toISOString()),
		status: heatingForToday.length ? heatingForToday[heatingForToday.length - 1].status : false
	} as HydratedDocument<IHeatingHistory>);

	favorableWeatherForecastForToday.unshift({
		datetime: new Date(moment().tz(location.timezone).subtract(1, 'day').toISOString()),
		status: lastFavorableWeatherForecastHistory ? lastFavorableWeatherForecastHistory.status : false
	} as HydratedDocument<IHeatingHoldConditionHistory>);
	favorableWeatherForecastForToday.push({
		datetime: new Date(moment().tz(location.timezone).toISOString()),
		status: favorableWeatherForecastForToday.length ? favorableWeatherForecastForToday[favorableWeatherForecastForToday.length - 1].status : false
	} as HydratedDocument<IHeatingHoldConditionHistory>);

	increasingTrendForToday.unshift({
		datetime: new Date(moment().tz(location.timezone).subtract(1, 'day').toISOString()),
		status: lastIncreasingTrendHistory ? lastIncreasingTrendHistory.status : false
	} as HydratedDocument<IHeatingHoldConditionHistory>);
	increasingTrendForToday.push({
		datetime: new Date(moment().tz(location.timezone).toISOString()),
		status: increasingTrendForToday.length ? increasingTrendForToday[increasingTrendForToday.length - 1].status : false
	} as HydratedDocument<IHeatingHoldConditionHistory>);

	windowOpenForToday.unshift({
		datetime: new Date(moment().tz(location.timezone).subtract(1, 'day').toISOString()),
		status: lastWindowOpenHistory ? lastWindowOpenHistory.status : false
	} as HydratedDocument<IHeatingHoldConditionHistory>);
	windowOpenForToday.push({
		datetime: new Date(moment().tz(location.timezone).toISOString()),
		status: windowOpenForToday.length ? windowOpenForToday[windowOpenForToday.length - 1].status : false
	} as HydratedDocument<IHeatingHoldConditionHistory>);

	const lastHistoryBySensor: HeatingHistoryWithSensor[] = [];
	sensorTempHistory.forEach(sth => {
		const historyFound = lastHistoryBySensor.find(s => s.sensor._id === sth.sensor._id);
		if (!historyFound) {
			lastHistoryBySensor.push(sth as HeatingHistoryWithSensor);
		} else {
			lastHistoryBySensor.splice(lastHistoryBySensor.indexOf(historyFound), 1);
			lastHistoryBySensor.push(sth as HeatingHistoryWithSensor);
		}
	});

	lastHistoryBySensor.forEach(history => {
		sensorTempHistory.push({
			...history.toObject(),
			datetime: new Date()
		});
	});


	return res.json({
		status: 'ok',
		data: {
			heatingForToday,
			heatingConditionsForToday: {
				[HeatingHoldConditionTypes.FAVORABLE_WEATHER_FORECAST]: favorableWeatherForecastForToday,
				[HeatingHoldConditionTypes.INCREASING_TREND]: increasingTrendForToday,
				[HeatingHoldConditionTypes.WINDOW_OPEN]: windowOpenForToday
			},
			statisticsForLastMonth,
			statisticsByMonth,
			statisticsByYear,
			sensorTempHistory
		}
	});
};
