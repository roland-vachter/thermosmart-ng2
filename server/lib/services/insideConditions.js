const SensorSetting = require('../models/SensorSetting');

const EventEmitter = require('events');
const evts = new EventEmitter();

let sensorData = {};

exports.set = async (data) => {
	try {
		if (
				!(sensorData[data.id] && Math.abs(data.temperature - sensorData[data.id].temperature) < 10) &&
				!(!sensorData[data.id] && data.temperature > 10)
			) {
			console.log(`INVALID SENSOR VALUES - id: ${data.id}, temperature: ${data.temperature}, humidity: ${data.humidity}`);
			return;
		}

		if (!sensorData[data.id]) {
			sensorData[data.id] = {
				id: data.id
			};
		}


		let sensorSetting = await SensorSetting.findOne({
			_id: data.id
		});

		if (!sensorSetting) {
			sensorSetting = new SensorSetting({
				_id: data.id,
				order: data.id,
				label: data.id,
				enabled: true,
				tempAdjust: 0,
				humidityAdjust: 0
			});
			await sensorSetting.save();
		}


		let changesMade = false;

		if (sensorData[data.id].temperature !== data.temperature + sensorSetting.tempAdjust ||
				sensorData[data.id].humidity !== data.humidity + sensorSetting.humidityAdjust ||
				sensorData[data.id].active !== true) {
			changesMade = true;
		}

		sensorData[data.id].temperature = data.temperature + sensorSetting.tempAdjust;
		sensorData[data.id].humidity = data.humidity + sensorSetting.humidityAdjust;

		sensorData[data.id].reportedTemperature = data.temperature;
		sensorData[data.id].reportedHumidity = data.humidity;

		sensorData[data.id].lastUpdate = new Date();
		sensorData[data.id].active = true;

		sensorData[data.id].enabled = sensorSetting.enabled;
		sensorData[data.id].label = sensorSetting.label;
		sensorData[data.id].tempAdjust = sensorSetting.tempAdjust;
		sensorData[data.id].humidityAdjust = sensorSetting.humidityAdjust;

		if (changesMade) {
			evts.emit('change', sensorData[data.id]);
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
		sensorSetting.enabled = !sensorSetting.enabled;
		await sensorSetting.save();

		if (sensorData[id]) {
			sensorData[id].enabled = sensorSetting.enabled;
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
			sensorData[id].humidity = sensorData[id].reportedHumidity + sensorSetting.humidityAdjust
		}

		await sensorSetting.save();

		evts.emit('change', sensorData[id]);

		return true;
	}

	return false;
};

setInterval(() => {
	Object.keys(sensorData).forEach(id => {
		if (new Date().getTime() - sensorData[id].lastUpdate.getTime() > 5 * 60 * 1000) {
			sensorData[id].active = false;

			evts.emit('change', sensorData[id]);
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
