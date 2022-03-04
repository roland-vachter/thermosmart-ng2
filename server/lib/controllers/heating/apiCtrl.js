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

const moment = require('moment-timezone');
const HeatingPlanOverrides = require('../../models/HeatingPlanOverrides');

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
		HeatingPlanOverrides
			.find()
			.sort({
				date: 1
			})
			.exec(),
		statisticsService
			.getStatisticsForToday(),
		targetTempService.get(),
		configService.getAll()
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
				sensors: insideConditions.get(),
				isHeatingOn: heatingService.isHeatingOn(),
				heatingPower: {
					status: heatingService.getPowerStatus().poweredOn,
					until: heatingService.getPowerStatus().until
				},
				targetTempId: targetTemp ? targetTemp.id : null,
				temperatures: temps,
				heatingPlans: heatingPlans,
				heatingDefaultPlans: heatingDefaultPlans,
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
	if (isNaN(req.body.id) || isNaN(req.body.value)) {
		res.status(400).json({
			status: 'error',
			reason: 'Missing or incorrect parameters'
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
				reason: 'Temperature was not found'
			});
		}
	})
	.catch(next);
};

exports.changeDefaultPlan = function (req, res, next) {
	if (isNaN(req.body.dayOfWeek) || isNaN(req.body.planId)) {
		res.status(400).json({
			status: 'error',
			reason: 'Missing or incorrect parameters'
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
	try {
		const heatingPlanOverrides = await HeatingPlanOverrides.find().exec();

		res.json({
			status: 'ok',
			data: heatingPlanOverrides
		});
	} catch(e) {
		res.status(500).json({
			status: 'error',
			reason: e.message
		})
	}
};

exports.addOrUpdateHeatingPlanOverride = (req, res) => {
	if (!req.body.date || !req.body.planId) {
		res.status(400).json({
			status: 'error',
			reason: 'Date of plan parameters are missing'
		});
		return;
	}

	const date = moment(parseInt(req.body.date, 10)).tz('Europe/Bucharest').startOf('day');

	HeatingPlanOverrides.findOneAndUpdate({ date: date.valueOf() }, { plan: req.body.planId }, { upsert: true, new: true }, function(err, doc) {
		if (err) {
			return res.status(500).json({
				status: 'error',
				reason: err
			});
		}

		HeatingPlanOverrides.triggerChange();
		targetTempService.update();

		return res.json({
			status: 'ok',
		});
	});
};

exports.removeHeatingPlanOverride = (req, res) => {
	if (!req.body.date) {
		res.status(400).json({
			status: 'Date parameter is missing'
		});
		return;
	}

	const date = moment(parseInt(req.body.date, 10)).tz('Europe/Bucharest').startOf('day');

	HeatingPlanOverrides
		.deleteOne({
			date: date.valueOf()
		})
		.exec(err => {
			if (err) {
				return res.status(500).json({
					status: 'error',
					reason: err
				});
			}

			HeatingPlanOverrides.triggerChange();
			targetTempService.update();

			res.json({
				status: 'ok'
			});
		});
}

exports.toggleHeatingPower = (req, res) => {
	heatingService.togglePower();

	res.json({
		status: 'ok'
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

exports.sensorPolling = function (req, res) {
	const id = req.query.id || 1;

	insideConditions.set({
		id: id,
		temperature: parseFloat(req.query.t),
		humidity: parseFloat(req.query.h)
	});

	setTimeout(() => res.json({
		isHeatingOn: heatingService.isHeatingOn(parseInt(id, 10) === 1 ? true : false),
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
