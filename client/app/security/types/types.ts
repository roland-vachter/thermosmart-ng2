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

export interface SecurityInitResponse {
	security: {
		status: ArmingStatus;
		lastActivity: number;
		lastArmedAt: number;
		alarmTriggeredCount: number;
		cameraHealth: boolean;
		controllerHealth: boolean;
		keypadHealth: boolean;
		motionSensorHealth: boolean;
	}
}
