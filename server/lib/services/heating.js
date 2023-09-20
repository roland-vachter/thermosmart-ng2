const insideConditionsEvts = require('./insideConditions').evts;
const outsideConditions = require('./outsideConditions');
const getSensors = require('./insideConditions').get;
const targetTempService = require('./targetTemp');
const configService = require('./config');
const heatingEvts = require('./heatingEvts');

const defaultValues = {
	isOn: false,
	lastStatusReadBySensor: false,
	lastChangeEventStatus: null,
	avgValues: {
		temperature: NaN,
		humidity: NaN
	},
	poweredOn: true,
	hasWindowOpen: false,
	until: null,
	suspendTimeout: null,
	initialized: false
};
const statusByLocation = {};

const initLocation = (locationId) => {
	if (!statusByLocation[locationId]) {
		statusByLocation[locationId] = { ...defaultValues, avgValues: { ...defaultValues.avgValues } };
		statusByLocation[locationId].initialized = true;
	}
};

insideConditionsEvts.on('change', (data) => {
	initLocation(data.location);
	const locationStatus = statusByLocation[data.location];
	locationStatus.avgValues.temperature = 0;
	locationStatus.avgValues.humidity = 0;

	const sensors = getSensors(data.location);

	const keys = Object.keys(sensors);
	let activeCount = 0;
	let hasWindowOpen = false;
	keys.forEach(key => {
		if (sensors[key].active && sensors[key].enabled && sensors[key].temperature > outsideConditions.temperature) {
			locationStatus.avgValues.temperature += sensors[key].temperature;
			locationStatus.avgValues.humidity += sensors[key].humidity;
			activeCount++;
		}

		hasWindowOpen = hasWindowOpen || (sensors[key].windowOpen && sensors[key].enabled);
	});

	locationStatus.hasWindowOpen = hasWindowOpen;
	locationStatus.avgValues.temperature = locationStatus.avgValues.temperature / activeCount;

	updateHeatingStatusByLocation(data.location);
});

exports.isHeatingOn = (locationId, readFromControllerSensor) => {
	initLocation(locationId);
	const locationStatus = statusByLocation[locationId];

	if (readFromControllerSensor) {
		console.log('read from controller sensor', locationId);
		locationStatus.lastStatusReadBySensor = true;

		if (locationStatus.lastChangeEventStatus !== locationStatus.isOn) {
			heatingEvts.emit('changeHeating', {
				isOn: locationStatus.isOn,
				location: locationId
			});
			console.log('[' + locationId + '] heating turned ' + (locationStatus.isOn ? 'on' : 'off'));
		}
		locationStatus.lastChangeEventStatus = locationStatus.isOn;
	}

	return locationStatus.isOn && locationStatus.lastStatusReadBySensor;
};

exports.getPowerStatus = (locationId) => {
	initLocation(locationId);
	const locationStatus = statusByLocation[locationId];

	return {
		poweredOn: locationStatus.poweredOn,
		until: locationStatus.until
	};
};

exports.togglePower = (locationId) => {
	initLocation(locationId);
	const locationStatus = statusByLocation[locationId];

	clearTimeout(locationStatus.suspendTimeout);
	if (locationStatus.poweredOn) {
		console.log(`[${locationId}] heating power off`);
		locationStatus.poweredOn = false;
		locationStatus.until = new Date(new Date().getTime() + 15 * 60 * 1000);

		heatingEvts.emit('changeHeatingPower', {
			location: locationId,
			poweredOn: locationStatus.poweredOn,
			until: locationStatus.until
		});

		locationStatus.suspendTimeout = setTimeout(() => {
			exports.togglePower(locationId);
		}, 15 * 60 * 1000);
	} else {
		console.log(`[${locationId}] heating power on`);
		locationStatus.poweredOn = true;
		locationStatus.until = null;

		heatingEvts.emit('changeHeatingPower', {
			location: locationId,
			poweredOn: locationStatus.poweredOn,
			until: locationStatus.until
		});
	}

	updateHeatingStatusByLocation(locationId);
};


function turnHeatingOn (locationId) {
	initLocation(locationId);
	const locationStatus = statusByLocation[locationId];

	locationStatus.isOn = true;
	locationStatus.lastStatusReadBySensor = false;

	if (locationStatus.lastChangeEventStatus === false || locationStatus.lastChangeEventStatus === null) {
		heatingEvts.emit('changeHeating', {
			isOn: locationStatus.isOn,
			location: locationId
		});
		console.log(`[${locationId}] heating turn on`);
	}
	locationStatus.lastChangeEventStatus = locationStatus.isOn;
}

function turnHeatingOff (locationId) {
	initLocation(locationId);
	const locationStatus = statusByLocation[locationId];

	locationStatus.isOn = false;
	locationStatus.lastStatusReadBySensor = false;
	if (locationStatus.lastChangeEventStatus === true || locationStatus.lastChangeEventStatus === null) {
		heatingEvts.emit('changeHeating', {
			isOn: locationStatus.isOn,
			location: locationId
		});
		console.log(`[${locationId}] heating turn off`);
	}
	locationStatus.lastChangeEventStatus = locationStatus.isOn;
}

async function updateHeatingStatus () {
	return Promise.all(Object.keys(statusByLocation).map(locationId => updateHeatingStatusByLocation(locationId)));
}

async function updateHeatingStatusByLocation (locationId) {
	initLocation(locationId);
	const locationStatus = statusByLocation[locationId];

	try {
		let [switchThresholdBelow, switchThresholdAbove] = await Promise.all([
			configService.get('switchThresholdBelow', locationId),
			configService.get('switchThresholdAbove', locationId)
		]);

		if (!switchThresholdBelow) {
			switchThresholdBelow = {
				value: 0.1
			};
		}

		if (!switchThresholdAbove) {
			switchThresholdAbove = {
				value: 0.1
			};
		}

		if (Number.isNaN(locationStatus.avgValues.temperature) || !locationStatus.poweredOn || locationStatus.hasWindowOpen) {
			turnHeatingOff(locationId);
			return;
		}

		const target = targetTempService.get(locationId);
		if (target) {
			const sensors = getSensors(locationId);
			if (!locationStatus.isOn && locationStatus.avgValues.temperature <= target.value - switchThresholdBelow.value) {
				console.log('sensor data', locationId, JSON.stringify(sensors));
				turnHeatingOn(locationId);
			} else if (locationStatus.avgValues.temperature >= target.value + switchThresholdAbove.value) {
				if (locationStatus.isOn) {
					console.log('sensor data', locationId, JSON.stringify(sensors));
				}
				turnHeatingOff(locationId);
			}
		}
	} catch(err) {
		console.error("Error occured while fetching the heating plan for today", err);
	}
}
setInterval(updateHeatingStatus, 10000);
