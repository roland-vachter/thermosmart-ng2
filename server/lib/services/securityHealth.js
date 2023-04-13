const EventEmitter = require('events');
const evts = new EventEmitter();
const SecurityCameras = require('../models/SecurityCameras');
const SecurityControllers = require('../models/SecurityControllers');
const configService = require('../services/config');

let securityCamerasByLocations = {};
let securityControllersByLocations = {};
let motionSensorsByLocations = {};

const HEALTH = {
	OK: 'OK',
	PARTIAL: 'PARTIAL',
	FAIL: 'FAIL'
}
let cameraHealthByLocation = {};
let controllerHealthByLocation = {};
let keypadHealthByLocation = {};
let lastKeypadHealthUpdateByLocation = {};
let motionSensorHealthByLocation = {};

SecurityCameras
	.find()
	.exec()
	.then(result => {
		securityCamerasByLocations = {};

		result.forEach(r => {
			if (!securityCamerasByLocations[r.location]) {
				securityCamerasByLocations[r.location] = [];
			}

			securityCamerasByLocations[r.location].push({
				ip: r.ip,
				location: r.location,
				healthy: false,
				lastHealthUpdate: null
			});
		});

		updateCameraHealth();
	});

SecurityControllers
	.find()
	.exec()
	.then(result => {
		securityControllersByLocations = {};

		result.forEach(r => {
			if (!securityControllersByLocations[r.location]) {
				securityControllersByLocations[r.location] = [];
			}

			securityControllersByLocations[r.location].push({
				id: r.controllerid,
				location: r.location,
				healthy: false,
				lastHealthUpdate: null
			});
		});

		updateControllerHealth();
	});


const updateCameraHealthByLocation = (locationId) => {
	let allHealthy = true;
	let noneHealthy = true;

	securityCamerasByLocations[locationId].forEach(c => {
		if (c.healthy) {
			noneHealthy = false;
		} else {
			allHealthy = false;
		}
	});

	if (allHealthy) {
		cameraHealthByLocation[locationId] = HEALTH.OK;
	} else if (noneHealthy) {
		cameraHealthByLocation[locationId] = HEALTH.FAIL;
	} else {
		cameraHealthByLocation[locationId] = HEALTH.PARTIAL;
	}

	evts.emit('camera-health', {
		health: cameraHealthByLocation[locationId],
		location: locationId
	});
};

const updateCameraHealth = () => {
	Object.keys(securityCamerasByLocations).forEach(l => updateCameraHealthByLocation(l));
};

const updateControllerHealthByLocation = (locationId) => {
	let allHealthy = true;
	let noneHealthy = true;

	securityControllersByLocations[locationId].forEach(c => {
		if (c.healthy) {
			noneHealthy = false;
		} else {
			allHealthy = false;
		}
	});

	if (allHealthy) {
		controllerHealthByLocation[locationId] = HEALTH.OK;
	} else if (noneHealthy) {
		controllerHealthByLocation[locationId] = HEALTH.FAIL;
	} else {
		controllerHealthByLocation[locationId] = HEALTH.PARTIAL;
	}

	evts.emit('controller-health', {
		health: controllerHealthByLocation[locationId],
		location: locationId
	});
};

const updateControllerHealth = () => {
	Object.keys(securityControllersByLocations).forEach(l => updateControllerHealthByLocation(l));
};

const updateMotionSensorHealth = async (locationId) => {
	const motionSensorCountObj = await configService.get('motionSensorCount', locationId);
	const motionSensorCount = motionSensorCountObj ? motionSensorCountObj.value : 0;
	let allHealthy = true;
	let noneHealthy = true;

	Object.keys(motionSensorsByLocations[locationId]).forEach(id => {
		if (motionSensorsByLocations[locationId][id].health) {
			noneHealthy = false;
		} else {
			allHealthy = false;
		}
	});

	if (allHealthy && Object.keys(motionSensorsByLocations[locationId]).length === motionSensorCount) {
		motionSensorHealthByLocation[locationId] = HEALTH.OK;
	} else if (noneHealthy) {
		motionSensorHealthByLocation[locationId] = HEALTH.FAIL;
	} else {
		motionSensorHealthByLocation[locationId] = HEALTH.PARTIAL;
	}

	evts.emit('motion-sensor-health', {
		health: motionSensorHealthByLocation[locationId],
		location: locationId
	});
};

const updateKeypadHealth = (locationId) => {
	evts.emit('keypad-health', {
		health: keypadHealthByLocation[locationId],
		location: locationId
	});
};

