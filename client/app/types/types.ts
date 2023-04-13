import { Moment } from "moment";

export enum RESPONSE_STATUS {
	OK = 'ok',
	ERROR = 'error'
};

export interface ApiResult<T = any> {
	status: RESPONSE_STATUS;
	reason?: string;
    data?: T;
}

export interface Sensor {
    id: string;
	temperature: number;
	humidity: number;
	active: boolean;
	enabled: boolean;
	windowOpen: boolean;
	label: string;
	tempAdjust: number;
	humidityAdjust: number;
}

export interface HeatingPlan {
	_id: number;
	displayOrder: number;
	iconClass: string;
	name: string;
	intervals: {
		temp: string;
		startHour: number;
		startMinute: number;
		label?: string;
		labelPosition?: number;
		blockPosition?: number;
	}[];
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
	_id: number;
	name: string;
	value: number;
	color: string;
	iconClass: string;
}

export enum ALERT_TYPE {
	SUCCESS = 'success',
	INFO = 'info',
	WARNING = 'warning',
	ERROR = 'danger'
}

export interface Location {
    _id: number;
    name: string;
    features: string[];
}

export interface Camera {
	ip: string;
	location: number;
	healthy: boolean;
	lastHealthUpdate: Date;
}

export interface Controller {
	id: number;
	location: number;
	healthy: boolean;
	lastHealthUpdate: Date;
}

interface HeatingPowerBase {
	status: boolean;
}

export interface HeatingPowerResponse {
	heatingPower: HeatingPowerBase & {
		until: string;
	}
}

export interface HeatingPower extends HeatingPowerBase {
	until: Moment;
}

export enum ArmingStatus {
	DISARMED = 'disarmed',
	ARMING = 'arming',
	ARMED = 'armed',
	PREALARM = 'prealarm',
	ALARM = 'alarm'
}

export interface ArmingStatusResponse {
	security: {
		status: ArmingStatus;
	};
}
