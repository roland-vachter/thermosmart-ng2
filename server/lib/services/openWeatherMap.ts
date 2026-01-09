import { ErrorWithResponse } from '../types/generic';
import { fetch } from '../utils/fetch';
import { DAYTIME, WEATHER_TYPE, WeatherResponse } from '../types/outsideConditions';
import moment from 'moment-timezone';

const CLOUD_THRESHOLD = 20;

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
    clouds: number;
    weather: {
      icon: string;
      main: string;
    }[];
  };
  hourly: Forecast[];
}

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


export async function getWeatherData() {
  const resWeather = await fetch(`${process.env.WEATHER_API_URL}?appid=${process.env.WEATHER_API_KEY}&lat=${process.env.LOCATION_LAT}&lon=${process.env.LOCATION_LNG}&units=metric&exclude=minutely,daily,alerts`);

  console.log(`${process.env.WEATHER_API_URL}?appid=${process.env.WEATHER_API_KEY}&lat=${process.env.LOCATION_LAT}&lon=${process.env.LOCATION_LNG}&units=metric&exclude=minutely,daily,alerts`);

  if (!resWeather.ok) {
    const err = new ErrorWithResponse(resWeather.status.toString(), resWeather);
    throw err;
  }

  const jsonWeather: WeatherApiResponse = await resWeather.json() as WeatherApiResponse;
  let result: WeatherResponse;

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
            (jsonWeather.current.weather[0].main === 'Clear' || jsonWeather.current.clouds < CLOUD_THRESHOLD)
          )
        }
      };

      if (jsonWeather.hourly) {
        result.forecast = {};

        const forecast: Forecast[] = [];
        jsonWeather.hourly.forEach(h => {
          if (h.dt * 1000 <= moment().endOf('day').valueOf()) {
            forecast.push(h);
          }
        });

        result.forecast.highestExpectedTemperature = forecast.reduce((acc, v) => v.temp > acc ? v.temp : acc, forecast.length && forecast[0].temp || 0);
        result.forecast.sunshineForecast = forecast.map(v => ({
          sunny: (v.weather[0].main === 'Clear' || v.clouds < CLOUD_THRESHOLD) && v.dt * 1000 >= sunrise && v.dt * 1000 < sunset,
          temp: v.temp,
          timestamp: v.dt * 1000
        }));
        result.forecast.totalNumberOfSunshineExpected = result.forecast.sunshineForecast.reduce((acc, v) => {
          if (v.sunny) {
            acc++;
          }

          return acc;
        }, 0);
      }
    }
  }

  return result;
}
