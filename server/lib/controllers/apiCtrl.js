const outsideConditions = require('../services/outsideConditions');
const insideConditions = require('../services/insideConditions');
const Temperature = require('../models/Temperature');
const HeatingPlan = require('../models/HeatingPlan');
const HeatingDefaultPlan = require('../models/HeatingDefaultPlan');
const HeatingHistory = require('../models/HeatingHistory');
const heatingService = require('../services/heating');
const statisticsService = require('../services/statistics');
const restartSensorService = require('../services/restartSensor');
const security = require('../services/security');
const configService = require('../services/config');
const SecurityMovementHistory = require('../models/SecurityMovementHistory');
const SecurityArmingHistory = require('../models/SecurityArmingHistory');
const plantWateringService = require('../services/plantWatering');


const moment = require('moment-timezone');

exports.init = function (req, res, next) {
	Promise.all([
		Temperature
			.find()
			.exec(),
		HeatingDefaultPlan
			.find()
			.exec(),
		HeatingPlan
			.find()
			.sort({
				displayOrder: 1
			})
			.exec(),
		statisticsService
			.getStatisticsForToday(),
		configService.getAll()
	]).then(results => {
		const [
			temps,
			heatingDefaultPlans,
			heatingPlans,
			statisticsForToday,
			config
		] = results;

		res.json({
			status: 'ok',
			data: {
				outside: outsideConditions.get(),
				sensors: insideConditions.get(),
				isHeatingOn: heatingService.isHeatingOn(),
				temperatures: temps,
				heatingPlans: heatingPlans,
				heatingDefaultPlans: heatingDefaultPlans,
				statisticsForToday: statisticsForToday,
				security: {
					status: security.getStatus()
				},
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
	if (isNaN(req.body.id) || isNaN(req.body.value)) {
		res.sendStatus(400).json({
			status: 'error',
			message: 'Missing or incorrect parameters'
		});
		return;
	}

	Temperature.findOneAndUpdate({
		_id: req.body.id
	}, {
		value: parseFloat(req.body.value)
	}, {
		new: true
	})
	.exec()
	.then(temp => {
		if (temp) {
			Temperature.triggerChange(temp._id);

			res.json({
				status: 'ok',
				temp: temp
			});
		} else {
			res.json({
				status: 'error',
				message: 'Temperature was not found'
			});
		}
	})
	.catch(next);
};

exports.changeDefaultPlan = function (req, res, next) {
	if (isNaN(req.body.dayOfWeek) || isNaN(req.body.planId)) {
		res.sendStatus(400).json({
			status: 'error',
			message: 'Missing or incorrect parameters'
		});
		return;
	}

	HeatingDefaultPlan.findOneAndUpdate({
		dayOfWeek: req.body.dayOfWeek
	}, {
		plan: req.body.planId
	}, {
		new: true
	})
	.exec()
	.then(heatingDefaultPlan => {
		if (heatingDefaultPlan) {
			HeatingDefaultPlan.triggerChange(heatingDefaultPlan);

			res.json({
				status: 'ok',
				plan: heatingDefaultPlan
			});
		} else {
			res.json({
				status: 'error',
				message: 'Heating plan was not found.'
			});
		}
	})
	.catch(next);
};

exports.securityToggleArm = (req, res) => {
	security.toggleArm();

	res.json({
		status: 'ok'
	});
};

exports.securityStatus = (req, res) => {
	res.json({
		status: 'ok',
		data: {
			security: {
				status: security.getStatus()
			}
		}
	});
};

exports.securityInit = (req, res) => {
	Promise.all([
		SecurityMovementHistory
			.findOne()
			.sort({
				datetime: -1
			})
			.exec(),
		SecurityArmingHistory
			.findOne({
				status: 'arming'
			})
			.sort({
				datetime: -1
			})
			.exec()
	]).then(results => {
		const [movementHistory, lastArmed] = results;

		SecurityArmingHistory
			.count({
				status: 'alarm',
				datetime: {
					$gt: lastArmed.datetime
				}
			})
			.exec()
			.then(triggeredTimes => {
				res.json({
					status: 'ok',
					data: {
						security: {
							status: security.getStatus(),
							lastActivity: movementHistory.datetime,
							lastArmedAt: lastArmed.datetime,
							alarmTriggered: security.getStatus() === 'disarmed' ? 0 : triggeredTimes
						}
					}
				});
			});
	});
};

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
			status: 'ok'
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
				status: 'ok'
			});
		}
	} catch (err) {
		next(err);
	}
};

exports.securityMovement = function (req, res) {
	security.movementDetected();

	res.json({
		status: security.getStatus()
	});
};

exports.sensorPolling = function (req, res) {
	const id = req.query.id || 1;

	insideConditions.set({
		id: id,
		temperature: parseFloat(req.query.t),
		humidity: parseFloat(req.query.h)
	});

	setTimeout(() => res.json({
		isHeatingOn: heatingService.isHeatingOn(),
		restart: restartSensorService.getStatus()
	}), 200);
};

exports.statistics = async (req, res) => {
	const [statisticsForToday, statisticsForLastMonth, statisticsByMonth] = await Promise.all([
		HeatingHistory
			.find({
				datetime: {
					$gt: new Date(moment().tz('Europe/Bucharest').subtract(1, 'day'))
				}
			})
			.exec(),
		statisticsService
			.getStatisticsByDay(new Date(moment().tz('Europe/Bucharest').subtract(1, 'month')), new Date(moment().tz('Europe/Bucharest'))),
		statisticsService
			.getStatisticsByMonth(new Date(moment('2017-01-01 12:00:00').tz('Europe/Bucharest')), new Date(moment().tz('Europe/Bucharest')))
	]);

	statisticsForToday.unshift({
		datetime: new Date(moment().tz('Europe/Bucharest').subtract(1, 'day')),
		status: statisticsForToday[0] ? !statisticsForToday[0].status : false
	});
	statisticsForToday.push({
		datetime: new Date(moment().tz('Europe/Bucharest')),
		status: statisticsForToday.length ? statisticsForToday[statisticsForToday.length - 1].status : false
	});


	return res.json({
		status: 'ok',
		data: {
			statisticsForToday,
			statisticsForLastMonth,
			statisticsByMonth
		}
	});
};

exports.changeConfig = async (req, res) => {
	await configService.set(req.body.name, req.body.value);
	res.json({
		status: 'ok'
	});
};


exports.plantWateringInit = async (req, res) => {
	res.json({
		status: 'ok',
		data: {
			plantWatering: {
				status: plantWateringService.getStatus()
			}
		}
	});
};

exports.plantWateringSensor = async (req, res) => {
	if (!req.query.id || !req.query.status) {
		return res.sendStatus(400).json({
			status: 'error',
			reason: 'id or status parameters missing'
		});
	}

	if (req.query.status === 'wet') {
		plantWateringService.changeStatus(req.query.id, true);
	} else if (req.query.status === 'dry') {
		plantWateringService.changeStatus(req.query.id, false);
	}

	res.json({
		status: 'ok'
	});
};
