"use strict";

const socket = require('../services/socketio');
const outsideConditions = require('../services/outsideConditions');
const insideConditions = require('../services/insideConditions');
const heatingService = require('../services/heating');
const heatingEvts = require('../services/heatingEvts');
const statisticsService = require('../services/statistics');
const securityStatus = require('../services/securityStatus');
const securityHealth = require('../services/securityHealth');
const plantWatering = require('../services/plantWatering');
const restartSensorService = require('../services/restartSensor');
const targetTempService = require('../services/targetTemp');
const config = require('../services/config');
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

	heatingEvts.on('changeHeating', data => {
		io.emit('update', {
			isHeatingOn: data
		});

		recalculateHeatingDuration();
	});

	heatingEvts.on('changeHeatingPower', data => {
		io.emit('update', {
			heatingPower: {
				status: data.poweredOn,
				until: data.until
			}
		});
	});

	restartSensorService.evts.on('change', data => {
		io.emit('update', {
			restartSensorInProgress: data
		});
	});

	config.evts.on('change', data => {
		io.emit('update', {
			config: data
		});
	});

	targetTempService.evts.on('change', data => {
		io.emit('update', {
			targetTempId: data.id
		})
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
	securityStatus.evts.on('status', data => {
		io.emit('update', {
			security: {
				status: data
			}
		});
	});

	securityStatus.evts.on('alarm', data => {
		io.emit('update', {
			security: {
				alarm: data
			}
		});
	});

	securityStatus.evts.on('movement', data => {
		io.emit('update', {
			security: {
				movement: data
			}
		});
	});

	securityHealth.evts.on('camera-health', data => {
		io.emit('update', {
			security: {
				cameraHealth: data
			}
		})
	});

	securityHealth.evts.on('controller-health', data => {
		io.emit('update', {
			security: {
				controllerHealth: data
			}
		})
	});

	securityHealth.evts.on('keypad-health', data => {
		io.emit('update', {
			security: {
				keypadHealth: data
			}
		})
	});

	securityHealth.evts.on('motion-sensor-health', data => {
		io.emit('update', {
			security: {
				motionSensorHealth: data
			}
		})
	});


	plantWatering.evts.on('change', data => {
		io.emit('update', {
			plantWatering: {
				status: data
			}
		})
	});
};
