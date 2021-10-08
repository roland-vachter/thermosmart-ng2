const arrayShuffle = require('../utils/arrayShuffle');

const images = {
	'night': {
		seasons: ['all'],
		conditions: ['clear', 'cloudy'],
		daytime: ['night']
	},
	'autumn_clear1.jpg': {
		seasons: ['autumn'],
		conditions: ['clear'],
		daytime: ['day']
	},
	'autumn_clear2.jpg': {
		seasons: ['autumn'],
		conditions: ['clear'],
		daytime: ['day']
	},
	'autumn_clear3.jpg': {
		seasons: ['autumn'],
		conditions: ['clear'],
		daytime: ['day']
	},
	'not_winter_cloudy1.jpg': {
		seasons: ['spring', 'summer', 'autumn'],
		conditions: ['cloudy'],
		daytime: ['day']
	},
	'not_winter_night_clear1.jpg': {
		seasons: ['spring', 'summer', 'autumn'],
		conditions: ['clear'],
		daytime: ['night']
	},
	'not_winter_night_clear2.jpg': {
		seasons: ['spring', 'summer', 'autumn'],
		conditions: ['clear'],
		daytime: ['night']
	},
	'not_winter_night_clear3.jpg': {
		seasons: ['spring', 'summer', 'autumn'],
		conditions: ['clear'],
		daytime: ['night']
	},
	'fog1.jpg': {
		seasons: ['all'],
		conditions: ['fog'],
		daytime: ['all']
	},
	'fog2.jpg': {
		seasons: ['all'],
		conditions: ['fog'],
		daytime: ['all']
	},
	'not_winter_night_rain1.jpg': {
		seasons: ['spring', 'summer', 'autumn'],
		conditions: ['rain', 'snow'],
		daytime: ['night']
	},
	'not_winter_night_rain2.jpg': {
		seasons: ['spring', 'summer', 'autumn'],
		conditions: ['rain', 'snow'],
		daytime: ['night']
	},
	'raining1.jpg': {
		seasons: ['all'],
		conditions: ['rain'],
		daytime: ['day']
	},
	'raining2.jpg': {
		seasons: ['all'],
		conditions: ['rain'],
		daytime: ['day']
	},
	'raining3.jpg': {
		seasons: ['all'],
		conditions: ['rain'],
		daytime: ['day']
	},
	'not_winter_sunset1.jpg': {
		seasons: ['spring', 'summer', 'autumn'],
		conditions: ['clear'],
		daytime: ['night']
	},
	'not_winter_sunset2.jpg': {
		seasons: ['spring', 'summer', 'autumn'],
		conditions: ['clear'],
		daytime: ['night']
	},
	'not_winter_sunset3.jpg': {
		seasons: ['spring', 'summer', 'autumn'],
		conditions: ['clear'],
		daytime: ['night']
	},
	'spring_clear1.jpg': {
		seasons: ['spring'],
		conditions: ['clear'],
		daytime: ['day']
	},
	'spring_clear2.jpg': {
		seasons: ['spring'],
		conditions: ['clear'],
		daytime: ['day']
	},
	'spring_clear3.jpg': {
		seasons: ['spring'],
		conditions: ['clear'],
		daytime: ['day']
	},
	'summer_sunny1.jpg': {
		seasons: ['summer'],
		conditions: ['clear'],
		daytime: ['day']
	},
	'summer_sunny2.jpg': {
		seasons: ['summer'],
		conditions: ['clear'],
		daytime: ['day']
	},
	'summer_sunny3.jpg': {
		seasons: ['summer'],
		conditions: ['clear'],
		daytime: ['day']
	},
	'summer_sunny4.jpg': {
		seasons: ['summer'],
		conditions: ['clear'],
		daytime: ['day']
	},
	'winter_daylight.jpg': {
		seasons: ['winter'],
		conditions: ['cloudy', 'fog'],
		daytime: ['day']
	},
	'winter_daylight_snowing1.jpg': {
		seasons: ['all'],
		conditions: ['snow'],
		daytime: ['day']
	},
	'winter_daylight_snowing2.jpg': {
		seasons: ['winter'],
		conditions: ['snow', 'clear'],
		daytime: ['day']
	},
	'winter_daylight_snowing3.jpg': {
		seasons: ['all'],
		conditions: ['snow'],
		daytime: ['day']
	},
	'winter_night1.jpg': {
		seasons: ['winter'],
		conditions: ['all'],
		daytime: ['night']
	},
	'winter_sunny.jpg': {
		seasons: ['winter'],
		conditions: ['clear'],
		daytime: ['day']
	},
	'winter_clear.jpg': {
		seasons: ['winter'],
		conditions: ['clear', 'cloudy'],
		daytime: ['day']
	}
};

function getSeason () {
	const today = new Date();
	switch (today.getMonth()) {
		case 11:
		case 0:
		case 1:
			return 'winter';
		case 2:
		case 3:
		case 4:
			return 'spring';
		case 5:
		case 6:
		case 7:
			return 'summer';
		case 8:
		case 9:
		case 10:
			return 'autumn';
	}
}

const conditionMapping = {
	clear: 'clear',
	partlycloudy: 'cloudy',
	cloudy: 'cloudy',
	verycloudy: 'cloudy',
	rain: 'rain',
	heavyrain: 'rain',
	tstorms: 'rain',
	snow: 'snow',
	fog: 'fog'
};


exports.get = (sourceCondition, daytime) => {
	const season = getSeason();
	const condition = conditionMapping[sourceCondition];

	let foundImages = [];
	Object.keys(images).forEach(imageName => {
		let ok = true;
		const image = images[imageName];

		if (!image.seasons.includes('all') && !image.seasons.includes(season)) {
			ok = false;
		}

		if (!image.conditions.includes('all') && !image.conditions.includes(condition)) {
			ok = false;
		}

		if (!image.daytime.includes('all') && !image.daytime.includes(daytime)) {
			ok = false;
		}

		if (ok) {
			foundImages.push(imageName);
		}
	});

	if (foundImages.length) {
		if (foundImages.length > 1) {
			foundImages = arrayShuffle(foundImages);
		}

		return foundImages[0];
	}

	console.log('###', 'No background image found for:', 'condition -', sourceCondition + '/' + condition, 'season -', season, 'daytime -', daytime);

	return '';
};
