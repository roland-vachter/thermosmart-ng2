import { getOutsideConditions, getOutsideTemperature } from './outsideConditions';
import heatingEvts from './heatingEvts';

import { insideConditionsEvts, getSensors, TemperatureDirection } from './insideConditions';
import { getConfig } from './config';
import { HydratedDocument } from 'mongoose';
import { IConfig } from '../models/Config';
import { getTargetTempByLocation } from './targetTemp';
import moment from 'moment-timezone';

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
	hasIncreasingTrend: boolean;
	hasFavorableWeatherForecast: boolean;
	until?: Date;
	suspendTimeout?: NodeJS.Timeout;
	initialized: boolean;
	shouldIgnoreHoldConditions: boolean;
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
	initialized: false,
	hasIncreasingTrend: false,
	hasFavorableWeatherForecast: false,
	shouldIgnoreHoldConditions: false
};
const statusByLocation: Record<number, Heating> = {};

const initLocation = (locationId: number) => {
	if (!statusByLocation[locationId]) {
		statusByLocation[locationId] = { ...defaultValues, avgValues: { ...defaultValues.avgValues } };
		statusByLocation[locationId].initialized = true;
	}
};

insideConditionsEvts.on('change', async (data) => {
	const location = data.location;
	initLocation(location);
	const locationStatus = statusByLocation[location];
	locationStatus.avgValues.temperature = 0;
	locationStatus.avgValues.humidity = 0;

	const sensors = getSensors(location);

	const keys = Object.keys(sensors).map(Number);
	let activeCount = 0;
	let hasWindowOpen = false;

	keys.forEach(key => {
		if (sensors[key].active && sensors[key].enabled) {
			locationStatus.avgValues.temperature += sensors[key].temperature;
			locationStatus.avgValues.humidity += sensors[key].humidity;
			activeCount++;
		}

		hasWindowOpen = hasWindowOpen || (sensors[key].windowOpen && sensors[key].enabled);
	});

	locationStatus.hasWindowOpen = hasWindowOpen;
	locationStatus.avgValues.temperature = locationStatus.avgValues.temperature / activeCount;

	emitConditionStatusChange(location);

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

export const getHeatingConditions = (locationId: number) => {
	initLocation(locationId);
	const locationStatus = statusByLocation[locationId];

	return {
		hasIncreasingTrend: locationStatus.hasIncreasingTrend,
		hasFavorableWeatherForecast: locationStatus.hasFavorableWeatherForecast,
		hasWindowOpen: locationStatus.hasWindowOpen,
		shouldIgnoreHoldConditions: locationStatus.shouldIgnoreHoldConditions
	};
}

export const ignoreHoldConditions = (locationId: number) => {
	initLocation(locationId);
	const locationStatus = statusByLocation[locationId];

	locationStatus.shouldIgnoreHoldConditions = true;
	locationStatus.hasIncreasingTrend = false;
	locationStatus.hasFavorableWeatherForecast = false;
	locationStatus.hasWindowOpen = false;

	emitConditionStatusChange(locationId);
}

export const endIgnoringHoldConditions = async (locationId: number) => {
	initLocation(locationId);
	const locationStatus = statusByLocation[locationId];

	locationStatus.shouldIgnoreHoldConditions = false;

	await updateHeatingStatusByLocation(locationId);
}



function emitConditionStatusChange(locationId: number) {
	initLocation(locationId);
	const locationStatus = statusByLocation[locationId];

	heatingEvts.emit('conditionStatusChange', {
		hasIncreasingTrend: locationStatus.hasIncreasingTrend,
		hasFavorableWeatherForecast: locationStatus.hasFavorableWeatherForecast,
		hasWindowOpen: locationStatus.hasWindowOpen,
		location: locationId,
		shouldIgnoreHoldConditions: locationStatus.shouldIgnoreHoldConditions
	});
}

function turnHeatingOn (locationId: number) {
	initLocation(locationId);
	const locationStatus = statusByLocation[locationId];

	locationStatus.isOn = true;
	locationStatus.lastStatusReadBySensor = false;
	locationStatus.shouldIgnoreHoldConditions = false;
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

		if (!locationStatus.poweredOn || locationStatus.hasWindowOpen) {
			console.log(`[${locationId}] turn off because of ` +
				(!locationStatus.poweredOn ? 'not power on' : 'has window open'));
			turnHeatingOff(locationId);
			return;
		}

		if (Number.isNaN(locationStatus.avgValues.temperature)) {
			console.log(`[${locationId}] turn off because there are no sensors.`);
			locationStatus.hasFavorableWeatherForecast = false;
			locationStatus.hasIncreasingTrend = false;
			locationStatus.hasWindowOpen = false;
			emitConditionStatusChange(locationId);
			turnHeatingOff(locationId);
			return;
		}

		const target = getTargetTempByLocation(locationId);
		if (target) {
			const sensors = getSensors(locationId);
			const [temperatureTrendsFeature, weatherForecastFeature] = await Promise.all([
				getConfig('temperatureTrendsFeature', locationId),
				getConfig('weatherForecastFeature', locationId)
			]);

			if (weatherForecastFeature?.value && !locationStatus.shouldIgnoreHoldConditions &&
					target?.value < getOutsideTemperature()) {
				console.log(`[${locationId}] turn off because target temperature is below outside temperature.`);
				turnHeatingOff(locationId);
			}

			if (!locationStatus.isOn) {
				let conditionToStart = locationStatus.avgValues.temperature <= target.value - (switchThresholdBelow.value as number);

				if (weatherForecastFeature?.value && !locationStatus.shouldIgnoreHoldConditions) {
					if (target?.value < getOutsideTemperature()) {
						conditionToStart = false;
						locationStatus.hasFavorableWeatherForecast = true;
					} else if (target.value - locationStatus.avgValues.temperature < 0.4 &&
							moment().valueOf() > getOutsideConditions().sunrise &&
								(
									getOutsideConditions().highestExpectedTemperature > locationStatus.avgValues.temperature ||
									getOutsideConditions().sunshineNextConsecutiveHours >= 2
								)
							) {
								conditionToStart = false;
								locationStatus.hasFavorableWeatherForecast = true;
					} else {
						locationStatus.hasFavorableWeatherForecast = false;
					}
				} else {
					locationStatus.hasFavorableWeatherForecast = false;
				}

				if (temperatureTrendsFeature?.value && !locationStatus.shouldIgnoreHoldConditions) {
					const sensorsWithIncreasingTemps = Object.keys(sensors).map(Number).filter(k => sensors[k].temperatureDirection === TemperatureDirection.increase);
					if (sensorsWithIncreasingTemps?.length >= Object.keys(sensors)?.length / 2 &&
							target.value - locationStatus.avgValues.temperature < 0.4) {
						conditionToStart = false;
						locationStatus.hasIncreasingTrend = true;
					} else {
						locationStatus.hasIncreasingTrend = false;
					}
				} else {
					locationStatus.hasIncreasingTrend = false;
				}

				emitConditionStatusChange(locationId);

				if (conditionToStart) {
					turnHeatingOn(locationId);
				}
			} else if (locationStatus.avgValues.temperature >= target.value + (switchThresholdAbove.value as number)) {
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
