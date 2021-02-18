const insideConditionsEvts = require('./insideConditions').evts;
const getSensors = require('./insideConditions').get;
const targetTempService = require('./targetTemp');
const configService = require('./config');

const EventEmitter = require('events');
const evts = new EventEmitter();

let isOn = false;
let lastStatusReadBySensor = false;
let lastChangeEventStatus;
const avgValues = {
	temperature: 0,
	humidity: 0
};

let poweredOn = true;
let until = null;

let suspendTimeout;

let initialized = false;

insideConditionsEvts.on('change', () => {
	avgValues.temperature = 0;
	avgValues.humidity = 0;

	const sensors = getSensors();

	const keys = Object.keys(sensors);
	let activeCount = 0;
	keys.forEach(key => {
		if (sensors[key].active && sensors[key].enabled) {
			avgValues.temperature += sensors[key].temperature;
			avgValues.humidity += sensors[key].humidity;
			activeCount++;
		}
	});

	avgValues.temperature = avgValues.temperature / activeCount;

	if (!initialized) {
		initialized = true;
	}

	updateHeatingStatus();
});

exports.isHeatingOn = (readFromSensor) => {
	if (readFromSensor) {
		lastStatusReadBySensor = true;

		if (lastChangeEventStatus !== isOn && isOn === true) {
			evts.emit('changeHeating', isOn);
			console.log('heating turned ' + (isOn ? 'on' : 'off'));
		}
		lastChangeEventStatus = isOn;
	}

	return isOn && lastStatusReadBySensor;
};

exports.getPowerStatus = () => {
	return {
		poweredOn,
		until
	};
};

exports.togglePower = () => {
	clearTimeout(suspendTimeout);
	if (poweredOn) {
		console.log('heating power off');
		poweredOn = false;
		until = new Date(new Date().getTime() + 15 * 60 * 1000);

		evts.emit('changeHeatingPower', {
			poweredOn,
			until
		});

		suspendTimeout = setTimeout(() => {
			exports.togglePower();
		}, 15 * 60 * 1000);
	} else {
		console.log('heating power on');
		poweredOn = true;
		until = null;

		evts.emit('changeHeatingPower', {
			poweredOn,
			until
		});
	}

	updateHeatingStatus();
};

exports.evts = evts;


function turnHeatingOn () {
	isOn = true;
	lastStatusReadBySensor = false;
}

function turnHeatingOff () {
	isOn = false;
	lastStatusReadBySensor = false;
	if (lastChangeEventStatus !== isOn) {
		evts.emit('changeHeating', isOn);
		console.log('heating turned off');
	}
	lastChangeEventStatus = isOn;
}

async function updateHeatingStatus () {
	if (!initialized) {
		return Promise.resolve();
	}

	try {
		let [switchThresholdBelow, switchThresholdAbove] = await Promise.all([
			configService.get('switchThresholdBelow'),
			configService.get('switchThresholdAbove')
		]);

		if (!switchThresholdBelow) {
			switchThresholdBelow = {
				value: 0.2
			};
		}

		if (!switchThresholdAbove) {
			switchThresholdAbove = {
				value: 0.2
			};
		}

		if (Number.isNaN(avgValues.temperature) || !poweredOn) {
			turnHeatingOff();
			return;
		}

		const target = targetTempService.get();
		if (target) {
			const sensors = getSensors();
			if (!isOn && avgValues.temperature <= target.value - switchThresholdBelow.value) {
				console.log('sensor data', JSON.stringify(sensors));
				turnHeatingOn();
			} else if (avgValues.temperature >= target.value + switchThresholdAbove.value) {
				if (isOn) {
					console.log('sensor data', JSON.stringify(sensors));
				}
				turnHeatingOff();
			}
		}
	} catch(err) {
		console.log("Error occured while fetching the heating plan for today", err);
	}
}
setInterval(updateHeatingStatus, 10000);
