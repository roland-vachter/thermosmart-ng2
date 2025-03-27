/* eslint-disable max-classes-per-file */
import { Request } from "express";
import { Response } from 'node-fetch';
import { HydratedDocument } from 'mongoose';
import { ISensorSetting } from '../models/SensorSetting';
import { IHeatingDefaultPlan } from '../models/HeatingDefaultPlan';
import { IHeatingPlan } from '../models/HeatingPlan';
import { IHeatingPlanOverrides } from '../models/HeatingPlanOverrides';
import { IHeatingHistory } from '../models/HeatingHistory';
import { IHeatingHoldConditionHistory } from '../models/HeatingHoldConditionHistory';
import { ISolarSystemHeatingHistory } from '../models/SolarSystemHeatingHistory';
import { IHeatingSensorHistory } from '../models/HeatingSensorHistory';
import { ISolarSystemHistory } from '../models/SolarSystemHistory';

export interface ApiResponse {
  status?: RESPONSE_STATUS;
}

export class ErrorWithStatus extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}

export class ErrorWithResponse extends Error {
  response?: any;

  constructor(message: string, response?: Response) {
    super(message);
    this.response = response;
  }
}

export interface LoginError extends Error {
  invalidSession?: boolean;
  type?: string;
}

export interface RequestWithFlags extends Request {
  apiCall?: boolean;
}

export enum RESPONSE_STATUS {
	OK = 'ok',
	ERROR = 'error'
};

export interface LocationBasedEvent {
  location: number;
}



export interface Sensor {
	id: number;
	temperature: number;
	reportedTemperature?: number;
	humidity: number;
	reportedHumidity?: number;
	active?: boolean;
	enabled: boolean;
	windowOpen: boolean;
	windowOpenTimeout?: NodeJS.Timeout;
	label?: string;
	tempAdjust?: number;
	humidityAdjust?: number;
  deleted?: boolean;
	adjustedTempHistory: number[];
	reportedTempHistory: number[];
	savedTempHistory: number[];
	location?: number;
	onHoldTempLowest?: number;
	onHoldTempHighest?: number;
	onHoldStatus?: OnHoldStatus | null;
	onHoldSameStateCount?: number;
	sensorSetting: HydratedDocument<ISensorSetting>;
	lastUpdate?: Date;
	temperatureDirection: TemperatureDirection;
}

export enum OnHoldStatus {
	'firstDecrease' = 'firstDecrease',
	'decrease' = 'decrease',
	'firstIncrease' = 'firstIncrease',
	'increase' = 'increase',
	'stabilized' = 'stabilized'
}

export enum TemperatureDirection {
	'increase' = 'increase',
	'decrease' = 'decrease',
	'stabilized' = 'stabilized'
}

export enum DAYTIME {
  'day' = 'day',
  'night' = 'night'
}

export interface OutsideConditions {
  temperature: number;
  humidity: number;
  daytime: DAYTIME;
  color: string;
  weatherDescription: string;
  weatherIconClass: string;
  backgroundImage: string;
}

export interface HeatingConditions {
  hasIncreasingTrend: boolean;
  hasFavorableWeatherForecast: boolean;
  hasWindowOpen: boolean;
}

export interface Temperature {
  // eslint-disable-next-line @typescript-eslint/naming-convention
	_id: number;
	name: string;
	value: number;
	color: string;
	iconClass: string;
}

export interface HeatingPlanIntervalInitUpdate {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _id: string;
  temp: number;
  startHour: number;
  startMinute: number;

  label?: string;
  labelPosition?: number;
  blockPosition?: number;
}

export interface SolarHeatingStatus {
  numberOfRadiators?: number;
  numberOfRunningRadiators?: number;
  wattHourConsumption: number;
  solarProduction?: number;
  gridInjection?: number;
}

export interface ThermoInitUpdateData {
  outside?: OutsideConditions;
  sensors?: Record<number, Sensor>;
  sensor?: Sensor;
  isHeatingOn?: boolean;
  heatingPower?: {
    status: boolean;
    until: Date;
  };
  heatingConditions?: HeatingConditions;
  targetTempId?: number;
  temperatures?: Temperature[];
  heatingPlans?: IHeatingPlan[];
  heatingDefaultPlans?: IHeatingDefaultPlan[];
  heatingPlanOverrides?: IHeatingPlanOverrides[];
  statisticsForToday?: {
    heatingDuration: number;
    solarHeatingDuration?: number;
  };
  restartInProgress?: boolean;
  config?: Record<string, string | number | boolean>;
  solarHeatingStatus?: SolarHeatingStatus;
}

export interface StatisticsByMonth {
  date?: string;
  avgOutsideHumi: number;
  avgOutsideTemp: number;
  avgRunningMinutes: number;
  avgTargetTemp: number;
  totalRunningMinutes: number;
  avgSunshineMinutes: number;
}

export interface Average extends StatisticsByMonth {
	avgRadiatorRunningMinutes?: number;
}


export interface StatisticsByYear {
  avgOutsideHumi: number;
  avgOutsideTemp: number;
  avgRunningMinutes: number;
  avgSunshineMinutes: number;
  avgTargetTemp: number;
  avgRadiatorRunningMinutes?: number;
  year: number;
}

export interface StatisticsByDay {
  avgOutsideHumi: number;
  avgOutsideTemp: number;
  avgTargetTemp: number;
  date: string;
  runningMinutes: number;
  sunshineMinutes: number;
  radiatorRunningMinutes?: number;
}

export interface Statistics {
  sensorTempHistory: (Omit<IHeatingSensorHistory, 'sensor'> & {sensor: ISensorSetting})[];
  statisticsByYear: StatisticsByYear[];
  statisticsByMonth: StatisticsByMonth[];
  statisticsForLastMonth: StatisticsByDay[];
  heatingForToday: IHeatingHistory[];
  heatingConditionsForToday: {
    [key: string]: IHeatingHoldConditionHistory[]
  },
  solarHeatingForToday?: ISolarSystemHeatingHistory[];
  solarForToday?: ISolarSystemHistory[];
}

export enum LOCATION_FEATURE {
  HEATING = 'heating',
  SECURITY = 'security',
  SOLAR_SYSTEM_HEATING = 'solar-system-heating'
}
