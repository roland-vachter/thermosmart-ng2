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
const HeatingPlanOverrides = require('../models/HeatingPlanOverrides');
const Location = require('../models/Location');

exports.init = function () {
	const io = socket.io.of('/frontend');

	const recalculateHeatingDuration = (location) => {
		Promise.all([
			statisticsService
				.getStatisticsForToday(location)
		]).then(results => {
			const [
				statisticsForToday
			] = results;

			socket.io.of('/frontend/' + location).emit('update', {
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
		socket.io.of('/frontend/' + data.location).emit('update', {
			sensor: data
		});
	});

	heatingEvts.on('changeHeating', data => {
		socket.io.of('/frontend/' + data.location).emit('update', {
			isHeatingOn: data.isOn
		});

		recalculateHeatingDuration();
	});

	heatingEvts.on('changeHeatingPower', data => {
		socket.io.of('/frontend/' + data.location).emit('update', {
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
		socket.io.of('/frontend/' + data.location).emit('update', {
			config: data.config
		});
	});

	targetTempService.evts.on('change', data => {
		socket.io.of('/frontend/' + data.location).emit('update', {
			targetTempId: data.targetTemp.id
		})
	});

	Temperature.evts.on('change', data => {
		let ids = data.ids;
		if (!(data.ids instanceof Array)) {
			ids = [data.ids];
		}

		Temperature.find({
			_id: {
				$in: ids
			}
		}).exec().then(temps => {
			socket.io.of('/frontend/' + data.location).emit('update', {
				temperatures: temps.map(t => ({
					...t,
					value: t.values?.find(v => v.location === location)?.value || t.defaultValue,
					values: null
				}))
			});
		});
	});

	HeatingDefaultPlan.evts.on('change', data => {
		socket.io.of('/frontend/' + data.location).emit('update', {
			heatingDefaultPlans: [{
				...data.defaultPlan,
				plan: data.defaultPlan.plans?.find(p => p.location === location)?.plan || data.defaultPlan.defaultPlan,
				plans: null
			}]
		});
	});

	HeatingPlanOverrides.evts.on('change', data => {
		HeatingPlanOverrides
			.find()
			.sort({
				date: 1,
				location
			})
			.exec()
			.then(planOverrides => {
				socket.io.of('/frontend/' + data.location).emit('update', {
					HeatingPlanOverrides: planOverrides
				})
			});
	})


	setInterval(() => {
		Location.find().lean().exec().then(locations => {
			locations.forEach(l => {
				if (heatingService.isHeatingOn(l._id)) {
					recalculateHeatingDuration(l._id);
				}
			});
		});
	}, 5 * 60 * 1000);



	// security
	securityStatus.evts.on('status', data => {
		socket.io.of('/frontend/' + data.location).emit('update', {
			security: {
				status: data.status
			}
		});
	});

	securityStatus.evts.on('alarm', data => {
		socket.io.of('/frontend/' + data.location).emit('update', {
			security: {
				alarm: data.on
			}
		});
	});

	securityStatus.evts.on('movement', data => {
		socket.io.of('/frontend/' + data.location).emit('update', {
			security: {
				movement: true
			}
		});
	});

	securityStatus.evts.on('alarmTriggeredCount', data => {
		socket.io.of('/frontend/' + data.location).emit('update', {
			security: {
				alarmTriggeredCount: data.count
			}
		})
	});

	securityHealth.evts.on('camera-health', data => {
		socket.io.of('/frontend/' + data.location).emit('update', {
			security: {
				cameraHealth: data.health
			}
		})
	});

	securityHealth.evts.on('controller-health', data => {
		socket.io.of('/frontend/' + data.location).emit('update', {
			security: {
				controllerHealth: data.health
			}
		})
	});

	securityHealth.evts.on('keypad-health', data => {
		socket.io.of('/frontend/' + data.location).emit('update', {
			security: {
				keypadHealth: data.health
			}
		})
	});

	securityHealth.evts.on('motion-sensor-health', data => {
		socket.io.of('/frontend/' + data.location).emit('update', {
			security: {
				motionSensorHealth: data.health
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
