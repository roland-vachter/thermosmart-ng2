const EventEmitter = require('events');
const evts = new EventEmitter();

const pushNotifications = require('./pushNotifications');
const SecurityMovementHistory = require('../models/SecurityMovementHistory');
const SecurityArmingHistory = require('../models/SecurityArmingHistory');

const STATUSES = {
	DISARMED: 'disarmed',
	ARMING: 'arming',
	ARMED: 'armed',
	PREALARM: 'prealarm',
	ALARM: 'alarm'
};
const ARMED_STATUSES = [STATUSES.ARMED, STATUSES.PREALARM, STATUSES.ALARM];
let status = STATUSES.DISARMED;
let timeout;
let alarmTriggeredCount = 0;
let lastArmedAt = null;
let lastMovement = null;

exports.evts = evts;
exports.getStatus = () => status;

SecurityArmingHistory
	.findOne()
	.sort({
		datetime: -1
	})
	.exec()
	.then((result) => {
		if (result && ARMED_STATUSES.indexOf(result.status) !== -1) {
			if (status !== STATUSES.ARMED) {
				changeStatus(STATUSES.ARMED);
			} else {
				status = STATUSES.ARMED;
			}
		}
	});

Promise.resolve([
	SecurityMovementHistory
		.findOne()
		.sort({
			datetime: -1
		})
		.exec(),
	SecurityArmingHistory
		.findOne({
			status: 'arming'
		})
		.sort({
			datetime: -1
		})
		.exec()
]).then(([movementHistory, lastArmed]) => {
	lastArmedAt = new Date(lastArmed.datetime);
	lastMovement = new Date(movementHistory.datetime);

	SecurityArmingHistory
		.count({
			status: 'alarm',
			datetime: {
				$gt: lastArmed.datetime
			}
		})
		.exec()
		.then(triggeredTimes => {
			alarmTriggeredCount = triggeredTimes;
		});
});

const changeStatus = (newStatus) => {
	status = newStatus;
	evts.emit('status', status);

	new SecurityArmingHistory({
		datetime: new Date(),
		status: newStatus
	}).save();
};

const arm = () => {
	clearTimeout(timeout);
	changeStatus(STATUSES.ARMING);

	timeout = setTimeout(() => {
		changeStatus(STATUSES.ARMED);
		lastArmedAt = new Date();
	}, 30 * 1000);
};

const disarm = () => {
	clearTimeout(timeout);
	alarmTriggeredCount = 0;
	evts.emit('alarmTriggeredCount', alarmTriggeredCount);

	changeStatus(STATUSES.DISARMED);
};

exports.toggleArm = () => {
	if (status === STATUSES.DISARMED) {
		arm();
	} else {
		disarm();
	}
};

exports.movementDetected = () => {
	evts.emit('movement', true);
	lastMovement = new Date();
	new SecurityMovementHistory({
		datetime: new Date()
	}).save();

	if (status === STATUSES.ARMED && ARMED_STATUSES.includes(status)) {
		changeStatus(STATUSES.PREALARM);

		clearTimeout(timeout);
		timeout = setTimeout(() => {
			evts.emit('alarm', true);
			pushNotifications.send(['security'], 'ThermoSmart - Security', 'Alarm triggered!');
			changeStatus(STATUSES.ALARM);
			alarmTriggeredCount++;
			evts.emit('alarmTriggeredCount', alarmTriggeredCount);

			clearTimeout(timeout);
			timeout = setTimeout(() => {
				evts.emit('alarm', 'false');
				changeStatus(STATUSES.ARMED);
			}, 60 * 1000);
		}, 15 * 1000);
	}
};

exports.getLastMovementDate = () => lastMovement;
exports.getLastArmedDate = () => lastArmedAt;
exports.getAlarmTriggeredCount = () => alarmTriggeredCount;
