export enum DAYTIME {
  'day' = 'day',
  'night' = 'night'
}

export enum WEATHER_TYPE {
  'clear' = 'clear',
	'partlycloudy' = 'partlycloudy',
	'cloudy' = 'cloudy',
	'verycloudy' = 'verycloudy',
	'rain' = 'rain',
	'heavyrain' = 'heavyrain',
	'tstorms' = 'tstorms',
	'snow' = 'snow',
	'fog' = 'fog'
}

export interface OutsideConditions {
  temperature: number;
  humidity: number;
  daytime: DAYTIME;
  color: string;
  weatherDescription: string;
  weatherIconClass: string;
  backgroundImage: string;
  sunrise: number;
  sunny: boolean;
  highestExpectedTemperature: number;
  sunshineNextConsecutiveHours: number;
  sunshineForecast: boolean[];
  totalNumberOfSunshineExpected: number;
}
