import SensorSetting, { ISensorSetting } from '../models/SensorSetting';
import heatingEvts from './heatingEvts';
import EventEmitter from 'events';
import TypedEventEmitter from 'typed-emitter';
import HeatingSensorHistory from '../models/HeatingSensorHistory';
import { HydratedDocument } from 'mongoose';
import { sendPushNotification } from './pushNotifications';

enum SensorDirectionChange {
	'firstDecrease' = 'firstDecrease',
	'decrease' = 'decrease',
	'firstIncrease' = 'firstIncrease',
	'increase' = 'increase',
	'firstStabilized' = 'firstStabilized'
}

enum SensorDirection {
	'increasing' = 'increasing',
	'decreasing' = 'decreasing'
}

interface Sensor {
	id: number;
	temperature: number;
	reportedTemperature?: number;
	humidity: number;
	reportedHumidity?: number;
	active?: boolean;
	enabled: boolean;
	windowOpen: boolean;
	windowOpenTimeout?: NodeJS.Timeout;
	label?: string;
	tempAdjust?: number;
	humidityAdjust?: number;
  deleted?: boolean;
	adjustedTempHistory: number[];
	reportedTempHistory: number[];
	avgTempHistory: {
		t: number;
		h?: number;
		date?: Date;
		saved: boolean;
	}[];
	location?: number;
	onHoldTempLowest?: number;
	onHoldTempHighest?: number;
	directionChange?: SensorDirectionChange | null;
	sensorSetting: HydratedDocument<ISensorSetting>;
	lastUpdate?: Date;
	direction?: SensorDirection;
	lastSavedTemperature?: number;
}

export interface SensorSetting {
	label: string;
	tempAdjust: number;
	humidityAdjust: number;
}

interface SensorInput {
	id: number;
	temperature: number;
	humidity: number;
}

type InsideConditionsEvents = {
	change: (i: Sensor) => void;
}

export const insideConditionsEvts = new EventEmitter() as TypedEventEmitter<InsideConditionsEvents>;

let sensorData: Record<number, Sensor> = {};
const heatingOnByLocation: Record<number, boolean> = {};

heatingEvts.on('changeHeating', data => {
	if (data.isOn) {
		activateAllSensors(data.location);
		heatingOnByLocation[data.location] = true;
	} else {
		heatingOnByLocation[data.location] = false;
	}
});

function getAvgTemp(sensor: Sensor, newTemperature: number) {
	let sum = 0;
	let count = 0;

	if (newTemperature) {
		sum = newTemperature;
		count = 1;
	}

	for (let i = count, historyIndex = 0; i < 3; i++, historyIndex++) {
		if (sensor.adjustedTempHistory[historyIndex]) {
			sum += sensor.adjustedTempHistory[historyIndex];
			count++;
		}
	}

	return parseFloat((sum / count).toFixed(1));
}

