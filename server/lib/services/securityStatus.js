const EventEmitter = require('events');
const evts = new EventEmitter();

const pushNotifications = require('./pushNotifications');
const SecurityMovementHistory = require('../models/SecurityMovementHistory');
const SecurityArmingHistory = require('../models/SecurityArmingHistory');
const Location = require('../models/Location');
const moment = require('moment');

const STATUSES = {
	DISARMED: 'disarmed',
	ARMING: 'arming',
	ARMED: 'armed',
	PREALARM: 'prealarm',
	ALARM: 'alarm'
};
const ARMED_STATUSES = [STATUSES.ARMED, STATUSES.PREALARM, STATUSES.ALARM];
const securityByLocation = {};
const defaultData = {
	status: STATUSES.DISARMED,
	timeout: null,
	alarmTriggeredCount: 0,
	lastArmedAt: null,
	lastMovement: null
};

exports.evts = evts;
exports.getStatus = (location) => {
	return securityByLocation[location] && securityByLocation[location].status;
}

Location
	.find()
	.exec()
	.then(locations => {
		locations.forEach(l => {
			securityByLocation[l.id] = { ...defaultData };
			SecurityArmingHistory
				.findOne({
					location: l._id
				})
				.sort({
					datetime: -1
				})
				.exec()
				.then((result) => {
					if (result && ARMED_STATUSES.indexOf(result.status) !== -1) {
						if (securityByLocation[l.id].status !== STATUSES.ARMED) {
							changeStatus(l.id, STATUSES.ARMED);
						} else {
							securityByLocation[l.id].status = STATUSES.ARMED;
						}
					}
				});

			Promise.resolve([
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
						status: 'arming',
						location: l._id
					})
					.sort({
						datetime: -1
					})
					.exec()
			]).then(([movementHistory, lastArmed]) => {
				securityByLocation[l._id].lastArmedAt = new Date(lastArmed.datetime);
				securityByLocation[l._id].lastMovement = new Date(movementHistory.datetime);

				SecurityArmingHistory
					.count({
						status: 'alarm',
						location: l._id,
						datetime: {
							$gt: lastArmed.datetime
						}
					})
					.exec()
					.then(triggeredTimes => {
						securityByLocation[l._id].alarmTriggeredCount = triggeredTimes;
					});
			});
		});
	});

const changeStatus = (location, newStatus) => {
	securityByLocation[location].status = newStatus;
	evts.emit('status', {
		status: securityByLocation[location].status,
		location
	});

	new SecurityArmingHistory({
		datetime: new Date(),
		location,
		status: newStatus
	}).save();
};

const arm = (location) => {
	clearTimeout(securityByLocation[location].timeout);
	changeStatus(location, STATUSES.ARMING);

	securityByLocation[location].timeout = setTimeout(() => {
		changeStatus(location, STATUSES.ARMED);
		securityByLocation[location].lastArmedAt = new Date();
	}, 30 * 1000);
};

const disarm = (location) => {
	clearTimeout(securityByLocation[location].timeout);
	securityByLocation[location].alarmTriggeredCount = 0;
	evts.emit('alarmTriggeredCount', {
		location,
		count: securityByLocation[location].alarmTriggeredCount
	});

	changeStatus(location, STATUSES.DISARMED);
};

exports.toggleArm = (location) => {
	if (securityByLocation[location].status === STATUSES.DISARMED) {
		arm(location);
	} else {
		disarm(location);
	}
};

exports.movementDetected = (location) => {
	evts.emit('movement', {
		location
	});
	securityByLocation[location].lastMovement = new Date();
	new SecurityMovementHistory({
		location,
		datetime: new Date()
	}).save();

	if (securityByLocation[location].status === STATUSES.ARMED && ARMED_STATUSES.includes(securityByLocation[location].status)) {
		changeStatus(location, STATUSES.PREALARM);

		clearTimeout(securityByLocation[location].timeout);
		securityByLocation[location].timeout = setTimeout(() => {
			evts.emit('alarm', {
				location,
				on: true
			});
			pushNotifications.send(['security'], 'ThermoSmart - Security', 'Alarm triggered!');
			changeStatus(location, STATUSES.ALARM);
			securityByLocation[location].alarmTriggeredCount++;
			evts.emit('alarmTriggeredCount', {
				location,
				count: securityByLocation[location].alarmTriggeredCount
			});

			clearTimeout(securityByLocation[location].timeout);
			timeout = setTimeout(() => {
				evts.emit('alarm', {
					location,
					on: false
				});
				changeStatus(location, STATUSES.ARMED);
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



exports.getLastMovementDate = (location) => securityByLocation[location].lastMovement;
exports.getLastArmedDate = (location) => securityByLocation[location].lastArmedAt;
exports.getAlarmTriggeredCount = (location) => securityByLocation[location].alarmTriggeredCount;
