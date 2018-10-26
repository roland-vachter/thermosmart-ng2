const SensorSetting = require('../models/SensorSetting');

const EventEmitter = require('events');
const evts = new EventEmitter();

let sensorData = {};

exports.set = async (data) => {
	try {
		const id = data.id;

		if (
				!(sensorData[id] && Math.abs(data.temperature - sensorData[id].temperature) < 10) &&
				!(!sensorData[id] && data.temperature > 10)
			) {
			console.log(`INVALID SENSOR VALUES - id: ${id}, temperature: ${data.temperature}, humidity: ${data.humidity}`);
			return;
		}

		let sensorSetting = await SensorSetting.findOne({
			_id: id
		});

		if (!sensorSetting) {
			sensorSetting = new SensorSetting({
				_id: id,
				order: id,
				label: id,
				enabled: true,
				tempAdjust: 0,
				humidityAdjust: 0
			});
			await sensorSetting.save();
		}


		if (!sensorData[id]) {
			sensorData[id] = {
				id: id,
				enabled: sensorSetting.enabled,
				tempHistory: [],
				onHoldTempLowest: null,
				onHoldTempHighest: null
			};
		}


		let changesMade = false;

		if (sensorData[id].temperature !== data.temperature + sensorSetting.tempAdjust ||
				sensorData[id].humidity !== data.humidity + sensorSetting.humidityAdjust ||
				sensorData[id].active !== true) {
			changesMade = true;
		}

		sensorData[id].temperature = data.temperature + sensorSetting.tempAdjust;
		sensorData[id].humidity = data.humidity + sensorSetting.humidityAdjust;

		sensorData[id].reportedTemperature = data.temperature;
		sensorData[id].reportedHumidity = data.humidity;

		sensorData[id].lastUpdate = new Date();
		sensorData[id].active = true;

		//sensorData[id].enabled = sensorSetting.enabled;
		sensorData[id].label = sensorSetting.label;
		sensorData[id].tempAdjust = sensorSetting.tempAdjust;
		sensorData[id].humidityAdjust = sensorSetting.humidityAdjust;

		if (sensorSetting.enabled && sensorData[id].tempHistory.length) {
			const lastTemp = sensorData[id].tempHistory[0];
			const prevLastTemp = sensorData[id].tempHistory[1];

			if (sensorData[id].enabled) {
				if (lastTemp - data.temperature >= 0.15 || (prevLastTemp && prevLastTemp - data.temperature >= 0.25)) {
					sensorData[id].onHoldTempLowest = data.temperature;
					sensorData[id].onHoldTempHighest = null;
					sensorData[id].enabled = false;
					changesMade = true;
				}
			} else {
				if (data.temperature < sensorData[id].onHoldTempLowest) {
					sensorData[id].onHoldTempLowest = data.temperature;
				} else {
					if (!sensorData[id].onHoldTempHighest) {
						sensorData[id].onHoldTempHighest = data.temperature;
					} else {
						if (data.temperature > sensorData[id].onHoldTempHighest) {
							sensorData[id].onHoldTempHighest = data.temperature;
						} else {
							sensorData[id].enabled = true;
							sensorData[id].onHoldTempHighest = null;
							sensorData[id].onHoldTempLowest = null;
							changesMade = true;
						}
					}
				}
			}

			if (data.temperature <= 10) {
				sensorData[id].onHoldStatus = null;
				sensorData[id.enabled] = true;
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

exports.get = () => {
	return sensorData;
};

exports.toggleSensorStatus = async (id) => {
	const sensorSetting = await SensorSetting.findOne({
		_id: id
	});

	if (sensorSetting) {
		if (sensorSetting === sensorData[id].enabled) {
			sensorSetting.enabled = !sensorSetting.enabled;
			await sensorSetting.save();
		}

		if (sensorData[id]) {
			sensorData[id].enabled = sensorSetting.enabled;
			sensorData[id].onHoldTempLowest = null;
			sensorData[id].onHoldTempHighest = null;
			evts.emit('change', sensorData[id]);
		}

		return true;
	}

	return false;
};

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

		if (new Date().getTime() - sensorData[id].lastUpdate.getTime() > 5 * 60 * 1000) {
			if (sensorData[id].active !== false) {
				sensorData[id].active = false;

				sensorData[id].enabled = sensorSetting.enabled;
				sensorData[id].onHoldTempLowest = null;
				sensorData[id].onHoldTempHighest = null;

				evts.emit('change', sensorData[id]);
			}
		}

		if (new Date().getTime() - sensorData[id].lastUpdate.getTime() > 10 * 60 * 1000) {
			evts.emit('change', Object.assign({}, sensorData[id], {
				deleted: true
			}));

			if (sensorData.length === 1) {
				sensorData = [];
			} else {
				delete sensorData[id];
			}
		}
	});
}, 10 * 1000);

exports.evts = evts;
