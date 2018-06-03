const EventEmitter = require('events');
const evts = new EventEmitter();

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
	}, 30 * 1000);
};

const disarm = () => {
	clearTimeout(timeout);

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
	new SecurityMovementHistory({
		datetime: new Date()
	}).save();

	if (status === STATUSES.ARMED && ARMED_STATUSES.includes(status)) {
		changeStatus(STATUSES.PREALARM);

		clearTimeout(timeout);
		timeout = setTimeout(() => {
			evts.emit('alarm', true);
			changeStatus(STATUSES.ALARM);

			clearTimeout(timeout);
			timeout = setTimeout(() => {
				evts.emit('alarm', false);
				changeStatus(STATUSES.ARMED);
			}, 60 * 1000);
		}, 30 * 1000);
	}
};
