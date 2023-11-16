const SensorSetting = require('../models/SensorSetting');
const heatingEvts = require('./heatingEvts');
const pushNotifications = require('./pushNotifications');

const EventEmitter = require('events');
const HeatingSensorHistory = require('../models/HeatingSensorHistory');
const evts = new EventEmitter();

const sensorData = {};
const heatingOnByLocation = {};
heatingEvts.on('changeHeating', data => {
	if (data.isOn) {
		activateAllSensors(data.location);
		heatingOnByLocation[data.location] = true;
	} else {
		heatingOnByLocation[data.location] = false;
	}
});

function getAvgTemp(sensor, newTemperature) {
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

exports.set = async (data) => {
	try {
		const id = data.id;

		let sensorSetting = await SensorSetting.findOne({
			_id: id
		});

		const temp = parseFloat((data.temperature + sensorSetting.tempAdjust).toFixed(1));
		const humidity = Math.round(data.humidity + sensorSetting.humidityAdjust);

		if (!sensorData[id]) {
			sensorData[id] = {
				id: id,
				enabled: sensorSetting.enabled,
				windowOpen: false,
				windowOpenTimeout: null,
				adjustedTempHistory: [],
				reportedTempHistory: [],
				onHoldTempLowest: null,
				onHoldTempHighest: null,
				onHoldStatus: null,
				location: sensorSetting.location,
				savedTempHistory: [],
				sensorSetting
			};
		}

		const sensorHistory = await HeatingSensorHistory
			.findOne({ sensor: id })
			.sort({ datetime: -1 })
			.lean()
			.exec();

		if (sensorHistory) {
			sensorData[id].savedTempHistory[0] = sensorHistory.t;
		}

		let changesMade = false;

		if (sensorData[id].temperature !== getAvgTemp(sensorData[id], temp) ||
				sensorData[id].humidity !== humidity ||
				sensorData[id].active !== true) {
			changesMade = true;
		}

		sensorData[id].temperature = getAvgTemp(sensorData[id], temp);
		sensorData[id].humidity = humidity;

		sensorData[id].reportedTemperature = data.temperature;
		sensorData[id].reportedHumidity = data.humidity;

		sensorData[id].lastUpdate = new Date();
		sensorData[id].active = true;

		sensorData[id].label = sensorSetting.label;
		sensorData[id].tempAdjust = sensorSetting.tempAdjust;
		sensorData[id].humidityAdjust = sensorSetting.humidityAdjust;

		if (sensorData[id].savedTempHistory[0] !== sensorData[id].temperature) {
		// if (!sensorData[id].savedTempHistory.includes(sensorData[id].temperature)) {
			// sensorData[id].savedTempHistory.push(sensorData[id].temperature);
			console.log('save history');
			new HeatingSensorHistory({
				sensor: id,
				t: sensorData[id].temperature,
				h: sensorData[id].humidity,
				datetime: new Date()
			}).save();
			sensorData[id].savedTempHistory[0] = sensorData[id].temperature;

		// 	sensorData[id].savedTempHistory = sensorData[id].savedTempHistory.filter(t => Math.abs(sensorData[id].temperature - t) < 0.15);
		}

		sensorData[id].reportedTempHistory.unshift(data.temperature);
		if (sensorData[id].reportedTempHistory.length > 5) {
			sensorData[id].reportedTempHistory.pop();
		}

		sensorData[id].adjustedTempHistory.unshift(temp);
		if (sensorData[id].adjustedTempHistory.length > 3) {
			sensorData[id].adjustedTempHistory.pop();
		}

		if (!heatingOnByLocation[data.location] && sensorSetting.enabled && sensorData[id].reportedTempHistory.length) {
			const currentTemp = sensorData[id].reportedTempHistory[0];
			const lastTemp = sensorData[id].reportedTempHistory[1];
			const prevLastTemp = sensorData[id].reportedTempHistory[2];
			const preprevLastTemp = sensorData[id].reportedTempHistory[3];

			if (!sensorData[id].onHoldStatus) {
				if (lastTemp - currentTemp >= 0.15 ||
						(prevLastTemp && prevLastTemp - currentTemp >= 0.25) ||
						(preprevLastTemp && preprevLastTemp - currentTemp >= 0.35)) {
					sensorData[id].onHoldTempLowest = currentTemp;
					sensorData[id].onHoldTempHighest = null;
					changesMade = true;

					sensorData[id].onHoldStatus = 'firstDecrease';
				}
			} else if (sensorData[id].onHoldStatus === 'firstDecrease') {
				if (lastTemp - currentTemp >= 0.15 ||
						(prevLastTemp && prevLastTemp - currentTemp >= 0.25) ||
						(preprevLastTemp && preprevLastTemp - currentTemp >= 0.35)) {
					sensorData[id].onHoldTempLowest = currentTemp;
					sensorData[id].windowOpen = true;

					clearTimeout(sensorData[id].windowOpenTimeout);
					sensorData[id].windowOpenTimeout = setTimeout(() => {
						sensorData[id].windowOpen = false;
					}, 20 * 60 * 1000);

					changesMade = true;
					sensorData[id].onHoldStatus = 'decrease';
				} else {
					sensorData[id].onHoldStatus = null;
					sensorData[id].onHoldTempLowest = null;
					sensorData[id].onHoldTempHighest = null;
					sensorData[id].windowOpen = false;
					clearTimeout(sensorData[id].windowOpenTimeout);
					changesMade = true;
				}
			} else if (sensorData[id].onHoldStatus === 'decrease') {
					if (currentTemp <= sensorData[id].onHoldTempLowest) {
						sensorData[id].onHoldTempLowest = currentTemp;
					} else {
						sensorData[id].onHoldStatus = 'firstIncrease';
					}
			} else if (sensorData[id].onHoldStatus === 'firstIncrease') {
				if (currentTemp <= sensorData[id].onHoldTempLowest) {
					sensorData[id].onHoldStatus = 'decrease';
					sensorData[id].onHoldTempLowest = currentTemp;
				} else if (currentTemp < lastTemp) {
					sensorData[id].onHoldStatus = 'decrease';
				} else if (currentTemp > lastTemp) {
					sensorData[id].onHoldStatus = 'increase';
					sensorData[id].onHoldTempHighest = currentTemp;
				}
			} else if (sensorData[id].onHoldStatus === 'increase') {
				if (currentTemp > sensorData[id].onHoldTempHighest) {
					sensorData[id].onHoldTempHighest = currentTemp;
				} else {
					sensorData[id].onHoldStatus = 'firstStabilized';
				}
			} else if (sensorData[id].onHoldStatus === 'firstStabilized') {
				if (currentTemp > sensorData[id].onHoldTempHighest) {
					sensorData[id].onHoldTempHighest = currentTemp;
					sensorData[id].onHoldStatus = 'increase';
				} else if (currentTemp > lastTemp) {
					sensorData[id].onHoldStatus = 'increase';
				} else {
					sensorData[id].windowOpen = false;
					clearTimeout(sensorData[id].windowOpenTimeout);
					sensorData[id].onHoldStatus = null;
					sensorData[id].onHoldTempHighest = null;
					sensorData[id].onHoldTempLowest = null;
					changesMade = true;
				}
			}

			if (currentTemp <= 10) {
				sensorData[id].onHoldStatus = null;
				sensorData[id].windowOpen = false;
				clearTimeout(sensorData[id].windowOpenTimeout);
			}
		}

		if (changesMade) {
			evts.emit('change', {
				...sensorData[id],
				windowOpenTimeout: null
			});
		}
	} catch (e) {
		console.error("Error saving sensor data", e);
	}
};

exports.get = (locationId) => {
	const sensorDataByLocation = {};

	Object.keys(sensorData).forEach(id => {
		if (sensorData[id].location === locationId) {
			sensorDataByLocation[id] = {
				...sensorData[id],
				windowOpenTimeout: null
			};
		}
	});

	return sensorDataByLocation;
};

exports.getLocationById = (id) => {
	return sensorData[id].location;
}

const activateAllSensors = (locationId) => {
	Object.keys(sensorData).forEach(id => {
		const s = sensorData[id];
		if (s.location === locationId && s.windowOpen) {
			s.windowOpen = false;
			s.onHoldStatus = null;
			s.onHoldTempLowest = null;
			s.onHoldTempHighest = null;
		}
	});
}

exports.toggleSensorStatus = async (id) => {
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
			sensorData[id].onHoldTempLowest = null;
			sensorData[id].onHoldTempHighest = null;
			sensorData[id].onHoldStatus = null;
			sensorData[id].windowOpen = false;
			evts.emit('change', {
				...sensorData[id],
				windowOpenTimeout: null
			});
		}

		return true;
	}

	return false;
};

