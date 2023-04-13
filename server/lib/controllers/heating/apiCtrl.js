const outsideConditions = require('../../services/outsideConditions');
const insideConditions = require('../../services/insideConditions');
const Temperature = require('../../models/Temperature');
const HeatingPlan = require('../../models/HeatingPlan');
const HeatingDefaultPlan = require('../../models/HeatingDefaultPlan');
const HeatingHistory = require('../../models/HeatingHistory');
const heatingService = require('../../services/heating');
const statisticsService = require('../../services/statistics');
const restartSensorService = require('../../services/restartSensor');
const configService = require('../../services/config');
const targetTempService = require('../../services/targetTemp');
const SensorSetting = require('../../models/SensorSetting');
const HeatingSensorHistory = require('../../models/HeatingSensorHistory');
const types = require('../../utils/types');

const moment = require('moment-timezone');
const HeatingPlanOverrides = require('../../models/HeatingPlanOverrides');

exports.init = function (req, res, next) {
	if (!req.query.location) {
		return res.status(400).json({
			status: types.RESPONSE_STATUS.ERROR,
			reason: 'Location parameter is missing'
		});
	}

	const location = parseInt(req.query.location, 10);

	Promise.all([
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
				location: location
			})
			.sort({
				date: 1
			})
			.lean()
			.exec(),
		statisticsService
			.getStatisticsForToday(location),
		targetTempService.get(location),
		configService.getAll(location)
	]).then(([
				temps,
				heatingDefaultPlans,
				heatingPlans,
				heatingPlanOverrides,
				statisticsForToday,
				targetTemp,
				config
			]) => {

		res.json({
			status: 'ok',
			data: {
				outside: outsideConditions.get(),
				sensors: insideConditions.get(location),
				isHeatingOn: heatingService.isHeatingOn(location),
				heatingPower: {
					status: heatingService.getPowerStatus(location).poweredOn,
					until: heatingService.getPowerStatus(location).until
				},
				targetTempId: targetTemp ? targetTemp._id : null,
				temperatures: (temps || []).map(t => ({
					...t,
					value: t.values?.find(v => v.location === location)?.value || t.defaultValue,
					values: null
				})),
				heatingPlans: heatingPlans || [],
				heatingDefaultPlans: (heatingDefaultPlans || []).map(hdp => ({
					...hdp,
					plan: hdp.plans?.find(p => p.location === location)?.plan || hdp.defaultPlan,
					plans: null
				})),
				heatingPlanOverrides: heatingPlanOverrides.map(hp => {
					hp.date = moment(hp.date).tz('Europe/Bucharest').startOf('day').valueOf();
					return hp;
				}),
				statisticsForToday: statisticsForToday,
				restartInProgress: restartSensorService.getStatus(),
				config: config
			}
		});
	}).catch((err) => {
		console.error(err);
		next(err);
	});
};

exports.tempAdjust = function (req, res, next) {
	if (isNaN(req.body.id) || isNaN(req.body.value) || !req.body.location) {
		res.status(400).json({
			status: 'error',
			reason: 'Missing or incorrect parameters'
		});
		return;
	}

	const location = parseInt(req.body.location, 10);

	Temperature.findOne({
		_id: req.body.id
	})
	.exec()
	.then(async temp => {
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

			Temperature.triggerChange(temp._id, location);

			res.json({
				status: 'ok',
				temp: temp
			});
		} else {
			res.json({
				status: 'error',
				reason: 'Temperature was not found'
			});
		}
	})
	.catch(next);
};