setInterval(() => {
	if (securityCamerasByLocations) {
		Object.keys(securityCamerasByLocations).forEach(l => {
			if (securityControllersByLocations[l]) {
				let cameraMadeUpdate = false;

				securityCamerasByLocations[l].forEach(c => {
					if (c.lastHealthUpdate !== null && Date.now() - c.lastHealthUpdate > 180000) {
						c.healthy = false;
						cameraMadeUpdate = true;
					}
				});

				if (cameraMadeUpdate) {
					updateCameraHealthByLocation(l);
				}
			}
		});
	}

	if (securityControllersByLocations) {
		Object.keys(securityControllersByLocations).forEach(l => {
			if (securityControllersByLocations[l]) {
				let controllerMadeUpdate = false;

				securityControllersByLocations[l].forEach(c => {
					if (c.lastHealthUpdate !== null && Date.now() - c.lastHealthUpdate > 180000) {
						c.healthy = false;
						controllerMadeUpdate = true;
					}
				});

				if (controllerMadeUpdate) {
					updateControllerHealthByLocation(l);
				}
			}
		});
	}

	if (securityControllersByLocations) {
		Object.keys(securityControllersByLocations).forEach(l => {
			if (securityControllersByLocations[l]) {
				securityControllersByLocations[l].forEach(c => {
					if (lastKeypadHealthUpdateByLocation[l] !== null && Date.now() - lastKeypadHealthUpdateByLocation[l] > 180000) {
						keypadHealthByLocation[l] = HEALTH.FAIL;
						updateKeypadHealth(l);
					}
				});
			}
		});
	}

	if (motionSensorsByLocations) {
		Object.keys(securityControllersByLocations).forEach(l => {
			let motionSensorMadeUpdate = false;

			if (motionSensorsByLocations[l]) {
				Object.keys(motionSensorsByLocations[l]).forEach(id => {
					if (motionSensorsByLocations[l][id].lastHealthUpdate !== null && Date.now() - motionSensorsByLocations[l][id].lastHealthUpdate > 180000) {
						motionSensorsByLocations[l][id].health = false;
						motionSensorMadeUpdate = true;
					}
				});

				if (motionSensorMadeUpdate) {
					updateMotionSensorHealth(l);
				}
			}
		});
	}
}, 60000);

exports.evts = evts;

exports.camera = {
	ipExists: async (ip, location) => {
		if (securityCamerasByLocations[location] && securityCamerasByLocations[location].find(c => c.ip === ip)) {
			return true;
		}

		return SecurityCameras
			.find({ ip, location })
			.exec()
			.then(results => {
				return !!results.length;
			});
	},
	list: async (location) => {
		if (securityCamerasByLocations[location]) {
			return securityCamerasByLocations[location];
		} else {
			return SecurityCameras
				.find({
					location
				})
				.exec()
				.then(results => {
					return results;
				});
		}
	},
	listIPs: async (location) => {
		if (securityCamerasByLocations[location]) {
			return securityCamerasByLocations[location].map(c => c.ip);
		} else {
			return SecurityCameras
				.find({
					location
				})
				.exec()
				.then(results => {
					return results.map(r => r.ip);
				});
		}
	},
	add: (ip, location) => {
		return new SecurityCameras({
			ip,
			location
		})
		.save()
		.then(() => {
			securityCamerasByLocations[location].push({
				ip,
				location,
				healthy: false,
				lastHealthUpdate: null
			});
			updateCameraHealthByLocation(location);
		});
	},
	remove: (ip, location) => {
		return SecurityCameras
			.deleteOne({
				ip
			})
			.exec()
			.then(() => {
				if (securityCamerasByLocations[location].find(c => c.ip === ip)) {
					securityCamerasByLocations[location].splice(securityCamerasByLocations[location].indexOf(ip), 1);
				}
				updateCameraHealthByLocation(location);
			});
	},
	reportHealth: async (id, ip, health) => {
		id = parseInt(id, 10);

		const securityControllerData = await SecurityControllers.findOne({
			controllerid: id
		}).exec();

		if (!securityControllerData) {
			throw new Error(`Security controller with ID ${id} is not found.`);
		}

		const camera = securityCamerasByLocations[securityControllerData.location].find(c => c.ip === ip);
		if (camera) {
			camera.healthy = health;
			camera.lastHealthUpdate = Date.now();
		}
		updateCameraHealthByLocation(securityControllerData.location);
	},
	getHealth: (location) => cameraHealthByLocation[location],
	reportMovement: (id, location) => {
		evts.emit('camera-movement', {
			location
		});
	}
}


