import { socketIo } from '../services/socketio';
import Location from '../models/Location';
import { getStatisticsForToday } from '../services/statistics';
import { outsideConditionsEvts } from '../services/outsideConditions';
import heatingEvts from '../services/heatingEvts';
import { targetTempEvts } from '../services/targetTemp';
import Temperature, { temperatureEvts } from '../models/Temperature';
import { heatingDefaultPlanEvts } from '../models/HeatingDefaultPlan';
import { insideConditionsEvts } from '../services/insideConditions';
import { configEvts } from '../services/config';
import HeatingPlanOverrides, { heatingPlanOverrideEvts } from '../models/HeatingPlanOverrides';
import { isHeatingOn } from '../services/heating';
import { restartSensorEvts } from '../services/restartSensor';
import { securityHealthEvents } from '../services/securityHealth';
import { securityStatusEvents } from '../services/securityStatus';
import { isSolarHeatingOn, solarSystemEvts } from '../services/solarSystemHeating';
import { hasLocationFeature } from '../services/location';
import { LOCATION_FEATURE } from '../types/generic';

let initialized = false;

export const init = async () => {
	if (!initialized) {
		initialized = true;

		const io = socketIo.of('/frontend');
		const locations = await Location.find().lean().exec();

		locations.forEach(l => socketIo.of(`/frontend/${l._id}`));

		const recalculateHeatingDuration = async (location: number) => {
			const statisticsForToday = await getStatisticsForToday(location);

			socketIo.of('/frontend/' + location).emit('update', {
				statisticsForToday
			});
		};

		// heating

		outsideConditionsEvts.on('change', data => {
			io.emit('update', {
				outside: data
			});
		});

		insideConditionsEvts.on('change', data => {
			socketIo.of('/frontend/' + data.location).emit('update', {
				sensor: data
			});
		});

		heatingEvts.on('changeHeating', data => {
			socketIo.of('/frontend/' + data.location).emit('update', {
				isHeatingOn: data.isOn
			});

			void recalculateHeatingDuration(data.location);
		});

		heatingEvts.on('conditionStatusChange', data => {
			socketIo.of('/frontend/' + data.location).emit('update', {
				heatingConditions: data
			});
		});

		heatingEvts.on('changeHeatingPower', data => {
			socketIo.of('/frontend/' + data.location).emit('update', {
				heatingPower: {
					status: data.poweredOn,
					until: data.until
				}
			});
		});

		restartSensorEvts.on('change', data => {
			io.emit('update', {
				restartSensorInProgress: data
			});
		});

		configEvts.on('change', data => {
			socketIo.of('/frontend/' + data.location).emit('update', {
				config: data.config
			});
		});

		targetTempEvts.on('change', data => {
			socketIo.of('/frontend/' + data.location).emit('update', {
				targetTempId: data.targetTemp._id
			})
		});

		temperatureEvts.on('change', async data => {
			let ids = data.ids;
			if (!(data.ids instanceof Array)) {
				ids = [data.ids];
			}

			const temps = await Temperature.find({
				_id: {
					$in: ids
				}
			}).lean().exec()

			socketIo.of('/frontend/' + data.location).emit('update', {
				temperatures: temps.map(t => ({
					...t,
					value: t.values?.find(v => v.location === data.location)?.value || t.defaultValue,
					values: null
				}))
			});
		});

		heatingDefaultPlanEvts.on('change', data => {
			socketIo.of('/frontend/' + data.locationId).emit('update', {
				heatingDefaultPlans: [{
					...data.defaultPlan,
					plan: data.defaultPlan.plans?.find(p => p.location === data.locationId)?.plan || data.defaultPlan.defaultPlan,
					plans: null
				}]
			});
		});

		heatingPlanOverrideEvts.on('change', async data => {
			const planOverrides = await HeatingPlanOverrides
				.find({
					location: data.location
				})
				.sort({
					date: 1
				})
				.lean()
				.exec();

			socketIo.of('/frontend/' + data.location).emit('update', {
				heatingPlanOverrides: planOverrides
			});
		});

		solarSystemEvts.on('change', data => {
			socketIo.of('/frontend/' + data.location).emit('update', {
				solarHeatingStatus: data
			})
		});


		setInterval(() => {
			locations.forEach(l => {
				if (isHeatingOn(l._id) || (hasLocationFeature(l, LOCATION_FEATURE.SOLAR_SYSTEM_HEATING) && isSolarHeatingOn(l._id))) {
					void recalculateHeatingDuration(l._id);
				}
			});
		}, 5 * 60 * 1000);



		// security
		securityStatusEvents.on('status', data => {
			socketIo.of('/frontend/' + data.location).emit('update', {
				security: {
					status: data.status
				}
			});
		});

		securityStatusEvents.on('alarm', data => {
			socketIo.of('/frontend/' + data.location).emit('update', {
				security: {
					alarm: data.on
				}
			});
		});

		securityStatusEvents.on('movement', data => {
			socketIo.of('/frontend/' + data.location).emit('update', {
				security: {
					movement: true
				}
			});
		});

		securityStatusEvents.on('alarmTriggeredCount', data => {
			socketIo.of('/frontend/' + data.location).emit('update', {
				security: {
					alarmTriggeredCount: data.count
				}
			})
		});

		securityHealthEvents.on('camera-health', data => {
			socketIo.of('/frontend/' + data.location).emit('update', {
				security: {
					cameraHealth: data.health
				}
			})
		});

		securityHealthEvents.on('controller-health', data => {
			socketIo.of('/frontend/' + data.location).emit('update', {
				security: {
					controllerHealth: data.health
				}
			})
		});

		securityHealthEvents.on('keypad-health', data => {
			socketIo.of('/frontend/' + data.location).emit('update', {
				security: {
					keypadHealth: data.health
				}
			})
		});

		securityHealthEvents.on('motion-sensor-health', data => {
			socketIo.of('/frontend/' + data.location).emit('update', {
				security: {
					motionSensorHealth: data.health
				}
			})
		});


		// plantWateringEvts.on('update', data => {
		// 	io.emit('update', {
		// 		plantWatering: {
		// 			status: data
		// 		}
		// 	})
		// });
	}
};