export const setSensorInput = async (data: SensorInput) => {
	try {
		const id = data.id;

		const sensorSetting = await SensorSetting.findOne({
			_id: id
		});

		if (sensorSetting) {
			const temp = parseFloat((data.temperature + sensorSetting.tempAdjust).toFixed(1));
			const humidity = Math.round(data.humidity + sensorSetting.humidityAdjust);

			let sensor: Sensor = sensorData[id];

			if (!sensor) {
				sensor = {
					id,
					enabled: sensorSetting?.enabled,
					windowOpen: false,
					adjustedTempHistory: [],
					reportedTempHistory: [],
					location: sensorSetting?.location,
					avgTempHistory: [],
					sensorSetting
				} as unknown as Sensor;
			}

			if (!sensor.avgTempHistory?.length) {
				const sensorHistory = await HeatingSensorHistory
					.findOne({ sensor: id })
					.sort({ datetime: -1 })
					.lean()
					.exec();

				if (sensorHistory) {
					sensor.avgTempHistory[0] = {
						t: sensorHistory.t,
						saved: true
					}
					sensor.lastSavedTemperature = sensorHistory.t;
				}
			}

			let changesMade = false;

			if (sensor.temperature !== getAvgTemp(sensor, temp) ||
					sensor.humidity !== humidity ||
					sensor.active !== true) {
				changesMade = true;
			}

			sensor.temperature = getAvgTemp(sensor, temp);
			sensor.humidity = humidity;

			sensor.reportedTemperature = data.temperature;
			sensor.reportedHumidity = data.humidity;

			sensor.lastUpdate = new Date();
			sensor.active = true;

			sensor.label = sensorSetting?.label;
			sensor.tempAdjust = sensorSetting?.tempAdjust;
			sensor.humidityAdjust = sensorSetting?.humidityAdjust;

			if (!sensor.direction || !sensor.avgTempHistory?.length ||
				(sensor.direction === SensorDirection.increasing && sensor.temperature > sensor.avgTempHistory[0].t) ||
				(sensor.direction === SensorDirection.decreasing && sensor.temperature < sensor.avgTempHistory[0].t)
			) {
				if (sensor.temperature !== sensor.lastSavedTemperature) {
					sensor.direction = sensor.temperature < sensor.avgTempHistory[0].t ? SensorDirection.decreasing : SensorDirection.increasing;
				}

				sensor.avgTempHistory.unshift({
					t: sensor.temperature,
					saved: sensor.temperature === sensor.lastSavedTemperature ? false : true
				});

				if (sensor.avgTempHistory.length > 5) {
					sensor.avgTempHistory.pop();
				}

				if (sensor.temperature !== sensor.lastSavedTemperature) {
					await new HeatingSensorHistory({
						sensor: id,
						t: sensor.temperature,
						h: sensor.humidity,
						datetime: new Date()
					}).save();
					sensor.lastSavedTemperature = sensor.temperature;
				}
			} else if ((sensor.direction === SensorDirection.increasing && sensor.temperature < sensor.avgTempHistory[0].t) ||
				(sensor.direction === SensorDirection.decreasing && sensor.temperature > sensor.avgTempHistory[0].t)) {
					if (!sensor.avgTempHistory[0].saved && sensor.avgTempHistory[1] &&
						(
							(sensor.direction === SensorDirection.increasing && sensor.avgTempHistory[1].t < sensor.avgTempHistory[0].t) ||
							(sensor.direction === SensorDirection.decreasing && sensor.avgTempHistory[1].t > sensor.avgTempHistory[0].t)
						)
					) {
						sensor.direction = sensor.temperature < sensor.avgTempHistory[0].t ? SensorDirection.decreasing : SensorDirection.increasing;
						await new HeatingSensorHistory({
							sensor: id,
							t: sensor.avgTempHistory[0].t,
							h: sensor.avgTempHistory[0].h,
							datetime: sensor.avgTempHistory[0].date
						}).save();
						sensor.avgTempHistory[0].saved = true;

						await new HeatingSensorHistory({
							sensor: id,
							t: sensor.temperature,
							h: sensor.humidity,
							datetime: new Date()
						}).save();

						sensor.avgTempHistory.unshift({
							t: sensor.temperature,
							h: sensor.humidity,
							date: new Date(),
							saved: true
						});
						sensor.lastSavedTemperature = sensor.temperature;

						if (sensor.avgTempHistory.length > 5) {
							sensor.avgTempHistory.pop();
						}
					} else {
						sensor.avgTempHistory.unshift({
							t: sensor.temperature,
							h: sensor.humidity,
							date: new Date(),
							saved: false
						});
					}
			} else if (sensor.temperature === sensor.avgTempHistory[0].t) {
				if (!sensor.avgTempHistory[0].saved && sensor.temperature !== sensor.lastSavedTemperature) {
					await new HeatingSensorHistory({
						sensor: id,
						t: sensor.avgTempHistory[0].t,
						h: sensor.avgTempHistory[0].h,
						datetime: sensor.avgTempHistory[0].date
					}).save();
					sensor.avgTempHistory[0].saved = true;

					sensor.avgTempHistory.unshift({
						t: sensor.temperature,
						h: sensor.humidity,
						date: sensor.avgTempHistory[0].date,
						saved: false
					});
				} else {
					sensor.avgTempHistory.unshift({
						t: sensor.temperature,
						h: sensor.humidity,
						date: sensor.avgTempHistory[0].date,
						saved: false
					});
				}

				let i = 1;
				while (i < sensor.avgTempHistory.length && sensor.avgTempHistory[i].t !== sensor.temperature) {
					i++;
				}
				const lastTempNotEqual = sensor.avgTempHistory[i].t;

				if (sensor.temperature !== lastTempNotEqual) {
					sensor.direction = sensor.temperature < lastTempNotEqual ? SensorDirection.decreasing : SensorDirection.increasing;
				}
			}

			if (sensor.avgTempHistory.length > 5) {
				sensor.avgTempHistory.pop();
			}

			sensor.reportedTempHistory.unshift(data.temperature);
			if (sensor.reportedTempHistory.length > 5) {
				sensor.reportedTempHistory.pop();
			}

			sensor.adjustedTempHistory.unshift(temp);
			if (sensor.adjustedTempHistory.length > 3) {
				sensor.adjustedTempHistory.pop();
			}

			changesMade = changesMade || windowOpenDetection(sensor, sensorSetting);

			sensorData[id] = sensor;

			if (changesMade) {
				insideConditionsEvts.emit('change', {
					...sensor,
					windowOpenTimeout: undefined
				});
			}
		}
	} catch (e) {
		console.error("Error saving sensor data", e);
	}
};

