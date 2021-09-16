const EventEmitter = require('events');
const evts = new EventEmitter();

const pushNotifications = require('./pushNotifications');
const SecurityMovementHistory = require('../models/SecurityMovementHistory');
const SecurityArmingHistory = require('../models/SecurityArmingHistory');
const SecurityCameras = require('../models/SecurityCameras');
const SecurityControllers = require('../models/SecurityControllers');

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

let securityCameras = [];
let securityControllers = [];

const HEALTH = {
	OK: 'OK',
	PARTIAL: 'PARTIAL',
	FAIL: 'FAIL'
}
let cameraHealth = HEALTH.FAIL;
let controllerHealth = HEALTH.FAIL;
let keypadHealth = HEALTH.FAIL;
let lastKeypadHealthUpdate = null;
let motionSensorHealth = HEALTH.FAIL;
let lastMotionSensorHealthUpdate = null;

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

SecurityCameras
	.find()
	.exec()
	.then(result => {
		securityCameras = result.map(r => ({
			ip: r.ip,
			healthy: false,
			lastHealthUpdate: null
		}));
		updateCameraHealth();
	});

SecurityControllers
	.find()
	.exec()
	.then(result => {
		securityControllers = result.map(r => ({
			id: r.controllerid,
			healthy: false,
			lastHealthUpdate: null
		}));
		updateControllerHealth();
	});

const changeStatus = (newStatus) => {
	status = newStatus;
	evts.emit('status', status);

	if (status === STATUSES.ALARM) {
		pushNotifications.send(['security'], 'ThermoSmart - Security', 'Alarm triggered!');
	}

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
				evts.emit('alarm', 'false');
				changeStatus(STATUSES.ARMED);
			}, 60 * 1000);
		}, 30 * 1000);
	}
};


const updateCameraHealth = () => {
	let allHealthy = true;
	let noneHealthy = true;

	securityCameras.forEach(c => {
		if (c.healthy) {
			noneHealthy = false;
		} else {
			allHealthy = false;
		}
	});

	if (allHealthy) {
		cameraHealth = HEALTH.OK;
	} else if (noneHealthy) {
		cameraHealth = HEALTH.FAIL;
	} else {
		cameraHealth = HEALTH.PARTIAL;
	}

	evts.emit('camera-health', cameraHealth);
};

const updateControllerHealth = () => {
	let allHealthy = true;
	let noneHealthy = true;

	securityControllers.forEach(c => {
		if (c.healthy) {
			noneHealthy = false;
		} else {
			allHealthy = false;
		}
	});

	if (allHealthy) {
		controllerHealth = HEALTH.OK;
	} else if (noneHealthy) {
		controllerHealth = HEALTH.FAIL;
	} else {
		controllerHealth = HEALTH.PARTIAL;
	}

	evts.emit('controller-health', controllerHealth);
};

const updateMotionSensorHealth = () => {
	evts.emit('motion-sensor-health', motionSensorHealth);
};

const updateKeypadHealth = () => {
	evts.emit('keypad-health', keypadHealth);
};

setInterval(() => {
	let cameraMadeUpdate = false;
	securityCameras.forEach(c => {
		if (c.lastHealthUpdate !== null && Date.now() - c.lastHealthUpdate > 180000) {
			c.healthy = false;
			cameraMadeUpdate = true;
		}
	});
	if (cameraMadeUpdate) {
		updateCameraHealth();
	}

	let controllerMadeUpdate = false;
	securityControllers.forEach(c => {
		if (c.lastHealthUpdate !== null && Date.now() - c.lastHealthUpdate > 180000) {
			c.healthy = false;
			controllerMadeUpdate = true;
		}
	});
	if (controllerMadeUpdate) {
		updateControllerHealth();
	}

	if (lastKeypadHealthUpdate !== null && Date.now() - lastKeypadHealthUpdate > 180000) {
		keypadHealth = HEALTH.FAIL;
		updateKeypadHealth();
	}

	if (lastMotionSensorHealthUpdate !== null && Date.now() - lastMotionSensorHealthUpdate > 180000) {
		motionSensorHealth = HEALTH.FAIL;
		updateMotionSensorHealth();
	}
}, 60000);

exports.securityCameraIpExists = async (ip) => {
	if (securityCameras.find(c => c.ip === ip)) {
		return true;
	}

	return SecurityCameras
		.find({ ip })
		.exec()
		.then(results => {
			return !!results.length;
		});
};

exports.getSecurityCameras = () => securityCameras;
exports.getSecurityCameraIps = () => securityCameras.map(c => c.ip);

exports.addSecurityCamera = (ip) => {
	return new Promise((resolve, reject) => {
		new SecurityCameras({
			ip
		}).save(err => {
			if (err) {
				return reject(err);
			}

			securityCameras.push({
				ip,
				healthy: false,
				lastHealthUpdate: null
			});
			updateCameraHealth();
			resolve();
		});
	});
};

exports.removeSecurityCamera = (ip) => {
	return new Promise((resolve, reject) => {
		SecurityCameras
			.deleteOne({
				ip
			})
			.exec(err => {
				if (err) {
					return reject(err);
				}

				if (securityCameras.find(c => c.ip === ip)) {
					securityCameras.splice(securityCameras.indexOf(ip), 1);
				}
				updateCameraHealth();
				resolve();
			});
	});
}

exports.reportCameraHealth = (ip, health) => {
	const camera = securityCameras.find(c => c.ip === ip);
	if (camera) {
		camera.healthy = health;
		camera.lastHealthUpdate = Date.now();
	}
	updateCameraHealth();
}
exports.getCameraHealth = () => cameraHealth;

exports.reportCameraMovement = () => {
	evts.emit('camera-movement');
};



exports.securityControllerIdExists = async (id) => {
	if (securityControllers.find(c => c.id === id)) {
		return true;
	}

	return SecurityControllers
		.find({ controllerid: id })
		.exec()
		.then(results => {
			return !!results.length;
		});
};

exports.getSecurityControllers = () => securityControllers;

exports.addSecurityController = (id) => {
	return new Promise((resolve, reject) => {
		new SecurityControllers({
			controllerid: id
		}).save(err => {
			if (err) {
				return reject(err);
			}

			securityControllers.push({
				id,
				healthy: false,
				lastHealthUpdate: null
			});
			updateControllerHealth();
			resolve();
		});
	});
};

exports.removeSecurityController = (id) => {
	return new Promise((resolve, reject) => {
		SecurityControllers
			.deleteOne({
				controllerid: id
			})
			.exec(err => {
				if (err) {
					return reject(err);
				}

				if (securityControllers.find(c => c.id === id)) {
					console.log('removed!');
					securityControllers.splice(securityControllers.indexOf(id), 1);
				}
				updateControllerHealth();
				resolve();
			});
	});
}

exports.reportControllerHealth = (id) => {
	const controller = securityControllers.find(c => c.id === id);
	if (controller) {
		controller.healthy = true;
		controller.lastHealthUpdate = Date.now();
	}
	updateControllerHealth();
}
exports.getControllerHealth = () => controllerHealth;



exports.reportKeypadHealth = (health) => {
	keypadHealth = health ? HEALTH.OK : HEALTH.FAIL;
	lastKeypadHealthUpdate = Date.now();
	updateKeypadHealth();
}
exports.getKeypadHealth = () => keypadHealth;

exports.reportMotionSensorHealth = (health) => {
	motionSensorHealth = health ? HEALTH.OK : HEALTH.FAIL;
	lastMotionSensorHealthUpdate = Date.now();
	updateMotionSensorHealth();
}
exports.getMotionSensorHealth = () => motionSensorHealth;
