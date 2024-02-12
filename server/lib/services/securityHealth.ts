import EventEmitter from 'events';
import TypedEventEmitter from 'typed-emitter';
import SecurityCameras from '../models/SecurityCameras';
import SecurityControllers from '../models/SecurityControllers';
import { getConfig } from './config';
import { LocationBasedEvent } from '../types/generic';

enum HEALTH {
	OK = 'OK',
	PARTIAL = 'PARTIAL',
	FAIL = 'FAIL'
}

interface HealthEvent extends LocationBasedEvent {
	health: HEALTH;
}

interface Controller {
	id: number;
	location: number;
	healthy: boolean;
	lastHealthUpdate: number;
}

interface SecurityCamera {
	ip: string;
	location: number;
	healthy: boolean;
	lastHealthUpdate: number;
}

interface MotionSensor {
	healthy: boolean;
	lastHealthUpdate: number;
}

export const securityHealthEvents = new EventEmitter() as TypedEventEmitter<{
	'camera-health': (e: HealthEvent) => void;
	'controller-health': (e: HealthEvent) => void;
	'motion-sensor-health': (e: HealthEvent) => void;
	'keypad-health': (e: HealthEvent) => void;
	'camera-movement': (e: { location: number; }) => void;
	'controller-added': (e: Controller) => void;
}>;

let securityCamerasByLocations: Record<number, SecurityCamera[]> = {};
let securityControllersByLocations: Record<number, Controller[]> = {};
const motionSensorsByLocations: Record<number, Record<string, MotionSensor>> = {};

const cameraHealthByLocation: Record<number, HEALTH> = {};
const controllerHealthByLocation: Record<number, HEALTH> = {};
const keypadHealthByLocation: Record<number, HEALTH> = {};
const lastKeypadHealthUpdateByLocation: Record<number, number> = {};
const motionSensorHealthByLocation: Record<number, HEALTH> = {};

void SecurityCameras
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
				lastHealthUpdate: Date.now()
			});
		});

		updateCameraHealth();
	});

void SecurityControllers
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
				lastHealthUpdate: Date.now()
			});
		});

		updateControllerHealth();
	});


const updateCameraHealthByLocation = (locationId: number) => {
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

	securityHealthEvents.emit('camera-health', {
		health: cameraHealthByLocation[locationId],
		location: locationId
	});
};

const updateCameraHealth = () => {
	Object.keys(securityCamerasByLocations).map(Number).forEach(l => updateCameraHealthByLocation(l));
};

const updateControllerHealthByLocation = (locationId: number) => {
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

	securityHealthEvents.emit('controller-health', {
		health: controllerHealthByLocation[locationId],
		location: locationId
	});
};

const updateControllerHealth = () => {
	Object.keys(securityControllersByLocations).map(Number).forEach(l => updateControllerHealthByLocation(l));
};

