import EventEmitter from 'events';
import TypedEventEmitter from 'typed-emitter';
import Location from '../models/Location';
import SecurityArmingHistory, { SECURITY_STATUS } from '../models/SecurityArmingHistory';
import SecurityMovementHistory from '../models/SecurityMovementHistory';
import { LocationBasedEvent } from '../types/generic';
import { sendPushNotification } from './pushNotifications';
import moment from 'moment-timezone';


interface StatusEvent extends LocationBasedEvent {
	status: SECURITY_STATUS;
}

interface AlarmTriggeredCountEvent extends LocationBasedEvent {
	count: number;
}

interface AlarmEvent extends LocationBasedEvent {
	on: boolean;
}

interface SecurityStatus {
	status: SECURITY_STATUS;
	timeout?: NodeJS.Timeout;
	alarmTriggeredCount: number;
	lastArmedAt?: Date;
	lastMovement?: Date;
}

export const securityStatusEvents = new EventEmitter() as TypedEventEmitter<{
	status: (e: StatusEvent) => void;
	alarmTriggeredCount: (e: AlarmTriggeredCountEvent) => void;
	movement: (e: LocationBasedEvent) => void;
	alarm: (e: AlarmEvent) => void;
}>;


const ARMED_SECURITY_STATUS = [SECURITY_STATUS.ARMED, SECURITY_STATUS.PREALARM, SECURITY_STATUS.ALARM];
const securityByLocation: Record<number, SecurityStatus> = {};
const defaultData: SecurityStatus = {
	status: SECURITY_STATUS.DISARMED,
	alarmTriggeredCount: 0
};

export const getSecurityStatus = (location: number) => {
	return securityByLocation[location] && securityByLocation[location].status;
}

export const initSecurity = async () => {
	const locations = await Location
		.find()
		.exec();

	await Promise.all(locations.map(async l => {
		securityByLocation[l.id] = { ...defaultData };
		const result = await SecurityArmingHistory
			.findOne({
				location: l._id
			})
			.sort({
				datetime: -1
			})
			.exec();

			if (result && ARMED_SECURITY_STATUS.indexOf(result.status) !== -1) {
				if (securityByLocation[l.id].status !== SECURITY_STATUS.ARMED) {
					await changeStatus(l.id, SECURITY_STATUS.ARMED);
				} else {
					securityByLocation[l.id].status = SECURITY_STATUS.ARMED;
				}
			}

			const [movementHistory, lastArmed] = await Promise.all([
				SecurityMovementHistory
					.findOne({
						location: l._id
					})
					.sort({
						datetime: -1
					})
					.exec(),
				SecurityArmingHistory
					.findOne({
						status: SECURITY_STATUS.DISARMED,
						location: l._id
					})
					.sort({
						datetime: -1
					})
					.exec()
			]);

			if (movementHistory) {
				securityByLocation[l._id].lastMovement = movementHistory.datetime;
			}

			if (lastArmed) {
				securityByLocation[l._id].lastArmedAt = lastArmed?.datetime;

				const triggeredTimes = await SecurityArmingHistory
					.count({
						status: 'alarm',
						location: l._id,
						datetime: {
							$gt: lastArmed.datetime
						}
					})
					.exec();

				securityByLocation[l._id].alarmTriggeredCount = triggeredTimes;
			}
		}));
}

const changeStatus = async (location: number, newStatus: SECURITY_STATUS) => {
	securityByLocation[location].status = newStatus;
	securityStatusEvents.emit('status', {
		status: securityByLocation[location].status,
		location
	});

	await new SecurityArmingHistory({
		datetime: new Date(),
		location,
		status: newStatus
	}).save();
};

const arm = async (location: number) => {
	clearTimeout(securityByLocation[location].timeout);
	await changeStatus(location, SECURITY_STATUS.ARMING);

	securityByLocation[location].timeout = setTimeout(async () => {
		await changeStatus(location, SECURITY_STATUS.ARMED);
		securityByLocation[location].lastArmedAt = new Date();
	}, 30 * 1000);
};

const disarm = async (location: number) => {
	clearTimeout(securityByLocation[location].timeout);
	securityByLocation[location].alarmTriggeredCount = 0;
	securityStatusEvents.emit('alarmTriggeredCount', {
		location,
		count: securityByLocation[location].alarmTriggeredCount
	});

	await changeStatus(location, SECURITY_STATUS.DISARMED);
};

export const toggleArm = async (location: number) => {
	if (securityByLocation[location].status === SECURITY_STATUS.DISARMED) {
		await arm(location);
	} else {
		await disarm(location);
	}
};

export const movementDetected = async (location: number) => {
	securityStatusEvents.emit('movement', {
		location
	});
	securityByLocation[location].lastMovement = new Date();
	await new SecurityMovementHistory({
		location,
		datetime: new Date()
	}).save();

	if (securityByLocation[location].status === SECURITY_STATUS.ARMED && ARMED_SECURITY_STATUS.includes(securityByLocation[location].status)) {
		await changeStatus(location, SECURITY_STATUS.PREALARM);

		clearTimeout(securityByLocation[location].timeout);
		securityByLocation[location].timeout = setTimeout(async () => {
			securityStatusEvents.emit('alarm', {
				location,
				on: true
			});

			sendPushNotification(['security'], 'ThermoSmart - Security', 'Alarm triggered!');
			await changeStatus(location, SECURITY_STATUS.ALARM);

			securityByLocation[location].alarmTriggeredCount++;
			securityStatusEvents.emit('alarmTriggeredCount', {
				location,
				count: securityByLocation[location].alarmTriggeredCount
			});

			clearTimeout(securityByLocation[location].timeout);
			securityByLocation[location].timeout = setTimeout(async () => {
				securityStatusEvents.emit('alarm', {
					location,
					on: false
				});

				await changeStatus(location, SECURITY_STATUS.ARMED);
			}, 60 * 1000);
		}, 15 * 1000);
	}
};

const clearOldMovementHistory = () => {
	SecurityMovementHistory
		.deleteMany({
			datetime: {
				$lte: moment().subtract(1, 'month').subtract(1, 'day').toDate()
			}
		})
		.exec()
		.then(result => {
			console.log('Security momvent history cleaned up, deleted:', result.deletedCount);
		})
		.catch(err => {
			console.error('Failed to cleanup security movement history with error', err);
		});
};

setInterval(() => {
	clearOldMovementHistory();
}, 60 * 60 * 1000); // every hour
clearOldMovementHistory();



export const getLastMovementDate = (location: number) => securityByLocation[location].lastMovement;
export const getLastArmedDate = (location: number) => securityByLocation[location].lastArmedAt;
export const getAlarmTriggeredCount = (location: number) => securityByLocation[location].alarmTriggeredCount;
