import { DAYTIME, WEATHER_TYPE } from "../types/outsideConditions";
import { shuffleArray } from '../utils/utils';

enum SEASON {
	'all' = 'all',
	'spring' = 'spring',
	'summer' = 'summer',
	'autumn' = 'autumn',
	'winter' = 'winter'
}

enum WEATHER_TYPE_WITH_ALL {
  'clear' = 'clear',
	'partlycloudy' = 'partlycloudy',
	'cloudy' = 'cloudy',
	'verycloudy' = 'verycloudy',
	'rain' = 'rain',
	'heavyrain' = 'heavyrain',
	'tstorms' = 'tstorms',
	'snow' = 'snow',
	'fog' = 'fog',
	'all' = 'all'
}

interface ImageProperties {
	seasons: SEASON[];
	conditions: WEATHER_TYPE_WITH_ALL[];
	daytime: DAYTIME[];
}

const images: Record<string, ImageProperties> = {
	'night.jpg': {
		seasons: [SEASON.all],
		conditions: [WEATHER_TYPE_WITH_ALL.clear, WEATHER_TYPE_WITH_ALL.cloudy],
		daytime: [DAYTIME.night]
	},
	'autumn_clear1.jpg': {
		seasons: [SEASON.autumn],
		conditions: [WEATHER_TYPE_WITH_ALL.clear],
		daytime: [DAYTIME.day]
	},
	'autumn_clear2.jpg': {
		seasons: [SEASON.autumn],
		conditions: [WEATHER_TYPE_WITH_ALL.clear],
		daytime: [DAYTIME.day]
	},
	'autumn_clear3.jpg': {
		seasons: [SEASON.autumn],
		conditions: [WEATHER_TYPE_WITH_ALL.clear],
		daytime: [DAYTIME.day]
	},
	'not_winter_cloudy1.jpg': {
		seasons: [SEASON.spring, SEASON.summer, SEASON.autumn],
		conditions: [WEATHER_TYPE_WITH_ALL.cloudy],
		daytime: [DAYTIME.day]
	},
	'not_winter_night_clear1.jpg': {
		seasons: [SEASON.spring, SEASON.summer, SEASON.autumn],
		conditions: [WEATHER_TYPE_WITH_ALL.clear],
		daytime: [DAYTIME.night]
	},
	'not_winter_night_clear2.jpg': {
		seasons: [SEASON.spring, SEASON.summer, SEASON.autumn],
		conditions: [WEATHER_TYPE_WITH_ALL.clear],
		daytime: [DAYTIME.night]
	},
	'not_winter_night_clear3.jpg': {
		seasons: [SEASON.spring, SEASON.summer, SEASON.autumn],
		conditions: [WEATHER_TYPE_WITH_ALL.clear],
		daytime: [DAYTIME.night]
	},
	'fog1.jpg': {
		seasons: [SEASON.all],
		conditions: [WEATHER_TYPE_WITH_ALL.fog],
		daytime: [DAYTIME.day, DAYTIME.night]
	},
	'fog2.jpg': {
		seasons: [SEASON.all],
		conditions: [WEATHER_TYPE_WITH_ALL.fog],
		daytime: [DAYTIME.day, DAYTIME.night]
	},
	'not_winter_night_rain1.jpg': {
		seasons: [SEASON.spring, SEASON.summer, SEASON.autumn],
		conditions: [WEATHER_TYPE_WITH_ALL.rain, WEATHER_TYPE_WITH_ALL.snow],
		daytime: [DAYTIME.night]
	},
	'not_winter_night_rain2.jpg': {
		seasons: [SEASON.spring, SEASON.summer, SEASON.autumn],
		conditions: [WEATHER_TYPE_WITH_ALL.rain, WEATHER_TYPE_WITH_ALL.snow],
		daytime: [DAYTIME.night]
	},
	'raining1.jpg': {
		seasons: [SEASON.all],
		conditions: [WEATHER_TYPE_WITH_ALL.rain],
		daytime: [DAYTIME.day]
	},
	'raining2.jpg': {
		seasons: [SEASON.all],
		conditions: [WEATHER_TYPE_WITH_ALL.rain],
		daytime: [DAYTIME.day]
	},
	'raining3.jpg': {
		seasons: [SEASON.all],
		conditions: [WEATHER_TYPE_WITH_ALL.rain],
		daytime: [DAYTIME.day]
	},
	'not_winter_sunset1.jpg': {
		seasons: [SEASON.spring, SEASON.summer, SEASON.autumn],
		conditions: [WEATHER_TYPE_WITH_ALL.clear],
		daytime: [DAYTIME.night]
	},
	'not_winter_sunset2.jpg': {
		seasons: [SEASON.spring, SEASON.summer, SEASON.autumn],
		conditions: [WEATHER_TYPE_WITH_ALL.clear],
		daytime: [DAYTIME.night]
	},
	'not_winter_sunset3.jpg': {
		seasons: [SEASON.spring, SEASON.summer, SEASON.autumn],
		conditions: [WEATHER_TYPE_WITH_ALL.clear],
		daytime: [DAYTIME.night]
	},
	'spring_clear1.jpg': {
		seasons: [SEASON.spring],
		conditions: [WEATHER_TYPE_WITH_ALL.clear],
		daytime: [DAYTIME.day]
	},
	'spring_clear2.jpg': {
		seasons: [SEASON.spring],
		conditions: [WEATHER_TYPE_WITH_ALL.clear],
		daytime: [DAYTIME.day]
	},
	'spring_clear3.jpg': {
		seasons: [SEASON.spring],
		conditions: [WEATHER_TYPE_WITH_ALL.clear],
		daytime: [DAYTIME.day]
	},
	'summer_sunny1.jpg': {
		seasons: [SEASON.summer],
		conditions: [WEATHER_TYPE_WITH_ALL.clear],
		daytime: [DAYTIME.day]
	},
	'summer_sunny2.jpg': {
		seasons: [SEASON.summer],
		conditions: [WEATHER_TYPE_WITH_ALL.clear],
		daytime: [DAYTIME.day]
	},
	'summer_sunny3.jpg': {
		seasons: [SEASON.summer],
		conditions: [WEATHER_TYPE_WITH_ALL.clear],
		daytime: [DAYTIME.day]
	},
	'summer_sunny4.jpg': {
		seasons: [SEASON.summer],
		conditions: [WEATHER_TYPE_WITH_ALL.clear],
		daytime: [DAYTIME.day]
	},
	'winter_daylight.jpg': {
		seasons: [SEASON.winter],
		conditions: [WEATHER_TYPE_WITH_ALL.cloudy, WEATHER_TYPE_WITH_ALL.fog],
		daytime: [DAYTIME.day]
	},
	'winter_daylight_snowing1.jpg': {
		seasons: [SEASON.all],
		conditions: [WEATHER_TYPE_WITH_ALL.snow],
		daytime: [DAYTIME.day]
	},
	'winter_daylight_snowing2.jpg': {
		seasons: [SEASON.winter],
		conditions: [WEATHER_TYPE_WITH_ALL.snow, WEATHER_TYPE_WITH_ALL.clear],
		daytime: [DAYTIME.day]
	},
	'winter_daylight_snowing3.jpg': {
		seasons: [SEASON.all],
		conditions: [WEATHER_TYPE_WITH_ALL.snow],
		daytime: [DAYTIME.day]
	},
	'winter_night1.jpg': {
		seasons: [SEASON.winter],
		conditions: [WEATHER_TYPE_WITH_ALL.all],
		daytime: [DAYTIME.night]
	},
	'winter_sunny.jpg': {
		seasons: [SEASON.winter],
		conditions: [WEATHER_TYPE_WITH_ALL.clear],
		daytime: [DAYTIME.day]
	},
	'winter_clear.jpg': {
		seasons: [SEASON.winter],
		conditions: [WEATHER_TYPE_WITH_ALL.clear, WEATHER_TYPE_WITH_ALL.cloudy],
		daytime: [DAYTIME.day]
	}
};

