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

export interface SunshineForecast {
  temp: number;
  sunny: boolean;
  timestamp: number;
}

export interface SunshineForecastWithPower extends SunshineForecast {
  sunPower: number;
}

export interface OutsideConditions {
  temperature: number;
  humidity: number;
  daytime: DAYTIME;
  color: string;
  weatherIconClass: string;
  backgroundImage: string;
  sunrise: number;
  sunset: number;
  sunny: boolean;
  sunPower: number;
  highestExpectedTemperature: number;
  sunshineNextConsecutiveHours: number;
  sunshineForecast: SunshineForecastWithPower[];
  totalNumberOfSunshineExpected: number;
}


export interface WeatherResponse {
  current: {
    weatherType: WEATHER_TYPE;
    temperature: number;
    humidity: number;
    daytime: DAYTIME;
    sunrise: number;
    sunset: number;
    sunny: boolean;
  };
  forecast?: {
    highestExpectedTemperature?: number;
    sunshineForecast?: SunshineForecast[];
    totalNumberOfSunshineExpected?: number;
  }
}
