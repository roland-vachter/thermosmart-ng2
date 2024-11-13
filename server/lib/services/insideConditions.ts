import SensorSetting from '../models/SensorSetting';
import heatingEvts from './heatingEvts';
import EventEmitter from 'events';
import TypedEventEmitter from 'typed-emitter';
import HeatingSensorHistory from '../models/HeatingSensorHistory';
import { sendPushNotification } from './pushNotifications';
import { Sensor, TemperatureDirection, OnHoldStatus } from '../types/generic';

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

	return Math.round(sum * 10 / count) / 10;
}

const clearWindowOpen = (sensor: Sensor, currentTemp: number) => {
	sensor.onHoldStatus = null;
	sensor.onHoldTempLowest = currentTemp;
	sensor.onHoldTempHighest = currentTemp;
	sensor.windowOpen = false;
	clearTimeout(sensor.windowOpenTimeout);

	console.log('window open - cleared', sensor.id, currentTemp);
}

export const setSensorInput = async (data: SensorInput) => {
	try {
		const id = data.id;

		const sensorSetting = await SensorSetting.findOne({
			_id: id
		});

		if (sensorSetting) {
			const temp = Math.round((data.temperature + sensorSetting.tempAdjust) * 10) / 10;
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
					savedTempHistory: [],
					sensorSetting
				} as unknown as Sensor;
			}

			const sensorHistory = await HeatingSensorHistory
				.findOne({ sensor: id })
				.sort({ datetime: -1 })
				.lean()
				.exec();

			if (sensorHistory) {
				sensor.savedTempHistory[0] = sensorHistory.t;
			}

			let changesMade = false;

			sensor.reportedTemperature = Math.round(data.temperature * 10) / 10;
			sensor.reportedHumidity = Math.round(data.humidity * 10) / 10;

			if (sensor.savedTempHistory[0] !== getAvgTemp(sensor, temp) ||
					sensor.reportedHumidity !== humidity ||
					sensor.active !== true) {
				changesMade = true;
			}

			sensor.temperature = getAvgTemp(sensor, temp);
			sensor.humidity = humidity;

			sensor.lastUpdate = new Date();
			sensor.active = true;

			sensor.label = sensorSetting?.label;
			sensor.tempAdjust = sensorSetting?.tempAdjust;
			sensor.humidityAdjust = sensorSetting?.humidityAdjust;

			if (sensor.savedTempHistory.length) {
				const avgPreviousTemps = sensor.savedTempHistory.reduce((acc, v) => acc + v, 0) / sensor.savedTempHistory.length;
				if (avgPreviousTemps !== sensor.temperature) {
					sensor.temperatureDirection = sensor.temperature < avgPreviousTemps ? TemperatureDirection.decrease : TemperatureDirection.increase;
				}
			}

			if (!sensor.savedTempHistory.length || sensor.savedTempHistory[0] !== sensor.temperature) {
				await new HeatingSensorHistory({
					sensor: id,
					t: sensor.temperature,
					h: sensor.humidity,
					datetime: new Date()
				}).save();
				sensor.savedTempHistory[0] = sensor.temperature;
			}

			sensor.reportedTempHistory.unshift(sensor.reportedTemperature);
			if (sensor.reportedTempHistory.length > 5) {
				sensor.reportedTempHistory.pop();
			}

			sensor.adjustedTempHistory.unshift(temp);
			if (sensor.adjustedTempHistory.length > 3) {
				sensor.adjustedTempHistory.pop();
			}

			if (!heatingOnByLocation[sensorSetting.location] && sensorSetting?.enabled && sensor.reportedTempHistory.length) {
				const currentTemp = sensor.reportedTempHistory[0];
				const lastTemp = sensor.reportedTempHistory[1];
				const prevLastTemp = sensor.reportedTempHistory[2];
				const preprevLastTemp = sensor.reportedTempHistory[3];

				if (!sensor.onHoldStatus) {
					if (lastTemp - currentTemp >= 0.15 ||
							(prevLastTemp && prevLastTemp - currentTemp >= 0.25) ||
							(preprevLastTemp && preprevLastTemp - currentTemp >= 0.35)) {
						sensor.onHoldTempLowest = currentTemp;
						changesMade = true;

						sensor.onHoldStatus = OnHoldStatus.firstDecrease;

						console.log('window open - first decrease', sensor.id, currentTemp);
					}
				} else if (sensor.onHoldStatus === OnHoldStatus.firstDecrease) {
					if (lastTemp - currentTemp >= 0.15 ||
							(prevLastTemp && prevLastTemp - currentTemp >= 0.25) ||
							(preprevLastTemp && preprevLastTemp - currentTemp >= 0.35)) {
						sensor.onHoldTempLowest = currentTemp;
						sensor.windowOpen = true;

						clearTimeout(sensor.windowOpenTimeout);
						sensor.windowOpenTimeout = setTimeout(() => {
							sensor.windowOpen = false;
							console.log('window open - timeout reached', sensor.id, currentTemp);
						}, 45 * 60 * 1000);

						changesMade = true;
						sensor.onHoldStatus = OnHoldStatus.decrease;
						console.log('window open - decrease', sensor.id, currentTemp);
					} else {
						clearWindowOpen(sensor, currentTemp);
						changesMade = true;
					}
				} else if (sensor.onHoldStatus === OnHoldStatus.decrease) {
					if (currentTemp === sensor.onHoldTempLowest) {
						if (sensor.onHoldSameStateCount < 5) {
							sensor.onHoldSameStateCount++;
						} else {
							clearWindowOpen(sensor, currentTemp);
							changesMade = true;
						}
					} else if (currentTemp < sensor.onHoldTempLowest) {
						sensor.onHoldTempLowest = currentTemp;
						sensor.onHoldSameStateCount = 0;
					} else {
						sensor.onHoldStatus = OnHoldStatus.firstIncrease;
						sensor.onHoldSameStateCount = 0;
						console.log('window open - first increase', sensor.id, currentTemp);
					}
				} else if (sensor.onHoldStatus === OnHoldStatus.firstIncrease) {
					if (currentTemp === lastTemp) {
						if (sensor.onHoldSameStateCount < 5) {
							sensor.onHoldSameStateCount++;
						} else {
							clearWindowOpen(sensor, currentTemp);
							changesMade = true;
						}
					} else if (currentTemp <= sensor.onHoldTempLowest) {
						sensor.onHoldStatus = OnHoldStatus.decrease;
						sensor.onHoldTempLowest = currentTemp;
						console.log('window open - decrease', sensor.id, currentTemp);
					} else if (currentTemp < lastTemp) {
						sensor.onHoldStatus = OnHoldStatus.decrease;
						console.log('window open - decrease', sensor.id, currentTemp);
					} else if (currentTemp > lastTemp) {
						sensor.onHoldStatus = OnHoldStatus.increase;
						console.log('window open - increase', sensor.id, currentTemp);
						sensor.onHoldTempHighest = currentTemp;
					}
				} else if (sensor.onHoldStatus === OnHoldStatus.increase) {
					if (currentTemp > sensor.onHoldTempHighest) {
						sensor.onHoldTempHighest = currentTemp;
						console.log('window open - increase', sensor.id, currentTemp);
					} else {
						sensor.onHoldStatus = OnHoldStatus.stabilized;
						sensor.onHoldSameStateCount = 0;
						console.log('window open - stabilized', sensor.id, 'count:', sensor.onHoldSameStateCount, currentTemp);
					}
				} else if (sensor.onHoldStatus === OnHoldStatus.stabilized) {
					if (currentTemp > sensor.onHoldTempHighest) {
						sensor.onHoldTempHighest = currentTemp;
						sensor.onHoldStatus = OnHoldStatus.increase;
						console.log('window open - increase', sensor.id, currentTemp);
					} else if (currentTemp > lastTemp) {
						sensor.onHoldStatus = OnHoldStatus.increase;
						console.log('window open - increase', sensor.id, currentTemp);
					} else if (sensor.onHoldSameStateCount < 5) {
						sensor.onHoldSameStateCount++;
						console.log('window open - stabilized', sensor.id, 'count:', sensor.onHoldSameStateCount, currentTemp);
					} else {
						clearWindowOpen(sensor, currentTemp);
						changesMade = true;
					}
				}

				if (currentTemp <= 10) {
					sensor.onHoldStatus = null;
					sensor.windowOpen = false;
					clearTimeout(sensor.windowOpenTimeout);
				}
			}

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
			s.onHoldStatus = null;
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
			sensorData[id].onHoldStatus = null;
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

const disableSensorWindowOpenForSensor = (id: number) => {
	if (sensorData[id] && sensorData[id].windowOpen) {
		sensorData[id].windowOpen = false;
		clearTimeout(sensorData[id].windowOpenTimeout);
		insideConditionsEvts.emit('change', {
			...sensorData[id],
			windowOpenTimeout: undefined
		});
	}
}

export const disableSensorWindowOpen = (id?: number) => {
	if (id) {
		disableSensorWindowOpenForSensor(id);
	} else {
		Object.keys(sensorData).map(Number).forEach(sensorId => {
			disableSensorWindowOpen(sensorId);
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

export const getAvgByLocation = (locationId: number) => {
	const sensors = getSensors(locationId);

	const avgValues = {
		temperature: 0,
		humidity: 0
	};
	let activeCount = 0;

	const keys = Object.keys(sensors).map(Number);
	keys.forEach(key => {
		if (sensors[key].active && sensors[key].enabled) {
			avgValues.temperature += sensors[key].temperature;
			avgValues.humidity += sensors[key].humidity;
			activeCount++;
		}
	});

	avgValues.temperature = avgValues.temperature / activeCount;
	avgValues.humidity = avgValues.humidity / activeCount;

	return avgValues;
}

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
				sensorData[id].onHoldStatus = null;

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