function getSeason(): SEASON {
	const today = new Date();
	switch (today.getMonth()) {
		case 11:
		case 0:
		case 1:
			return SEASON.winter;
		case 2:
		case 3:
		case 4:
			return SEASON.spring;
		case 5:
		case 6:
		case 7:
			return SEASON.summer;
		case 8:
		case 9:
		case 10:
			return SEASON.autumn;
		default:
			return SEASON.all;
	}
}

const conditionMapping: Record<WEATHER_TYPE, WEATHER_TYPE_WITH_ALL> = {
	[WEATHER_TYPE.clear]: WEATHER_TYPE_WITH_ALL.clear,
	[WEATHER_TYPE.partlycloudy]: WEATHER_TYPE_WITH_ALL.cloudy,
	[WEATHER_TYPE.cloudy]: WEATHER_TYPE_WITH_ALL.cloudy,
	[WEATHER_TYPE.verycloudy]: WEATHER_TYPE_WITH_ALL.cloudy,
	[WEATHER_TYPE.rain]: WEATHER_TYPE_WITH_ALL.rain,
	[WEATHER_TYPE.heavyrain]: WEATHER_TYPE_WITH_ALL.rain,
	[WEATHER_TYPE.tstorms]: WEATHER_TYPE_WITH_ALL.rain,
	[WEATHER_TYPE.snow]: WEATHER_TYPE_WITH_ALL.snow,
	[WEATHER_TYPE.fog]: WEATHER_TYPE_WITH_ALL.fog
};


export const getBackgroundImage = (sourceCondition: WEATHER_TYPE, daytime: DAYTIME) => {
	const season = getSeason();
	const condition = conditionMapping[sourceCondition];

	let foundImages: string[] = [];
	Object.keys(images).forEach(imageName => {
		let ok = true;
		const image = images[imageName];

		if (!image.seasons.includes(SEASON.all) && !image.seasons.includes(season)) {
			ok = false;
		}

		if (!image.conditions.includes(WEATHER_TYPE_WITH_ALL.all) && !image.conditions.includes(condition)) {
			ok = false;
		}

		if (!image.daytime.includes(daytime)) {
			ok = false;
		}

		if (ok) {
			foundImages.push(imageName);
		}
	});

	if (foundImages.length) {
		if (foundImages.length > 1) {
			foundImages = shuffleArray(foundImages);
		}

		return foundImages[0];
	}

	console.log('###', 'No background image found for:', 'condition -', sourceCondition + '/' + condition, 'season -', season, 'daytime -', daytime);

	return '';
};
