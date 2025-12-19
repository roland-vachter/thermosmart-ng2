import { ErrorWithResponse } from '../types/generic';
import { fetch } from '../utils/fetch';
import { DAYTIME, WEATHER_TYPE, WeatherResponse } from '../types/outsideConditions';
import moment from 'moment-timezone';

const CLOUD_THRESHOLD = 20;

interface HourlyForecast {
  time_epoch: number;
  temp_c: number;
  cloud: number;
  condition: {
    code: number;
    text: string;
  }
}

interface Forecast {
  date_epoch: number;
  astro: {
    sunrise: string;
    sunset: string;
  };
  hour: HourlyForecast[];
}

interface WeatherApiResponse {
  current: {
    temp_c: number;
    humidity: number;
    cloud: number;
    condition: {
      code: number;
      text: string;
    };
  };
  forecast: {
    forecastday: Forecast[];
  }
}

const weatherTypeMapping: Record<number, WEATHER_TYPE> = {
  1000: WEATHER_TYPE.clear,
  1003: WEATHER_TYPE.partlycloudy,
  1006: WEATHER_TYPE.cloudy,
  1009: WEATHER_TYPE.verycloudy,
  1063: WEATHER_TYPE.rain,
  1083: WEATHER_TYPE.rain,
  1086: WEATHER_TYPE.rain,
  1089: WEATHER_TYPE.rain,
  1198: WEATHER_TYPE.rain,
  1201: WEATHER_TYPE.rain,
  1240: WEATHER_TYPE.rain,
  1192: WEATHER_TYPE.heavyrain,
  1195: WEATHER_TYPE.heavyrain,
  1243: WEATHER_TYPE.heavyrain,
  1246: WEATHER_TYPE.heavyrain,
  1087: WEATHER_TYPE.tstorms,
  1066: WEATHER_TYPE.snow,
  1069: WEATHER_TYPE.snow,
  1072: WEATHER_TYPE.snow,
  1114: WEATHER_TYPE.snow,
  1117: WEATHER_TYPE.snow,
  1150: WEATHER_TYPE.snow,
  1168: WEATHER_TYPE.snow,
  1171: WEATHER_TYPE.snow,
  1204: WEATHER_TYPE.snow,
  1207: WEATHER_TYPE.snow,
  1210: WEATHER_TYPE.snow,
  1213: WEATHER_TYPE.snow,
  1216: WEATHER_TYPE.snow,
  1219: WEATHER_TYPE.snow,
  1222: WEATHER_TYPE.snow,
  1225: WEATHER_TYPE.snow,
  1237: WEATHER_TYPE.snow,
  1249: WEATHER_TYPE.snow,
  1252: WEATHER_TYPE.snow,
  1255: WEATHER_TYPE.snow,
  1258: WEATHER_TYPE.snow,
  1261: WEATHER_TYPE.snow,
  1264: WEATHER_TYPE.snow,
  1030: WEATHER_TYPE.fog,
  1135: WEATHER_TYPE.fog,
  1147: WEATHER_TYPE.fog
};


export async function getWeatherData() {
  const resWeather = await fetch(`${process.env.WEATHER_API_URL}/v1/forecast.json?key=${process.env.WEATHER_API_KEY}&q=${process.env.LOCATION_LAT},${process.env.LOCATION_LNG}&days=1&aqi=no&alerts=no`);

  if (!resWeather.ok) {
    const err = new ErrorWithResponse(resWeather.status.toString(), resWeather);
    throw err;
  }

  const jsonWeather: WeatherApiResponse = await resWeather.json() as WeatherApiResponse;
  let result: WeatherResponse;

  if (jsonWeather) {
    if (jsonWeather.current && jsonWeather.forecast) {
      const temperature = jsonWeather.current.temp_c;
      const humidity = jsonWeather.current.humidity;
      const sunrise = moment.tz(jsonWeather.forecast.forecastday[0].astro.sunrise, 'hh:mm A', 'Europe/Bucharest').valueOf();
      const sunset = moment.tz(jsonWeather.forecast.forecastday[0].astro.sunset, 'hh:mm A', 'Europe/Bucharest').valueOf();
      const weatherType: WEATHER_TYPE = weatherTypeMapping[jsonWeather.current.condition.code];

      let daytime;
      if (moment.tz('Europe/Bucharest').valueOf() > sunrise && moment.tz('Europe/Bucharest').valueOf() < sunset) {
        daytime = DAYTIME.day;
      } else {
        daytime = DAYTIME.night;
      }

      result = {
        current: {
          weatherType,
          temperature,
          humidity,
          daytime,
          sunrise,
          sunset,
          sunny: (
            daytime === DAYTIME.day &&
            (weatherType === WEATHER_TYPE.clear || jsonWeather.current.cloud < CLOUD_THRESHOLD)
          )
        }
      };

      result.forecast = {};

      const forecast: HourlyForecast[] = [];
      jsonWeather.forecast.forecastday[0].hour.forEach(h => {
        if (h.time_epoch * 1000 >= moment().tz('Europe/Bucharest').valueOf() && h.time_epoch * 1000 <= moment().tz('Europe/Bucharest').endOf('day').valueOf()) {
          forecast.push(h);
        }
      });

      result.forecast.highestExpectedTemperature = forecast.reduce((acc, v) => v.temp_c > acc ? v.temp_c : acc, forecast.length && forecast[0].temp_c || 0);
      result.forecast.sunshineForecast = forecast.map(v => ({
        sunny: (weatherTypeMapping[v.condition.code] === WEATHER_TYPE.clear || v.cloud < CLOUD_THRESHOLD) && v.time_epoch * 1000 >= sunrise && v.time_epoch * 1000 < sunset,
        temp: v.temp_c,
        timestamp: v.time_epoch * 1000
      }));
      result.forecast.totalNumberOfSunshineExpected = result.forecast.sunshineForecast.reduce((acc, v) => {
        if (v.sunny) {
          acc++;
        }

        return acc;
      }, 0);
    }
  }

  return result;
}
