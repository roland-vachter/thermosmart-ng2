"use strict";

import EventEmitter from 'events';
import { getBackgroundImage } from './backgroundImage';
import { fetch } from '../utils/fetch';
import { DAYTIME, OutsideConditions, WEATHER_TYPE } from '../types/outsideConditions';
import { ErrorWithResponse } from '../types/generic';
import TypedEmitter from 'typed-emitter';
import moment from 'moment-timezone';

interface Forecast {
	dt: number;
	temp: number;
	clouds: number;
	weather: {
		main: string;
	}[];
}

interface WeatherApiResponse {
	current: {
		temp: number;
		humidity: number;
		sunrise: number;
		sunset: number;
		weather: {
			icon: string;
			main: string;
		}[];
	};
	hourly: Forecast[];
}
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

const weatherTypeMapping: Record<number, WEATHER_TYPE> = {
	1: WEATHER_TYPE.clear,
	2: WEATHER_TYPE.partlycloudy,
	3: WEATHER_TYPE.cloudy,
	4: WEATHER_TYPE.verycloudy,
	9: WEATHER_TYPE.rain,
	10: WEATHER_TYPE.heavyrain,
	11: WEATHER_TYPE.tstorms,
	13: WEATHER_TYPE.snow,
	50: WEATHER_TYPE.fog
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
		const resWeather = await fetch(`${process.env.WEATHER_API_URL}?appid=${process.env.WEATHER_API_KEY}&lat=${process.env.LOCATION_LAT}&lon=${process.env.LOCATION_LNG}&units=metric&exclude=minutely,daily,alerts`);

		if (!resWeather.ok) {
			const err = new ErrorWithResponse(resWeather.status.toString(), resWeather);
			throw err;
		}

		const jsonWeather: WeatherApiResponse = await resWeather.json() as WeatherApiResponse;

		if (jsonWeather) {
			if (jsonWeather.current) {
				const temperature = jsonWeather.current.temp;
				const humidity = jsonWeather.current.humidity;
				const sunrise = jsonWeather.current.sunrise * 1000;
				const sunset = jsonWeather.current.sunset * 1000;
				const weatherType: WEATHER_TYPE = weatherTypeMapping[parseInt(jsonWeather.current.weather[0].icon.substring(0, 2), 10)];

				let daytime;
				if (Date.now() > sunrise && Date.now() < sunset) {
					daytime = DAYTIME.day;
				} else {
					daytime = DAYTIME.night;
				}

				if (lastValues.temperature !== temperature
						|| lastValues.humidity !== humidity
						|| lastValues.weatherIconClass !== weatherIconClassMapping[daytime][weatherType]
						|| lastValues.daytime !== daytime) {
					lastValues.temperature = temperature;
					lastValues.humidity = humidity;
					lastValues.daytime = daytime;
					lastValues.color = weatherColorMapping[daytime][weatherType];
					lastValues.weatherDescription = jsonWeather.current.weather[0].main;
					lastValues.weatherIconClass = weatherIconClassMapping[daytime][weatherType];
					lastValues.backgroundImage = getBackgroundImage(weatherType, daytime);
					lastValues.sunrise = sunrise;
					lastValues.sunny = daytime === DAYTIME.day && jsonWeather.current.weather[0].main === 'Clear';
				}

				if (jsonWeather.hourly) {
					const forecast: Forecast[] = [];
					jsonWeather.hourly.forEach(h => {
						if (h.dt * 1000 <= moment().endOf('day').valueOf()) {
							forecast.push(h);
						}
					});

					lastValues.highestExpectedTemperature = forecast.reduce((acc, v) => v.temp > acc ? v.temp : acc, forecast.length && forecast[0].temp || 0);
					lastValues.totalNumberOfSunshineExpected = forecast.reduce((acc, v) => {
						if (v.weather[0].main === 'Clear' && v.dt * 1000 >= sunrise && v.dt * 1000 < sunset) {
							acc++;
						}

						return acc;
					}, 0);
					lastValues.sunshineNextConsecutiveHours = forecast.reduce((acc, v) => {
						if (v.weather[0].main === 'Clear' && acc.consecutive && v.dt * 1000 >= sunrise && v.dt * 1000 < sunset) {
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
	const sunrise = lastValues?.sunrise ? moment(lastValues?.sunrise) : null;
	return {
		...lastValues,
		sunrise: sunrise ? moment().hour(sunrise.hour()).minute(sunrise.minute()).valueOf() : null
	};
};

export const outsideConditionsEvts = new EventEmitter() as TypedEmitter<{ change: (o: OutsideConditions) => void }>;
export const getOutsideTemperature = () => lastValues.temperature;

setInterval(() => {
	void update();
}, 5 * 60 * 1000);
void update();
