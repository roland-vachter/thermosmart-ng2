"use strict";

const socket = require('../services/socketio');
const outsideConditions = require('../services/outsideConditions');
const insideConditions = require('../services/insideConditions');
const heatingService = require('../services/heating');
const statisticsService = require('../services/statistics');
const security = require('../services/security');
const restartSensorService = require('../services/restartSensor');
const Temperature = require('../models/Temperature');
const HeatingDefaultPlan = require('../models/HeatingDefaultPlan');

exports.init = function () {
	const io = socket.io.of('/frontend');

	const recalculateHeatingDuration = () => {
		Promise.all([
			statisticsService
				.getStatisticsForToday()
		]).then(results => {
			const [
				statisticsForToday
			] = results;

			io.emit('update', {
				statisticsForToday: statisticsForToday
			});
		});
	};

	// heating

	outsideConditions.evts.on('change', data => {
		io.emit('update', {
			outside: data
		});
	});

	insideConditions.evts.on('change', data => {
		io.emit('update', {
			sensor: data
		});
	});

	heatingService.evts.on('change', data => {
		io.emit('update', {
			isHeatingOn: data
		});

		recalculateHeatingDuration();
	});

	restartSensorService.evts.on('change', data => {
		io.emit('update', {
			restartSensorInProgress: data
		});
	});

	Temperature.evts.on('change', ids => {
		if (!(ids instanceof Array)) {
			ids = [ids];
		}

		Temperature.find({
			_id: {
				$in: ids
			}
		}).exec().then(temps => {
			io.emit('update', {
				temperatures: temps
			});
		});
	});

	HeatingDefaultPlan.evts.on('change', defaultPlan => {
		io.emit('update', {
			heatingDefaultPlans: [defaultPlan]
		});
	});


	setInterval(() => {
		if (heatingService.isHeatingOn()) {
			recalculateHeatingDuration();
		}
	}, 5 * 60 * 1000);



	// security
	security.evts.on('status', data => {
		io.emit('update', {
			security: {
				status: data
			}
		});
	});

	security.evts.on('alarm', data => {
		io.emit('update', {
			security: {
				alarm: data
			}
		});
	});
};