export const getSensors = (locationId: number) => {
	const sensorDataByLocation: Record<number, Sensor> = {};

	Object.keys(sensorData).map(Number).forEach(id => {
		if (sensorData[id].location === locationId) {
			sensorDataByLocation[id] = {
				...sensorData[id],
				windowOpenTimeout: undefined
			};
		}
	});

	return sensorDataByLocation;
};

export const getLocationBySensorId = (id: number) => {
	return sensorData[id].location;
}

const activateAllSensors = (locationId: number) => {
	Object.keys(sensorData).map(Number).forEach(id => {
		const s = sensorData[id];
		if (s.location === locationId && s.windowOpen) {
			s.windowOpen = false;
			s.directionChange = null;
		}
	});
}

export const toggleSensorStatus = async (id: number) => {
	const sensorSetting = await SensorSetting.findOne({
		_id: id
	});

	if (sensorSetting) {
		if (sensorSetting.enabled === sensorData[id].enabled) {
			sensorSetting.enabled = !sensorSetting.enabled;
			await sensorSetting.save();
		}

		if (sensorData[id]) {
			sensorData[id].enabled = sensorSetting.enabled;
			sensorData[id].directionChange = null;
			sensorData[id].windowOpen = false;
			insideConditionsEvts.emit('change', {
				...sensorData[id],
				windowOpenTimeout: undefined
			});
		}

		return true;
	}

	return false;
};

export const disableSensorWindowOpen = (id: number) => {
	if (sensorData[id]) {
		sensorData[id].windowOpen = false;
		clearTimeout(sensorData[id].windowOpenTimeout);
		insideConditionsEvts.emit('change', {
			...sensorData[id],
			windowOpenTimeout: undefined
		});
	}
}

export const changeSensorSettings = async (id: number, settings: SensorSetting) => {
	const sensorSetting = await SensorSetting.findOne({
		_id: id
	});

	if (sensorSetting) {
		sensorSetting.label = settings.label;
		sensorSetting.tempAdjust = settings.tempAdjust;
		sensorSetting.humidityAdjust = settings.humidityAdjust;

		if (sensorData[id]) {
			sensorData[id].label = sensorSetting.label;
			sensorData[id].tempAdjust = sensorSetting.tempAdjust;
			sensorData[id].humidityAdjust = sensorSetting.humidityAdjust;
			sensorData[id].temperature = (sensorData[id].reportedTemperature || 0) + sensorSetting.tempAdjust;
			sensorData[id].humidity = (sensorData[id].reportedHumidity || 0) + sensorSetting.humidityAdjust;
		}

		await sensorSetting.save();

		insideConditionsEvts.emit('change', {
			...sensorData[id],
			windowOpenTimeout: undefined
		});

		return true;
	}

	return false;
};

setInterval(() => {
	Object.keys(sensorData).map(Number).forEach(async (id: number) => {
		const sensorSetting = await SensorSetting.findOne({
			_id: id
		});

		if (new Date().getTime() - (sensorData[id].lastUpdate?.getTime() || 0) > 10 * 60 * 1000) {
			if (sensorData[id].active !== false) {
				sensorData[id].active = false;

				sensorData[id].enabled = sensorSetting?.enabled || false;
				sensorData[id].windowOpen = false;
				clearTimeout(sensorData[id].windowOpenTimeout);
				sensorData[id].directionChange = null;

				insideConditionsEvts.emit('change', {
					...sensorData[id],
					windowOpenTimeout: undefined
				});
			}
		}

		if (new Date().getTime() - (sensorData[id].lastUpdate?.getTime() || 0) > 15 * 60 * 1000) {
			insideConditionsEvts.emit('change', Object.assign({}, sensorData[id], {
				deleted: true,
				windowOpenTimeout: null
			}));

			if (Object.keys(sensorData).length === 1) {
				sensorData = {};
				sendPushNotification(['heating'], 'ThermoSmart - Heating', 'All sensors are removed');
			} else {
				delete sensorData[id];
				sendPushNotification(['heating'], 'ThermoSmart - Heating', 'Sensor removed');
			}
		}
	});
}, 10 * 1000);


