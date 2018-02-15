const insideConditions = require('./insideConditions');
const targetTempService = require('./targetTemp');
const configService = require('./config');

const EventEmitter = require('events');
const evts = new EventEmitter();

let isOn = false;
let lastChangeEventStatus;
const avgValues = {
	temperature: 0,
	humidity: 0
};

let initialized = false;

insideConditions.evts.on('change', () => {
	avgValues.temperature = 0;
	avgValues.humidity = 0;

	const sensors = insideConditions.get();

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

exports.isHeatingOn = () => {
	return isOn;
};

exports.evts = evts;


function turnHeatingOn () {
	isOn = true;
	if (lastChangeEventStatus !== isOn) {
		evts.emit('change', isOn);
		console.log('heating turned on');
	}
	lastChangeEventStatus = isOn;
}

function turnHeatingOff () {
	isOn = false;
	if (lastChangeEventStatus !== isOn) {
		evts.emit('change', isOn);
		console.log('heating turned off');
	}
	lastChangeEventStatus = isOn;
}

async function updateHeatingStatus () {
	if (!initialized) {
		return Promise.resolve();
	}

	try {
		[switchThresholdBelow, switchThresholdAbove] = await Promise.all([
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

		const target = await targetTempService();
		if (!isOn && avgValues.temperature <= target - switchThresholdBelow.value) {
			turnHeatingOn();
		} else if (avgValues.temperature >= target + switchThresholdAbove.value) {
			turnHeatingOff();
		}
	} catch(err) {
		console.log("Error occured while fetching the heating plan for today", err);
	}
}
setInterval(updateHeatingStatus, 10000);
