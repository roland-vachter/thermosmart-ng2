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
				tempHistory: [],
				onHoldTempLowest: null,
				onHoldTempHighest: null,
				onHoldStatus: null,
				location: sensorSetting.location,
				lastSavedTemperature: null,
				tempDirection: null
			};
		}


		let changesMade = false;

		if (sensorData[id].temperature !== temp ||
				sensorData[id].humidity !== humidity ||
				sensorData[id].active !== true) {
			changesMade = true;
		}

		sensorData[id].temperature = temp;
		sensorData[id].humidity = humidity;

		sensorData[id].reportedTemperature = data.temperature;
		sensorData[id].reportedHumidity = data.humidity;

		sensorData[id].lastUpdate = new Date();
		sensorData[id].active = true;

		sensorData[id].label = sensorSetting.label;
		sensorData[id].tempAdjust = sensorSetting.tempAdjust;
		sensorData[id].humidityAdjust = sensorSetting.humidityAdjust;


		if (!sensorData[id].lastSavedTemperature || sensorData[id].temperature !== sensorData[id].lastSavedTemperature) {
			const newDir = !sensorData[id].lastSavedTemperature ? null : sensorData[id].temperature < sensorData[id].lastSavedTemperature ? 'falling' : 'rising';
			if (!sensorData[id].lastSavedTemperature ||
				!sensorData[id].tempDirection ||
				sensorData[id].tempDirection === newDir ||
				Math.abs(sensorData[id].temperature - sensorData[id].lastSavedTemperature) > 0.15) {
					new HeatingSensorHistory({
						sensor: id,
						t: sensorData[id].temperature,
						h: sensorData[id].humidity,
						datetime: new Date()
					}).save();
					sensorData[id].lastSavedTemperature = sensorData[id].temperature;
					sensorData[id].tempDirection = newDir;
			}
		}

		if (!heatingOnByLocation[data.location] && sensorSetting.enabled && sensorData[id].tempHistory.length) {
			const lastTemp = sensorData[id].tempHistory[0];
			const prevLastTemp = sensorData[id].tempHistory[1];

			if (!sensorData[id].onHoldStatus) {
				if (lastTemp - data.temperature >= 0.15 || (prevLastTemp && prevLastTemp - data.temperature >= 0.25)) {
					sensorData[id].onHoldTempLowest = data.temperature;
					sensorData[id].onHoldTempHighest = null;
					changesMade = true;

					sensorData[id].onHoldStatus = 'firstDecrease';
				}
			} else if (sensorData[id].onHoldStatus === 'firstDecrease') {
				if (lastTemp - data.temperature >= 0.15) {
					sensorData[id].onHoldTempLowest = data.temperature;
					sensorData[id].windowOpen = true;

					changesMade = true;
					sensorData[id].onHoldStatus = 'decrease';
				} else {
					sensorData[id].onHoldStatus = null;
					sensorData[id].onHoldTempLowest = null;
					sensorData[id].onHoldTempHighest = null;
					sensorData[id].windowOpen = false;
					changesMade = true;
				}
			} else if (sensorData[id].onHoldStatus === 'decrease') {
					if (data.temperature <= sensorData[id].onHoldTempLowest) {
						sensorData[id].onHoldTempLowest = data.temperature;
					} else {
						sensorData[id].onHoldStatus = 'firstIncrease';
					}
			} else if (sensorData[id].onHoldStatus === 'firstIncrease') {
				if (data.temperature <= sensorData[id].onHoldTempLowest) {
					sensorData[id].onHoldStatus = 'decrease';
					sensorData[id].onHoldTempLowest = data.temperature;
				} else if (data.temperature < lastTemp) {
					sensorData[id].onHoldStatus = 'decrease';
				} else if (data.temperature > lastTemp) {
					sensorData[id].onHoldStatus = 'increase';
					sensorData[id].onHoldTempHighest = data.temperature;
				}
			} else if (sensorData[id].onHoldStatus === 'increase') {
				if (data.temperature > sensorData[id].onHoldTempHighest) {
					sensorData[id].onHoldTempHighest = data.temperature;
				} else {
					sensorData[id].onHoldStatus = 'firstStabilized';
				}
			} else if (sensorData[id].onHoldStatus === 'firstStabilized') {
				if (data.temperature > sensorData[id].onHoldTempHighest) {
					sensorData[id].onHoldTempHighest = data.temperature;
					sensorData[id].onHoldStatus = 'increase';
				} else if (data.temperature > lastTemp) {
					sensorData[id].onHoldStatus = 'increase';
				} else {
					sensorData[id].windowOpen = false;
					sensorData[id].onHoldStatus = null;
					sensorData[id].onHoldTempHighest = null;
					sensorData[id].onHoldTempLowest = null;
					changesMade = true;
				}
			}

			if (data.temperature <= 10) {
				sensorData[id].onHoldStatus = null;
				sensorData[id].windowOpen = false;
			}
		}

		sensorData[id].tempHistory.unshift(data.temperature);
		if (sensorData[id].tempHistory.length > 5) {
			sensorData[id].tempHistory.pop();
		}

		if (changesMade) {
			evts.emit('change', sensorData[id]);
		}
	} catch (e) {
		console.error("Error saving sensor data", e);
	}
};

exports.get = (locationId) => {
	const sensorDataByLocation = {};

	Object.keys(sensorData).forEach(id => {
		if (sensorData[id].location === locationId) {
			sensorDataByLocation[id] = sensorData[id];
		}
	});

	return sensorDataByLocation;
};

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
			evts.emit('change', sensorData[id]);
		}

		return true;
	}

	return false;
};

exports.disableSensorWindowOpen = (id) => {
	if (sensorData[id]) {
		sensorData[id].windowOpen = false;
		evts.emit('change', sensorData[id]);
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

		evts.emit('change', sensorData[id]);

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
				sensorData[id].onHoldTempLowest = null;
				sensorData[id].onHoldTempHighest = null;
				sensorData[id].onHoldStatus = null;

				evts.emit('change', sensorData[id]);
			}
		}

		if (new Date().getTime() - sensorData[id].lastUpdate.getTime() > 15 * 60 * 1000) {
			evts.emit('change', Object.assign({}, sensorData[id], {
				deleted: true
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
