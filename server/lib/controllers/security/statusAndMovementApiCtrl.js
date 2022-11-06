const securityStatus = require('../../services/securityStatus');
const securityHealth = require('../../services/securityHealth');
const types = require('../../utils/types');

exports.toggleArm = async (req, res) => {
	if (!req.body.location && !req.query.id) {
		return res.status(400).json({
			status: types.RESPONSE_STATUS.ERROR,
			reason: 'Location or ID parameter is missing'
		});
	}

	const location = req.body.location ? parseInt(req.body.location, 10) : await securityHealth.controller.getLocationById(req.query.id);

	securityStatus.toggleArm(location);

	res.json({
		status: 'ok'
	});
};

exports.status = async (req, res) => {
	if (!req.query.id) {
		return res.status(400).json({
			status: types.RESPONSE_STATUS.ERROR,
			reason: 'ID parameter is missing'
		});
	}

	res.json({
		status: 'ok',
		data: {
			security: {
				status: securityStatus.getStatus(await securityHealth.controller.getLocationById(req.query.id))
			}
		}
	});
};

exports.init = (req, res) => {
	if (!req.query.location) {
		return res.status(400).json({
			status: types.RESPONSE_STATUS.ERROR,
			reason: 'Location parameter is missing'
		});
	}

	const location = parseInt(req.query.location, 10);

	res.json({
		status: 'ok',
		data: {
			security: {
				status: securityStatus.getStatus(location),
				lastActivity: securityStatus.getLastMovementDate(location).getTime(),
				lastArmedAt: securityStatus.getLastArmedDate(location).getTime(),
				alarmTriggeredCount: securityStatus.getAlarmTriggeredCount(location),
				cameraHealth: securityHealth.camera.getHealth(location),
				controllerHealth: securityHealth.controller.getHealth(location),
				keypadHealth: securityHealth.keypad.getHealth(location),
				motionSensorHealth: securityHealth.motionSensor.getHealth(location)
			}
		}
	});
};



exports.movement = async function (req, res) {
	if (!req.query.id) {
		return res.status(400).json({
			status: types.RESPONSE_STATUS.ERROR,
			reason: 'ID parameter is missing'
		});
	}

	securityStatus.movementDetected(await securityHealth.controller.getLocationById(req.query.id));

	res.json({
		status: securityStatus.getStatus()
	});
};
