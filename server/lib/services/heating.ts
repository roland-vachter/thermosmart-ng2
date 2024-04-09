import { getOutsideTemperature } from './outsideConditions';
import heatingEvts from './heatingEvts';

import { insideConditionsEvts, getSensors } from './insideConditions';
import { getConfig } from './config';
import { HydratedDocument } from 'mongoose';
import { IConfig } from '../models/Config';
import { getTargetTempByLocation } from './targetTemp';

interface Heating {
	isOn: boolean;
	lastStatusReadBySensor: boolean;
	lastChangeEventStatus: boolean | null;
	avgValues: {
		temperature: number;
		humidity: number;
	};
	poweredOn: boolean;
	hasWindowOpen: boolean;
	until?: Date;
	suspendTimeout?: NodeJS.Timeout;
	initialized: boolean;
}

const defaultValues: Heating = {
	isOn: false,
	lastStatusReadBySensor: false,
	lastChangeEventStatus: null,
	avgValues: {
		temperature: NaN,
		humidity: NaN
	},
	poweredOn: true,
	hasWindowOpen: false,
	initialized: false
};
const statusByLocation: Record<number, Heating> = {};

const initLocation = (locationId: number) => {
	if (!statusByLocation[locationId]) {
		statusByLocation[locationId] = { ...defaultValues, avgValues: { ...defaultValues.avgValues } };
		statusByLocation[locationId].initialized = true;
	}
};

insideConditionsEvts.on('change', async (data) => {
	console.log(`[${data.location}].${data.id}=${data.temperature} inside condition event got`);
	const location = data.location;
	initLocation(location);
	const locationStatus = statusByLocation[location];
	locationStatus.avgValues.temperature = 0;
	locationStatus.avgValues.humidity = 0;

	const sensors = getSensors(location);

	const keys = Object.keys(sensors).map(Number);
	let activeCount = 0;
	let hasWindowOpen = false;

	let debug = '';
	keys.forEach(key => {
		if (sensors[key].active && sensors[key].enabled && (sensors[key].temperature || 0) > getOutsideTemperature()) {
			debug += `${key}(${sensors[key].temperature}) + `;
			locationStatus.avgValues.temperature += sensors[key].temperature;
			locationStatus.avgValues.humidity += sensors[key].humidity;
			activeCount++;
		}

		hasWindowOpen = hasWindowOpen || (sensors[key].windowOpen && sensors[key].enabled);
	});

	locationStatus.hasWindowOpen = hasWindowOpen;
	locationStatus.avgValues.temperature = locationStatus.avgValues.temperature / activeCount;

	debug += ` = ${locationStatus.avgValues.temperature}`;

	console.log(`[${location}] temps: ` + debug);

	await updateHeatingStatusByLocation(location);
});

export const isHeatingOn = (locationId: number, readFromControllerSensor: boolean = false) => {
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

export const getPowerStatus = (locationId: number) => {
	initLocation(locationId);
	const locationStatus = statusByLocation[locationId];

	return {
		poweredOn: locationStatus.poweredOn,
		until: locationStatus.until
	};
};

export const togglePower = async (locationId: number) => {
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
			void togglePower(locationId);
		}, 15 * 60 * 1000);
	} else {
		console.log(`[${locationId}] heating power on`);
		locationStatus.poweredOn = true;
		locationStatus.until = undefined;

		heatingEvts.emit('changeHeatingPower', {
			location: locationId,
			poweredOn: locationStatus.poweredOn,
			until: locationStatus.until
		});
	}

	await updateHeatingStatusByLocation(locationId);
};


function turnHeatingOn (locationId: number) {
	initLocation(locationId);
	const locationStatus = statusByLocation[locationId];

	locationStatus.isOn = true;
	locationStatus.lastStatusReadBySensor = false;
}

function turnHeatingOff (locationId: number) {
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
	return Promise.all(Object.keys(statusByLocation).map(Number).map(locationId => updateHeatingStatusByLocation(locationId)));
}

async function updateHeatingStatusByLocation (locationId: number) {
	initLocation(locationId);
	const locationStatus = statusByLocation[locationId];

	try {
		let [switchThresholdBelow, switchThresholdAbove] = await Promise.all([
			getConfig('switchThresholdBelow', locationId),
			getConfig('switchThresholdAbove', locationId)
		]);

		if (!switchThresholdBelow) {
			switchThresholdBelow = {
				name: 'switchThresholdBelow',
				value: 0.1
			} as HydratedDocument<IConfig>;
		}

		if (!switchThresholdAbove) {
			switchThresholdAbove = {
				name: 'switchThresholdAbove',
				value: 0.1
			} as HydratedDocument<IConfig>;
		}

		if (Number.isNaN(locationStatus.avgValues.temperature) || !locationStatus.poweredOn || locationStatus.hasWindowOpen) {
			console.log(`[${locationId}] turn off because of ` +
				(Number.isNaN(locationStatus.avgValues.temperature) ? 'avgTemp NaN' :
				(!locationStatus.poweredOn ? 'not power on' : 'has window open')));
			turnHeatingOff(locationId);
			return;
		}

		const target = getTargetTempByLocation(locationId);
		if (target) {
			const sensors = getSensors(locationId);
			console.log(`[${locationId}] locationStatus.avgValues.temperature`, locationStatus.avgValues.temperature);
			console.log(`[${locationId}] target.value + treshold`, target.value + (switchThresholdAbove.value as number));

			if (!locationStatus.isOn && locationStatus.avgValues.temperature <= target.value - (switchThresholdBelow.value as number)) {
				if (!locationStatus.isOn) {
					console.log(`[${locationId}] sensor data`, locationId, JSON.stringify(sensors));
				}
				turnHeatingOn(locationId);
			} else if (locationStatus.avgValues.temperature >= target.value + (switchThresholdAbove.value as number)) {
				if (locationStatus.isOn) {
					console.log(`[${locationId}] sensor data`, locationId, JSON.stringify(sensors));
				}
				turnHeatingOff(locationId);
			}
		} else {
			console.log('no target temperature!');
		}
	} catch(err) {
		console.error("Error occured while fetching the heating plan for today", err);
	}
}
setInterval(updateHeatingStatus, 10000);
