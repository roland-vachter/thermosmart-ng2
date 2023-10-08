"use strict";

const EventEmitter = require('events');
const evts = new EventEmitter();

const backgroundImage = require('./backgroundImage');
const fetch = require('node-fetch');

const lastValues = {
	temperature: NaN,
	humidity: NaN,
	color: '',
	daytime: '',
	weatherIconClass: '',
	weatherDescription: '',
	backgroundImage: ''
};


const weatherIconClassMapping = {
	day: {
		clear: 'icon-sun2',
		partlycloudy: 'icon-cloud-12',
		cloudy: 'icon-cloud2',
		verycloudy: 'icon-cloudy2',
		rain: 'icon-rain-4',
		heavyrain: 'icon-rain2',
		tstorms: 'icon-storm2',
		snow: 'icon-snowing',
		fog: 'icon-haze'
	},
	night: {
		clear: 'icon-night2',
		partlycloudy: 'icon-night3',
		cloudy: 'icon-cloud2',
		verycloudy: 'icon-cloudy2',
		rain: 'icon-rainy',
		heavyrain: 'icon-rain2',
		tstorms: 'icon-storm2',
		snow: 'icon-snowing',
		fog: 'icon-haze'
	}
};

const weatherTypeMapping = {
	1: 'clear',
	2: 'partlycloudy',
	3: 'cloudy',
	4: 'verycloudy',
	9: 'rain',
	10: 'heavyrain',
	11: 'tstorms',
	13: 'snow',
	50: 'fog'
};

const weatherColorMapping = {
	day: {
		clear: 'orange',
		partlycloudy: 'gray',
		cloudy: 'gray',
		verycloudy: 'dark-gray',
		rain: 'blue',
		heavyrain: 'dark-blue',
		tstorms: 'navy',
		snow: 'aqua',
		fog: 'silver'
	},
	night: {
		clear: 'dark-blue',
		partlycloudy: 'gray',
		cloudy: 'gray',
		verycloudy: 'dark-gray',
		rain: 'gray',
		heavyrain: 'gray',
		tstorms: 'dark-gray',
		snow: 'gray',
		fog: 'gray'
	}
};

async function update () {
	try {
		const resWeather = await fetch(`${process.env.WEATHER_API_URL}?appid=${process.env.WEATHER_API_KEY}&lat=${process.env.LOCATION_LAT}&lon=${process.env.LOCATION_LNG}&units=metric`);

		if (!resWeather.ok) {
			const err = new Error(resWeather.status);
			err.response = resWeather;
			throw err;
		}

		const jsonWeather = await resWeather.json();

		if (jsonWeather && jsonWeather.current) {
			const temperature = jsonWeather.current.temp;
			const humidity = jsonWeather.current.humidity;
			const sunrise = jsonWeather.current.sunrise * 1000;
			const sunset = jsonWeather.current.sunset * 1000;
			let weatherType = weatherTypeMapping[parseInt(jsonWeather.current.weather[0].icon.substr(0, 2), 10)];

			let daytime;
			if (Date.now() > sunrise && Date.now() < sunset) {
				daytime = 'day';
			} else {
				daytime = 'night';
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
				lastValues.backgroundImage = backgroundImage.get(weatherType, daytime);

				evts.emit('change', lastValues);
			}
		}
	} catch (e) {
		console.error(e);
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
exports.getTemperature = () => lastValues.temperature;
