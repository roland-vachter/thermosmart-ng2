const EventEmitter = require('events');
const evts = new EventEmitter();
const SecurityCameras = require('../models/SecurityCameras');
const SecurityControllers = require('../models/SecurityControllers');
const configService = require('../services/config');

let securityCameras = null;
let securityControllers = null;
let motionSensors = {};

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

const updateMotionSensorHealth = async () => {
	const motionSensorCountObj = await configService.get('motionSensorCount');
	const motionSensorCount = motionSensorCountObj ? motionSensorCountObj.value : 0;
	let allHealthy = true;
	let noneHealthy = true;

	Object.keys(motionSensors).forEach(id => {
		if (motionSensors[id].health) {
			noneHealthy = false;
		} else {
			allHealthy = false;
		}
	});

	if (allHealthy && Object.keys(motionSensors).length === motionSensorCount) {
		motionSensorHealth = HEALTH.OK;
	} else if (noneHealthy) {
		motionSensorHealth = HEALTH.FAIL;
	} else {
		motionSensorHealth = HEALTH.PARTIAL;
	}

	evts.emit('motion-sensor-health', motionSensorHealth);
};

const updateKeypadHealth = () => {
	evts.emit('keypad-health', keypadHealth);
};

setInterval(() => {
	if (securityCameras) {
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
	}

	if (securityControllers) {
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
	}

	if (lastKeypadHealthUpdate !== null && Date.now() - lastKeypadHealthUpdate > 180000) {
		keypadHealth = HEALTH.FAIL;
		updateKeypadHealth();
	}

	if (motionSensors) {
		let motionSensorMadeUpdate = false;
		Object.keys(motionSensors).forEach(id => {
			if (motionSensors[id].lastHealthUpdate !== null && Date.now() - motionSensors[id].lastHealthUpdate > 180000) {
				motionSensors[id].health = false;
				motionSensorMadeUpdate = true;
			}
		});
		if (motionSensorMadeUpdate) {
			updateMotionSensorHealth();
		}
	}
}, 60000);

exports.evts = evts;

exports.camera = {
	ipExists: async (ip) => {
		if (securityCameras && securityCameras.find(c => c.ip === ip)) {
			return true;
		}

		return SecurityCameras
			.find({ ip })
			.exec()
			.then(results => {
				return !!results.length;
			});
	},
	list: async () => {
		if (securityCameras) {
			return securityCameras;
		} else {
			return SecurityCameras
				.find()
				.exec()
				.then(results => {
					return results;
				});
		}
	},
	listIPs: async () => {
		if (securityCameras) {
			return securityCameras.map(c => c.ip);
		} else {
			return SecurityCameras
				.find()
				.exec()
				.then(results => {
					return results.map(r => r.ip);
				});
		}
	},
	add: (ip) => {
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
	},
	remove: (ip) => {
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
	},
	reportHealth: (ip, health) => {
		const camera = securityCameras.find(c => c.ip === ip);
		if (camera) {
			camera.healthy = health;
			camera.lastHealthUpdate = Date.now();
		}
		updateCameraHealth();
	},
	getHealth: () => cameraHealth,
	reportMovement: () => {
		evts.emit('camera-movement');
	}
}


exports.controller = {
	idExists: async (id) => {
		if (securityControllers && securityControllers.find(c => c.id === id)) {
			return true;
		}

		return SecurityControllers
			.find({ controllerid: id })
			.exec()
			.then(results => {
				return !!results.length;
			});
	},
	list: async () => {
		if (securityControllers) {
			return securityControllers;
		} else {
			return SecurityControllers
				.find()
				.exec()
				.then(results => {
					return results.map(r => ({
						...r,
						id: controllerid
					}));
				});
		}
	},
	add: (id) => {
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
	},
	remove: (id) => {
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
	},
	reportHealth: (id) => {
		const controller = securityControllers.find(c => c.id === id);
		if (controller) {
			controller.healthy = true;
			controller.lastHealthUpdate = Date.now();
		}
		updateControllerHealth();
	},
	getHealth: () => controllerHealth
};


exports.keypad = {
	reportHealth: (health) => {
		keypadHealth = health ? HEALTH.OK : HEALTH.FAIL;
		lastKeypadHealthUpdate = Date.now();
		updateKeypadHealth();
	},
	getHealth: () => keypadHealth
};

exports.motionSensor = {
	reportHealth: (id, health) => {
		motionSensors[id] = {
			health,
			lastHealthUpdate: Date.now()
		};
		updateMotionSensorHealth();
	},
	getHealth: () => motionSensorHealth
};