exports.disableSensorWindowOpen = (id) => {
	if (sensorData[id]) {
		sensorData[id].windowOpen = false;
		clearTimeout(sensorData[id].windowOpenTimeout);
		evts.emit('change', {
			...sensorData[id],
			windowOpenTimeout: null
		});
	}
}

exports.changeSensorSettings = async (id, settings) => {
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
			sensorData[id].temperature = sensorData[id].reportedTemperature + sensorSetting.tempAdjust;
			sensorData[id].humidity = sensorData[id].reportedHumidity + sensorSetting.humidityAdjust;
		}

		await sensorSetting.save();

		evts.emit('change', {
			...sensorData[id],
			windowOpenTimeout: null
		});

		return true;
	}

	return false;
};

setInterval(() => {
	Object.keys(sensorData).forEach(async id => {
		const sensorSetting = await SensorSetting.findOne({
			_id: id
		});

		if (new Date().getTime() - sensorData[id].lastUpdate.getTime() > 10 * 60 * 1000) {
			if (sensorData[id].active !== false) {
				sensorData[id].active = false;

				sensorData[id].enabled = sensorSetting.enabled;
				sensorData[id].windowOpen = false;
				clearTimeout(sensorData[id].windowOpenTimeout);
				sensorData[id].onHoldTempLowest = null;
				sensorData[id].onHoldTempHighest = null;
				sensorData[id].onHoldStatus = null;

				evts.emit('change', {
					...sensorData[id],
					windowOpenTimeout: null
				});
			}
		}

		if (new Date().getTime() - sensorData[id].lastUpdate.getTime() > 15 * 60 * 1000) {
			evts.emit('change', Object.assign({}, sensorData[id], {
				deleted: true,
				windowOpenTimeout: null
			}));

			if (sensorData.length === 1) {
				sensorData = [];
				pushNotifications.send(['heating'], 'ThermoSmart - Heating', 'All sensors are removed');
			} else {
				delete sensorData[id];
				pushNotifications.send(['heating'], 'ThermoSmart - Heating', 'Sensor removed');
			}
		}
	});
}, 10 * 1000);

exports.evts = evts;
