"use strict";

const EventEmitter = require('events');
const evts = new EventEmitter();

const backgroundImage = require('./backgroundImage');
const fetch = require('node-fetch');
const pad = require('../utils/pad');

const lastValues = {
	temperature: NaN,
	humidity: NaN,
	weatherIconClass: '',
	weatherDescription: ''
};


const iconClassMapping = {
	clear: 'icon-sun2',
	cloudy: 'icon-cloudy2',
	fog: 'icon-haze',
	partlycloudy: 'icon-cloud-12',
	sleet: 'icon-rain-73',
	rain: 'icon-rain2',
	wind: 'icon-wind',
	snow: 'icon-snowing',
	tstorms: 'icon-storm2',

	nt_clear: 'icon-night-12',
	nt_cloudy: 'icon-cloudy2',
	nt_fog: 'icon-haze',
	nt_partlycloudy: 'icon-night3',
	nt_sleet: 'icon-rain-73',
	nt_rain: 'icon-rainy',
	nt_wind: 'icon-wind',
	nt_snow: 'icon-snowing',
	nt_tstorms: 'icon-storm2'
};


const iconTextMapping = {
	'clear-day': 'clear',
	'clear-night': 'clear',
	'rain': 'rain',
	'snow': 'snow',
	'sleet': 'sleet',
	'wind': 'wind',
	'fog': 'fog',
	'cloudy': 'cloudy',
	'partly-cloudy-day': 'partlycloudy',
	'partly-cloudy-night': 'partlycloudy',
	'hail': 'tstorms',
	'thunderstorm': 'tstorms',
	'tornado': 'tstorms'
};


async function update () {
	try {
		const [resWeather, resSunset] = await Promise.all([
			fetch(`${process.env.WEATHER_API_URL}/forecast/${process.env.WEATHER_API_KEY}/${process.env.LOCATION_LAT},${process.env.LOCATION_LNG}?exclude=hourly,daily,flags&units=si`),
			fetch(`${process.env.SUNSET_API_URL}/json?lat=${process.env.LOCATION_LAT}&lng=${process.env.LOCATION_LNG}&formatted=0`)
		]);

		if (!resWeather.ok || !resSunset.ok) {
			let res;
			if (!resWeather.ok) {
				res = resWeather;
			} else {
				res = resSunset;
			}

			const err = new Error(res.status);
			err.response = res;
			throw err;
		}

		const [jsonWeather, jsonSunset] = await Promise.all([
			resWeather.json(),
			resSunset.json()
		]);

		const sunrise = new Date(jsonSunset.results.sunrise);
		const sunset = new Date(jsonSunset.results.sunset);

		if (jsonWeather && jsonWeather.currently) {
			const temperature = jsonWeather.currently.temperature;
			const humidity = jsonWeather.currently.humidity * 100;
			let weatherDescription = iconTextMapping[jsonWeather.currently.icon];

			if (Date.now() < sunrise.getTime() ||
				Date.now() > sunset.getTime()) {
				weatherDescription = 'nt_' + weatherDescription;
			}

			if (lastValues.temperature !== temperature
					|| lastValues.humidity !== humidity
					|| lastValues.weatherDescription !== weatherDescription) {
				lastValues.temperature = temperature;
				lastValues.humidity = humidity;
				lastValues.weatherDescription = weatherDescription;
				lastValues.weatherIconClass = iconClassMapping[weatherDescription];
				lastValues.backgroundImage = backgroundImage.get(weatherDescription);

				evts.emit('change', lastValues);
			}
		}
	} catch (e) {
		console.log(e);
	};
}
setInterval(() => {
	update();
}, 5 * 60 * 1000);
update();

exports.get = function () {
	return lastValues;
};

exports.evts = evts;