function windowOpenDetection(sensor: Sensor, sensorSetting: ISensorSetting) {
	let changesMade = false;

	if (!heatingOnByLocation[sensorSetting.location] && sensorSetting?.enabled && sensor.reportedTempHistory.length) {
		const currentTemp = sensor.reportedTempHistory[0];
		const lastTemp = sensor.reportedTempHistory[1];
		const prevLastTemp = sensor.reportedTempHistory[2];
		const preprevLastTemp = sensor.reportedTempHistory[3];

		if (!sensor.directionChange) {
			if (lastTemp - currentTemp >= 0.15 ||
					(prevLastTemp && prevLastTemp - currentTemp >= 0.25) ||
					(preprevLastTemp && preprevLastTemp - currentTemp >= 0.35)) {
				sensor.onHoldTempLowest = currentTemp;
				changesMade = true;

				sensor.directionChange = SensorDirectionChange.firstDecrease;
			}
		} else if (sensor.directionChange === SensorDirectionChange.firstDecrease) {
			if (lastTemp - currentTemp >= 0.15 ||
					(prevLastTemp && prevLastTemp - currentTemp >= 0.25) ||
					(preprevLastTemp && preprevLastTemp - currentTemp >= 0.35)) {
				sensor.onHoldTempLowest = currentTemp;
				sensor.windowOpen = true;

				clearTimeout(sensor.windowOpenTimeout);
				sensor.windowOpenTimeout = setTimeout(() => {
					sensor.windowOpen = false;
				}, 20 * 60 * 1000);

				changesMade = true;
				sensor.directionChange = SensorDirectionChange.decrease;
			} else {
				sensor.directionChange = null;
				sensor.onHoldTempLowest = currentTemp;
				sensor.onHoldTempHighest = currentTemp;
				sensor.windowOpen = false;
				clearTimeout(sensor.windowOpenTimeout);
				changesMade = true;
			}
		} else if (sensor.directionChange === SensorDirectionChange.decrease) {
				if (currentTemp <= sensor.onHoldTempLowest) {
					sensor.onHoldTempLowest = currentTemp;
				} else {
					sensor.directionChange = SensorDirectionChange.firstIncrease;
				}
		} else if (sensor.directionChange === SensorDirectionChange.firstIncrease) {
			if (currentTemp <= sensor.onHoldTempLowest) {
				sensor.directionChange = SensorDirectionChange.decrease;
				sensor.onHoldTempLowest = currentTemp;
			} else if (currentTemp < lastTemp) {
				sensor.directionChange = SensorDirectionChange.decrease;
			} else if (currentTemp > lastTemp) {
				sensor.directionChange = SensorDirectionChange.increase;
				sensor.onHoldTempHighest = currentTemp;
			}
		} else if (sensor.directionChange === SensorDirectionChange.increase) {
			if (currentTemp > sensor.onHoldTempHighest) {
				sensor.onHoldTempHighest = currentTemp;
			} else {
				sensor.directionChange = SensorDirectionChange.firstStabilized;
			}
		} else if (sensor.directionChange === SensorDirectionChange.firstStabilized) {
			if (currentTemp > sensor.onHoldTempHighest) {
				sensor.onHoldTempHighest = currentTemp;
				sensor.directionChange = SensorDirectionChange.increase;
			} else if (currentTemp > lastTemp) {
				sensor.directionChange = SensorDirectionChange.increase;
			} else {
				sensor.windowOpen = false;
				clearTimeout(sensor.windowOpenTimeout);
				sensor.directionChange = null;
				sensor.onHoldTempHighest = currentTemp;
				sensor.onHoldTempLowest = currentTemp;
				changesMade = true;
			}
		}

		if (currentTemp <= 10) {
			sensor.directionChange = null;
			sensor.windowOpen = false;
			clearTimeout(sensor.windowOpenTimeout);
		}
	}

	return changesMade;
}
