import { Moment } from "moment";

export interface SensorSetting {
    label: string;
    tempAdjust: number;
    humidityAdjust: number;
}

export interface HeatingPlanInterval {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    _id: string;
    temp: Temperature;
    startHour: number;
    startMinute: number;

    label?: string;
    labelPosition?: number;
    blockPosition?: number;
}

export interface HeatingPlan {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    _id: number;
    displayOrder: number;
    iconClass: string;
    intervals: HeatingPlanInterval[];
    name: string;
}

export interface Sensor {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _id: number;
	id: number;
	temperature: number;
	humidity: number;
	active: boolean;
	enabled: boolean;
	windowOpen: boolean;
	label: string;
	tempAdjust: number;
	humidityAdjust: number;
  deleted?: boolean;
}

export interface HeatingPlanOverride {
	plan: HeatingPlan;
	date: Moment;
}

export interface HeatingDefaultPlan {
	dayOfWeek: number;
	plan: HeatingPlan;
	nameOfDay: string;
}

export interface Temperature {
  // eslint-disable-next-line @typescript-eslint/naming-convention
	_id: number;
	name: string;
	value: number;
	color: string;
	iconClass: string;
}

export interface HeatingPowerBase {
	status: boolean;
}

export interface HeatingPowerResponse {
	heatingPower: HeatingPowerBase & {
		until: string;
	};
}


export interface HeatingPower extends HeatingPowerBase {
	until: Moment;
}

export interface HeatingConditions {
  hasIncreasingTrend: boolean;
  hasFavorableWeatherForecast: boolean;
  hasWindowOpen: boolean;
}

export interface HeatingConditionsResponse {
  heatingConditions: HeatingConditions;
}

export interface SensorResponse {
	sensors: Sensor[];
}

export interface SensorTempHistory {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _id: number;
  datetime: string;
  h: number;
  t: number;
  sensor: Sensor;
}

export interface StatisticsByMonth {
  avgOutsideHumi: number;
  avgOutsideTemp: number;
  avgRunningMinutes: number;
  avgTargetTemp: number;
  date: string;
  totalRunningMinutes: number;
  avgSunshineMinutes: number;
  avgRadiatorRunningMinutes?: number;
}

export interface StatisticsByYear {
  avgOutsideHumi: number;
  avgOutsideTemp: number;
  avgRunningMinutes: number;
  avgSunshineMinutes: number;
  avgRadiatorRunningMinutes?: number;
  avgTargetTemp: number;
  year: string;
}

export interface StatisticsByDay {
  avgOutsideHumi: number;
  avgOutsideTemp: number;
  avgRunningMinutes: number;
  avgTargetTemp: number;
  date: string;
  runningMinutes: number;
  sunshineMinutes: number;
  radiatorRunningMinutes?: number;
}

export interface HeatingHistory {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _id: string;
  datetime: string;
  location: number;
  status: boolean;
}

export interface SolarSystemHeatingHistory {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _id: string;
  datetime: string;
  location: number;
  wattHourConsumption: number;
}

export interface HeatingHoldConditionHistory {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _id: string;
  datetime: string;
  location: number;
  status: boolean;
  type: HeatingHoldConditionTypes
}

export interface Statistics {
  sensorTempHistory: SensorTempHistory[];
  statisticsByYear: StatisticsByYear[];
  statisticsByMonth: StatisticsByMonth[];
  statisticsForLastMonth: StatisticsByDay[];
  heatingForToday: HeatingHistory[];
  heatingConditionsForToday: {
    [key: string]: HeatingHoldConditionHistory[]
  }
  solarHeatingForToday?: SolarSystemHeatingHistory[];
}

export enum HeatingHoldConditionTypes {
  INCREASING_TREND = 'increasing_trend',
  FAVORABLE_WEATHER_FORECAST = 'favorable_weather_forecast',
  WINDOW_OPEN = 'window_open',
  POWERED_OFF = 'powered_off'
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

export interface HeatingPlanInitUpdate {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _id: number;
  displayOrder: number;
  iconClass: string;
  intervals: HeatingPlanIntervalInitUpdate[];
  name: string;
}

export interface HeatingPlanOverrideInitUpdate {
	plan: number;
  location: number;
	date: Moment;
}

export interface HeatingDefaultPlanInitUpdate {
	dayOfWeek: number;
	plan: number;
	nameOfDay: string;
}

export interface SolarHeatingStatus {
  numberOfRadiators: number;
  wattHourConsumption: number;
  solarProduction?: number;
  gridInjection?: number;
  gridVoltage?: number;
}

export interface ThermoInitUpdateData {
  outside?: OutsideConditions;
  sensors?: Sensor[];
  sensor?: Sensor;
  isHeatingOn?: boolean;
  heatingPower?: {
    status: boolean;
    until: string;
  };
  heatingConditions?: HeatingConditions;
  targetTempId?: number;
  temperatures?: Temperature[];
  heatingPlans?: HeatingPlanInitUpdate[];
  heatingDefaultPlans?: HeatingDefaultPlanInitUpdate[];
  heatingPlanOverrides?: HeatingPlanOverrideInitUpdate[];
  statisticsForToday?: {
    heatingDuration: number;
    solarHeatingDuration?: number;
  };
  restartInProgress?: boolean;
  config?: Record<string, string | number>;
  solarHeatingStatus?: SolarHeatingStatus;
}
