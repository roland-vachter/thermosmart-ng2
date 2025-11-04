"use strict";

import EventEmitter from 'events';
import { getBackgroundImage } from './backgroundImage';
import { DAYTIME, OutsideConditions, WEATHER_TYPE, WeatherResponse } from '../types/outsideConditions';
import TypedEmitter from 'typed-emitter';
import moment from 'moment-timezone';
import { getWeatherData } from './weatherApi';

const lastValues: OutsideConditions = {} as OutsideConditions;

const weatherIconClassMapping: Record<DAYTIME, Record<WEATHER_TYPE, string>> = {
	[DAYTIME.day]: {
		[WEATHER_TYPE.clear]: 'icon-sun2',
		[WEATHER_TYPE.partlycloudy]: 'icon-cloud-12',
		[WEATHER_TYPE.cloudy]: 'icon-cloud2',
		[WEATHER_TYPE.verycloudy]: 'icon-cloudy2',
		[WEATHER_TYPE.rain]: 'icon-rain-4',
		[WEATHER_TYPE.heavyrain]: 'icon-rain2',
		[WEATHER_TYPE.tstorms]: 'icon-storm2',
		[WEATHER_TYPE.snow]: 'icon-snowing',
		[WEATHER_TYPE.fog]: 'icon-haze'
	},
	[DAYTIME.night]: {
		[WEATHER_TYPE.clear]: 'icon-night2',
		[WEATHER_TYPE.partlycloudy]: 'icon-night3',
		[WEATHER_TYPE.cloudy]: 'icon-cloud2',
		[WEATHER_TYPE.verycloudy]: 'icon-cloudy2',
		[WEATHER_TYPE.rain]: 'icon-rainy',
		[WEATHER_TYPE.heavyrain]: 'icon-rain2',
		[WEATHER_TYPE.tstorms]: 'icon-storm2',
		[WEATHER_TYPE.snow]: 'icon-snowing',
		[WEATHER_TYPE.fog]: 'icon-haze'
	}
};



const weatherColorMapping: Record<DAYTIME, Record<WEATHER_TYPE, string>> = {
	[DAYTIME.day]: {
		[WEATHER_TYPE.clear]: 'orange',
		[WEATHER_TYPE.partlycloudy]: 'gray',
		[WEATHER_TYPE.cloudy]: 'gray',
		[WEATHER_TYPE.verycloudy]: 'dark-gray',
		[WEATHER_TYPE.rain]: 'blue',
		[WEATHER_TYPE.heavyrain]: 'dark-blue',
		[WEATHER_TYPE.tstorms]: 'navy',
		[WEATHER_TYPE.snow]: 'aqua',
		[WEATHER_TYPE.fog]: 'silver'
	},
	[DAYTIME.night]: {
		[WEATHER_TYPE.clear]: 'dark-blue',
		[WEATHER_TYPE.partlycloudy]: 'gray',
		[WEATHER_TYPE.cloudy]: 'gray',
		[WEATHER_TYPE.verycloudy]: 'dark-gray',
		[WEATHER_TYPE.rain]: 'gray',
		[WEATHER_TYPE.heavyrain]: 'gray',
		[WEATHER_TYPE.tstorms]: 'dark-gray',
		[WEATHER_TYPE.snow]: 'gray',
		[WEATHER_TYPE.fog]: 'gray'
	}
};

async function update () {
	try {
		const weatherData: WeatherResponse = await getWeatherData();

		if (weatherData) {
			if (weatherData.current) {
				if (lastValues.temperature !== weatherData.current.temperature
						|| lastValues.humidity !== weatherData.current.humidity
						|| lastValues.weatherIconClass !== weatherIconClassMapping[weatherData.current.daytime][weatherData.current.weatherType]
						|| lastValues.daytime !== weatherData.current.daytime) {
					lastValues.temperature = weatherData.current.temperature;
					lastValues.humidity = weatherData.current.humidity;
					lastValues.daytime = weatherData.current.daytime;
					lastValues.color = weatherColorMapping[weatherData.current.daytime][weatherData.current.weatherType];
					lastValues.weatherIconClass = weatherIconClassMapping[weatherData.current.daytime][weatherData.current.weatherType];
					lastValues.backgroundImage = getBackgroundImage(weatherData.current.weatherType, weatherData.current.daytime);
					lastValues.sunrise = weatherData.current.sunrise;
					lastValues.sunny = weatherData.current.sunny;
				}

				if (weatherData.forecast) {
					lastValues.highestExpectedTemperature = weatherData.forecast.highestExpectedTemperature;
					lastValues.sunshineForecast = weatherData.forecast.sunshineForecast;
					lastValues.totalNumberOfSunshineExpected = weatherData.forecast.totalNumberOfSunshineExpected;
					lastValues.sunshineNextConsecutiveHours = lastValues.sunshineForecast.reduce((acc, v) => {
						if (v && acc.consecutive) {
							acc.count++;
						} else {
							acc.consecutive = false;
						}
						return acc;
					}, { count: 0, consecutive: true }).count;
				}
			}

			outsideConditionsEvts.emit('change', lastValues);
		}
	} catch (e) {
		console.error(e);
	};
}

export const getOutsideConditions = (): OutsideConditions => {
	const sunrise = lastValues?.sunrise ? moment(lastValues?.sunrise).tz('Europe/Bucharest') : null;
	return {
		...lastValues,
		sunrise: sunrise ? moment().tz('Europe/Bucharest').hour(sunrise.hour()).minute(sunrise.minute()).valueOf() : null
	};
};

export const outsideConditionsEvts = new EventEmitter() as TypedEmitter<{ change: (o: OutsideConditions) => void }>;
export const getOutsideTemperature = () => lastValues.temperature;

setInterval(() => {
	void update();
}, 5 * 60 * 1000);
void update();