exports.changeDefaultPlan = function (req, res, next) {
	if (isNaN(req.body.dayOfWeek) || isNaN(req.body.planId) || !req.body.location) {
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

			HeatingDefaultPlan.triggerChange(heatingDefaultPlan.toObject(), location);
			targetTempService.update();

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
	.catch(next);
};

exports.listHeatingPlanOverride = async (req, res) => {
	if (!req.query.location) {
		return res.status(400).json({
			status: types.RESPONSE_STATUS.ERROR,
			reason: 'Location parameter is missing'
		});
	}

	const location = parseInt(req.query.location, 10);

	try {
		const heatingPlanOverrides = await HeatingPlanOverrides.find({
			location: location
		}).exec();

		res.json({
			status: 'ok',
			data: heatingPlanOverrides
		});
	} catch(e) {
		console.error(e);
		res.json({
			status: 'error',
			reason: e.message
		})
	}
};

exports.addOrUpdateHeatingPlanOverride = (req, res) => {
	if (!req.body.date || !req.body.planId || !req.body.location) {
		res.status(400).json({
			status: 'error',
			reason: 'Date of plan parameters are missing'
		});
		return;
	}

	const location = parseInt(req.body.location, 10);

	const date = moment(parseInt(req.body.date, 10)).tz('Europe/Bucharest').startOf('day');

	HeatingPlanOverrides.findOneAndUpdate({
		date: date.valueOf(),
		location: location
	}, {
		plan: req.body.planId
	}, {
		upsert: true,
		new: true
	})
	.lean()
	.exec()
	.catch(err => {
		console.error(err);
		return res.json({
			status: 'error',
			reason: err.message
		});
	})
	.then(doc => {
		HeatingPlanOverrides.triggerChange(location);
		targetTempService.update();

		return res.json({
			status: 'ok',
		});
	});
};

exports.removeHeatingPlanOverride = (req, res) => {
	if (!req.body.date || !req.body.location) {
		res.status(400).json({
			status: 'Date parameter is missing'
		});
		return;
	}

	const location = parseInt(req.body.location, 10);

	const date = moment(parseInt(req.body.date, 10)).tz('Europe/Bucharest').startOf('day');

	HeatingPlanOverrides
		.deleteOne({
			date: date.valueOf(),
			location
		})
		.lean()
		.exec()
		.catch(err => {
			console.error(err);
			return res.json({
				status: 'error',
				reason: err.message
			});
		})
		.then(() => {
			HeatingPlanOverrides.triggerChange(location);
			targetTempService.update();

			res.json({
				status: 'ok'
			});
		});
}

exports.toggleHeatingPower = (req, res) => {
	if (!req.body.location) {
		return res.status(400).json({
			status: types.RESPONSE_STATUS.ERROR,
			reason: 'Location parameter is missing'
		});
	}

	const location = parseInt(req.body.location, 10);

	heatingService.togglePower(location);

	res.json({
		status: 'ok',
		data: {
			heatingPower: {
				status: heatingService.getPowerStatus(location).poweredOn,
				until: heatingService.getPowerStatus(location).until
			}
		}
	});
};

exports.disableSensorWindowOpen = (req, res) => {
	if (!req.body.location) {
		return res.status(400).json({
			status: types.RESPONSE_STATUS.ERROR,
			reason: 'Location parameter is missing'
		});
	}

	const location = parseInt(req.body.location, 10);

	insideConditions.disableSensorWindowOpen(req.body.id);

	res.json({
		status: 'ok',
		data: {
			sensors: insideConditions.get(insideConditions.getLocationById(req.body.id))
		}
	});
}


exports.restartSensor = (req, res) => {
	restartSensorService.initiate();

	res.json({
		status: 'ok'
	});
};

exports.toggleSensorStatus = async (req, res, next) => {
	if (!req.body.id) {
		return res.sendStatus(400);
	}

	const result = await insideConditions.toggleSensorStatus(req.body.id);

	if (!result) {
		next();
	} else {
		res.json({
			status: 'ok',
			data: {
				sensors: insideConditions.get(insideConditions.getLocationById(req.body.id))
			}
		});
	}
};

exports.changeSensorSettings = async (req, res, next) => {
	try {
		if (!req.body.id || !req.body.label || !req.body.hasOwnProperty('tempadjust') || !req.body.hasOwnProperty('humidityadjust')) {
			return res.sendStatus(400);
		}

		const tempAdjust = parseFloat(req.body.tempadjust || 0);
		const humidityAdjust = parseInt(req.body.humidityadjust || 0, 10);

		const result = await insideConditions.changeSensorSettings(req.body.id, {
			label: req.body.label,
			tempAdjust,
			humidityAdjust
		});

		if (!result) {
			next();
		} else {
			res.json({
				status: 'ok',
				data: {
					sensors: insideConditions.get(insideConditions.getLocationById(req.body.id))
				}
			});
		}
	} catch (err) {
		next(err);
	}
};

exports.sensorPolling = async (req, res) => {
	const id = req.query.id;
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

	insideConditions.set({
		id: id,
		temperature: parseFloat(req.query.t),
		humidity: parseFloat(req.query.h)
	});

	setTimeout(() => res.json({
		isHeatingOn: heatingService.isHeatingOn(sensorSetting.location, sensorSetting.controller),
		restart: restartSensorService.getStatus()
	}), 200);
};

exports.statistics = async (req, res) => {
	if (!req.query.location) {
		return res.status(400).json({
			status: types.RESPONSE_STATUS.ERROR,
			reason: 'Location parameter is missing'
		});
	}

	const location = parseInt(req.query.location, 10);

	const [statisticsForToday, statisticsForLastMonth, statisticsByMonth, sensorTempHistory] = await Promise.all([
		HeatingHistory
			.find({
				datetime: {
					$gt: new Date(moment().tz('Europe/Bucharest').subtract(1, 'day'))
				},
				location: location
			})
			.exec(),
		statisticsService
			.getStatisticsByDay(location, new Date(moment().tz('Europe/Bucharest').subtract(1, 'month')), new Date(moment().tz('Europe/Bucharest'))),
		statisticsService
			.getStatisticsByMonth(location, new Date(moment('2017-01-01 12:00:00').tz('Europe/Bucharest')), new Date(moment().tz('Europe/Bucharest'))),
		HeatingSensorHistory
			.find({
				datetime: {
					$gt: new Date(moment().tz('Europe/Bucharest').subtract(1, 'day'))
				}
			})
			.populate({
				path: 'sensor'
			})
			.exec()
			.then(result => result.filter(r => r.sensor.location === location))
	]);

	statisticsForToday.unshift({
		datetime: new Date(moment().tz('Europe/Bucharest').subtract(1, 'day')),
		status: statisticsForToday[0] ? !statisticsForToday[0].status : false
	});
	statisticsForToday.push({
		datetime: new Date(moment().tz('Europe/Bucharest')),
		status: statisticsForToday.length ? statisticsForToday[statisticsForToday.length - 1].status : false
	});

	const lastHistoryBySensor = [];
	sensorTempHistory.forEach(sth => {
		const historyFound = lastHistoryBySensor.find(s => s.sensor._id === sth.sensor._id);
		if (!historyFound) {
			lastHistoryBySensor.push(sth);
		} else {
			lastHistoryBySensor.splice(lastHistoryBySensor.indexOf(historyFound), 1);
			lastHistoryBySensor.push(sth);
		}
	});

	lastHistoryBySensor.forEach(history => {
		sensorTempHistory.push({
			...history,
			datetime: Date.now()
		});
	});


	return res.json({
		status: 'ok',
		data: {
			statisticsForToday,
			statisticsForLastMonth,
			statisticsByMonth,
			sensorTempHistory
		}
	});
};