const updateMotionSensorHealth = async (locationId: number) => {
	const motionSensorCountObj = await getConfig('motionSensorCount', locationId);
	const motionSensorCount = motionSensorCountObj ? motionSensorCountObj.value : 0;
	let allHealthy = true;
	let noneHealthy = true;

	Object.keys(motionSensorsByLocations[locationId]).forEach(id => {
		if (motionSensorsByLocations[locationId][id].healthy) {
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

	securityHealthEvents.emit('motion-sensor-health', {
		health: motionSensorHealthByLocation[locationId],
		location: locationId
	});
};

const updateKeypadHealth = (locationId: number) => {
	securityHealthEvents.emit('keypad-health', {
		health: keypadHealthByLocation[locationId],
		location: locationId
	});
};

setInterval(() => {
	if (securityCamerasByLocations) {
		Object.keys(securityCamerasByLocations).map(Number).forEach(l => {
			if (securityControllersByLocations[l]) {
				let cameraMadeUpdate = false;

				securityCamerasByLocations[l].forEach(c => {
					if (Date.now() - c.lastHealthUpdate > 180000) {
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
		Object.keys(securityControllersByLocations).map(Number).forEach(l => {
			if (securityControllersByLocations[l]) {
				let controllerMadeUpdate = false;

				securityControllersByLocations[l].forEach(c => {
					if (Date.now() - c.lastHealthUpdate > 180000) {
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
		Object.keys(securityControllersByLocations).map(Number).forEach(l => {
			if (securityControllersByLocations[l]) {
				securityControllersByLocations[l].forEach(() => {
					if (lastKeypadHealthUpdateByLocation[l] !== null && Date.now() - lastKeypadHealthUpdateByLocation[l] > 180000) {
						keypadHealthByLocation[l] = HEALTH.FAIL;
						updateKeypadHealth(l);
					}
				});
			}
		});
	}

	if (motionSensorsByLocations) {
		Object.keys(securityControllersByLocations).map(Number).forEach(l => {
			let motionSensorMadeUpdate = false;

			if (motionSensorsByLocations[l]) {
				Object.keys(motionSensorsByLocations[l]).map(Number).forEach(id => {
					if (motionSensorsByLocations[l][id].lastHealthUpdate !== null && Date.now() - motionSensorsByLocations[l][id].lastHealthUpdate > 180000) {
						motionSensorsByLocations[l][id].healthy = false;
						motionSensorMadeUpdate = true;
					}
				});

				if (motionSensorMadeUpdate) {
					void updateMotionSensorHealth(l);
				}
			}
		});
	}
}, 60000);

export const securityCamera = {
	ipExists: async (ip: string, location: number) => {
		if (securityCamerasByLocations[location] && securityCamerasByLocations[location].find(c => c.ip === ip)) {
			return true;
		}

		const results = await SecurityCameras
			.find({ ip, location })
			.exec();

		return !!results.length;
	},
	list: async (location: number) => {
		if (securityCamerasByLocations[location]) {
			return securityCamerasByLocations[location];
		} else {
			const results = await SecurityCameras
				.find({
					location
				})
				.exec();

			return results;
		}
	},
	listIPs: async (location: number) => {
		if (securityCamerasByLocations[location]) {
			return securityCamerasByLocations[location].map(c => c.ip);
		} else {
			const results = await SecurityCameras
				.find({
					location
				})
				.exec();

			return results.map(r => r.ip);
		}
	},
	add: async (ip: string, location: number) => {
		await new SecurityCameras({
			ip,
			location
		})
		.save()

		securityCamerasByLocations[location].push({
			ip,
			location,
			healthy: false,
			lastHealthUpdate: Date.now()
		});
		updateCameraHealthByLocation(location);
	},
	remove: async (ip: string, location: number) => {
		await SecurityCameras
			.deleteOne({
				ip
			})
			.exec();

		const securityCameraFound = securityCamerasByLocations[location].find(c => c.ip === ip);
		if (securityCameraFound) {
			securityCamerasByLocations[location].splice(securityCamerasByLocations[location].indexOf(securityCameraFound), 1);
		}
		updateCameraHealthByLocation(location);
	},
	reportHealth: async (id: number, ip: string, health: boolean) => {
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
	getHealth: (location: number) => cameraHealthByLocation[location],
	reportMovement: (id: number, location: number) => {
		securityHealthEvents.emit('camera-movement', {
			location
		});
	}
}


export const securityController = {
	idExists: async (id: number) => {
		let found = false;
		Object.keys(securityControllersByLocations).map(Number).forEach(l => {
			if (securityControllersByLocations[l] && securityControllersByLocations[l].find(c => c.id === id)) {
				found = true;
			}
		});

		if (found) {
			return true;
		}

		const results = await SecurityControllers
			.find({ controllerid: id })
			.exec();

		return !!results.length;
	},
	getLocationByControllerId: async (id: number) => {
		let location;
		Object.keys(securityControllersByLocations).map(Number).forEach(l => {
			if (securityControllersByLocations[l] && securityControllersByLocations[l].find(c => c.id === id)) {
				location = l;
			}
		});

		if (location) {
			return location;
		}

		const result = await SecurityControllers
			.findOne({ controllerid: id })
			.exec();

		return result?.location;
	},
	getIdsByLocation: async (location: number) => {
		if (securityControllersByLocations[location]) {
			return securityControllersByLocations[location].map(sc => sc.id);
		}

		const results = await SecurityControllers
			.find({
				location
			})
			.exec();

		return results?.map(r => r.controllerid);
	},
	list: async (location: number) => {
		if (securityControllersByLocations[location]) {
			return securityControllersByLocations[location];
		} else {
			const results = await SecurityControllers
				.find({
					location
				})
				.exec();

			return results.map(r => ({
				...r,
				id: r.controllerid
			}));
		}
	},
	add: async (id: number, location: number) => {
		await new SecurityControllers({
				controllerid: id,
				location
			})
			.save();

		const newController: Controller = {
			id,
			location,
			healthy: false,
			lastHealthUpdate: Date.now()
		};
		securityControllersByLocations[location].push(newController);
		securityHealthEvents.emit('controller-added', newController);
		updateControllerHealthByLocation(location);
	},
	remove: async (id: number) => {
		await SecurityControllers
			.deleteOne({
				controllerid: id
			})
			.exec();

		Object.keys(securityCamerasByLocations).map(Number).forEach(l => {
			if (securityControllersByLocations[l].find(c => c.id === id)) {
				securityControllersByLocations[l].splice(securityControllersByLocations[l].findIndex(c => c.id === id), 1);
			}
			updateControllerHealthByLocation(l);
		});
	},
	reportHealth: async (id: number) => {
		const securityControllerData = await SecurityControllers.findOne({
			controllerid: id
		}).exec();

		if (securityControllerData) {
			const controller = securityControllersByLocations[securityControllerData.location]?.find(c => c.id === id);
			if (controller) {
				controller.healthy = true;
				controller.lastHealthUpdate = Date.now();
			}
			updateControllerHealthByLocation(securityControllerData.location);
		}
	},
	getHealth: (location: number) => controllerHealthByLocation[location]
};


export const securityKeypad = {
	reportHealth: async (id: number, health: boolean) => {
		const securityControllerData = await SecurityControllers.findOne({
			controllerid: id
		}).exec();

		if (securityControllerData) {
			if (!motionSensorsByLocations[securityControllerData.location]) {
				motionSensorsByLocations[securityControllerData.location] = {};
			}

			keypadHealthByLocation[securityControllerData.location] = health ? HEALTH.OK : HEALTH.FAIL;
			lastKeypadHealthUpdateByLocation[securityControllerData.location] = Date.now();

			updateKeypadHealth(securityControllerData.location);
		}
	},
	getHealth: (location: number) => keypadHealthByLocation[location]
};

export const motionSensor = {
	reportHealth: async (id: string, health: boolean) => {
		const controllerId = id.toString().match('([0-9]+)\.([0-9]+)?');

		if (controllerId?.length) {
			const securityControllerData = await SecurityControllers.findOne({
				controllerid: parseInt(controllerId[1], 10)
			}).exec();

			if (securityControllerData) {
				if (!motionSensorsByLocations[securityControllerData.location]) {
					motionSensorsByLocations[securityControllerData.location] = {};
				}

				motionSensorsByLocations[securityControllerData.location][id] = {
					healthy: health,
					lastHealthUpdate: Date.now()
				};
				await updateMotionSensorHealth(securityControllerData.location);
			}
		}
	},
	getHealth: (location: number) => motionSensorHealthByLocation[location]
};