exports.controller = {
	idExists: async (id) => {
		let found = false;
		Object.keys(securityControllersByLocations).forEach(l => {
			if (securityControllersByLocations[l] && securityControllersByLocations[l].find(c => c.id === id)) {
				found = true;
			}
		});

		if (found) {
			return true;
		}

		return SecurityControllers
			.find({ controllerid: id })
			.exec()
			.then(results => {
				return !!results.length;
			});
	},
	getLocationById: async (id) => {
		id = parseInt(id, 10);

		let location;
		Object.keys(securityControllersByLocations).forEach(l => {
			if (securityControllersByLocations[l] && securityControllersByLocations[l].find(c => c.id === id)) {
				location = l;
			}
		});

		if (location) {
			return location;
		}

		return SecurityControllers
			.findOne({ controllerid: id })
			.lean()
			.exec()
			.then(result => {
				return result.location;
			});
	},
	getIdsByLocation: async (location) => {
		if (typeof location === 'string') {
			location = parseInt(location, 10);
		}

		if (securityControllersByLocations[location]) {
			return securityControllersByLocations[location].map(sc => sc.id);
		}

		return SecurityControllers
			.find({
				location
			})
			.lean()
			.exec()
			.then(result => result.controllerid)
	},
	list: async (location) => {
		if (securityControllersByLocations[location]) {
			return securityControllersByLocations[location];
		} else {
			return SecurityControllers
				.find({
					location
				})
				.lean()
				.exec()
				.then(results => {
					return results.map(r => ({
						...r,
						id: r.controllerid
					}));
				});
		}
	},
	add: (id, location) => {
		id = parseInt(id, 10);

		return new SecurityControllers({
				controllerid: id,
				location
			})
			.save()
			.then(() => {
				const newController = {
					id,
					location,
					healthy: false,
					lastHealthUpdate: null
				};
				securityControllersByLocations[location].push(newController);
				evts.emit('controller-added', newController);
				updateControllerHealthByLocation(location);
			});
	},
	remove: (id) => {
		id = parseInt(id, 10);

		return SecurityControllers
			.deleteOne({
				controllerid: id
			})
			.exec()
			.then(() => {
				Object.keys(securityCamerasByLocations).forEach(l => {
					if (securityControllersByLocations[l].find(c => c.id === id)) {
						securityControllersByLocations[l].splice(securityControllersByLocations[l].findIndex(c => c.id === id), 1);
					}
					updateControllerHealthByLocation(l);
				});
			});
	},
	reportHealth: async (id) => {
		id = parseInt(id, 10);
		const securityControllerData = await SecurityControllers.findOne({
			controllerid: id
		}).exec();

		const controller = securityControllersByLocations[securityControllerData.location]?.find(c => c.id === id);
		if (controller) {
			controller.healthy = true;
			controller.lastHealthUpdate = Date.now();
		}
		updateControllerHealthByLocation(securityControllerData.location);
	},
	getHealth: (location) => controllerHealthByLocation[location]
};


exports.keypad = {
	reportHealth: async (id, health) => {
		id = parseInt(id, 10);
		const securityControllerData = await SecurityControllers.findOne({
			controllerid: id
		}).exec();

		if (!motionSensorsByLocations[securityControllerData.location]) {
			motionSensorsByLocations[securityControllerData.location] = {};
		}

		keypadHealthByLocation[securityControllerData.location] = health ? HEALTH.OK : HEALTH.FAIL;
		lastKeypadHealthUpdateByLocation[securityControllerData.location] = Date.now();

		updateKeypadHealth(securityControllerData.location);
	},
	getHealth: (location) => keypadHealthByLocation[location]
};

exports.motionSensor = {
	reportHealth: async (id, health) => {
		const controllerId = id.toString().match('([0-9]+)(\.[0-9]+)?');
		const securityControllerData = await SecurityControllers.findOne({
			controllerid: parseInt(controllerId[1], 10)
		}).exec();

		if (!motionSensorsByLocations[securityControllerData.location]) {
			motionSensorsByLocations[securityControllerData.location] = {};
		}

		motionSensorsByLocations[securityControllerData.location][id] = {
			health,
			lastHealthUpdate: Date.now()
		};
		updateMotionSensorHealth(securityControllerData.location);
	},
	getHealth: (location) => motionSensorHealthByLocation[location]
};
