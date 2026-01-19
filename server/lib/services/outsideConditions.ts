"use strict";

import EventEmitter from 'events';
import { getBackgroundImage } from './backgroundImage';
import { DAYTIME, OutsideConditions, SunshineForecastWithPower, WEATHER_TYPE, WeatherResponse } from '../types/outsideConditions';
import TypedEmitter from 'typed-emitter';
import moment from 'moment-timezone';
import { getWeatherData as getOpenWeatherData } from './openWeatherMap';
import { getWeatherData as getWeatherApiData } from './weatherApi';

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

const SUN_POWER_BY_MONTH: Record<number, number> = {
	'1': 0.7,
	'2': 0.8,
	'3': 0.9,
	'4': 1,
	'5': 1.1,
	'6': 1.3,
	'7': 1.5,
	'8': 1.4,
	'9': 1.1,
	'10': 1,
	'11': 0.9,
	'12': 0.6
};

async function update () {
	try {
		let weatherData: WeatherResponse;

		if (process.env.WEATHER_API_TYPE === 'WEATHER_API') {
			weatherData = await getWeatherApiData();
		} else {
			weatherData = await getOpenWeatherData();
		}

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
					lastValues.sunset = weatherData.current.sunset;
					lastValues.sunny = weatherData.current.sunny;
				}

				const daytimeLengthMinutes = (weatherData.current.sunset - weatherData.current.sunrise) / (60 * 1000);
				const peakSunshine = weatherData.current.sunrise / 1000 + daytimeLengthMinutes / 2 * 60;
				let tempMultiplier = 1;
				if (lastValues.temperature < -10) {
					tempMultiplier = 0.3;
				} else if (lastValues.temperature < 0) {
					tempMultiplier = 0.6;
				} else if (lastValues.temperature < 5) {
					tempMultiplier = 0.8;
				} else if (lastValues.temperature < 10) {
					tempMultiplier = 1;
				} else if (lastValues.temperature < 15) {
					tempMultiplier = 1.2;
				} else {
					tempMultiplier = 1.5;
				}

				lastValues.sunPower = 0.5 + 0.5 * ((daytimeLengthMinutes / 2 - Math.abs(Date.now() / 1000 - peakSunshine) / 60) / (daytimeLengthMinutes / 2)) * tempMultiplier;

				if (weatherData.forecast) {
					lastValues.highestExpectedTemperature = weatherData.forecast.highestExpectedTemperature;
					lastValues.sunshineForecast = weatherData.forecast.sunshineForecast.map(f => {
						const forecast = f as SunshineForecastWithPower;
						const minutesFromPeakSunshine = Math.abs(f.timestamp / 1000 - peakSunshine) / 60;

						if (f.sunny && minutesFromPeakSunshine < daytimeLengthMinutes / 2) {
							forecast.sunPower = 0.5 + 0.5 * ((daytimeLengthMinutes / 2 - minutesFromPeakSunshine) / (daytimeLengthMinutes / 2));
						}

						if (forecast.sunPower < 0 || !forecast.sunPower) {
							forecast.sunPower = 0;
						}

						tempMultiplier = 1;
						if (forecast.temp < -10) {
							tempMultiplier = 0.3;
						} else if (forecast.temp < 0) {
							tempMultiplier = 0.6;
						} else if (forecast.temp < 5) {
							tempMultiplier = 0.8;
						} else if (forecast.temp < 10) {
							tempMultiplier = 1;
						} else if (forecast.temp < 15) {
							tempMultiplier = 1.2;
						} else {
							tempMultiplier = 1.5;
						}

						forecast.sunPower = forecast.sunPower * SUN_POWER_BY_MONTH[moment(f.timestamp).tz('Europe/Bucharest').month() + 1] * tempMultiplier;

						return forecast;
					});
					lastValues.totalNumberOfSunshineExpected = weatherData.forecast.totalNumberOfSunshineExpected;
					lastValues.sunshineNextConsecutiveHours = lastValues.sunshineForecast.reduce((acc, v) => {
						if (v.sunny && acc.consecutive) {
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
