export enum RESPONSE_STATUS {
	OK = 'ok',
	ERROR = 'error'
};

export interface StatusApiResult {
	status: RESPONSE_STATUS;
	reason?: string;
}


export interface ApiResult<T = unknown> extends StatusApiResult {
    data?: T;
}

export enum ALERT_TYPE {
	SUCCESS = 'success',
	INFO = 'info',
	WARNING = 'warning',
	ERROR = 'danger'
}

export interface Location {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	_id: number;
	name: string;
	timezone: string;
	features: string[];
}

export interface User {
	emails: string[];
	locations: Location[];
	permissions: string[];
	// eslint-disable-next-line @typescript-eslint/naming-convention
	_id: string;
}

export enum LOCATION_FEATURE {
  HEATING = 'heating',
  SECURITY = 'security',
  SOLAR_SYSTEM_HEATING = 'solar-system-heating',
	GATEWAY_MONITORING = 'gateway-monitoring'
}
