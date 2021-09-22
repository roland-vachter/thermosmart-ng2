const securityStatus = require('../../services/securityStatus');
const securityHealth = require('../../services/securityHealth');

exports.toggleArm = (req, res) => {
	securityStatus.toggleArm();

	res.json({
		status: 'ok'
	});
};

exports.status = (req, res) => {
	res.json({
		status: 'ok',
		data: {
			security: {
				status: securityStatus.getStatus()
			}
		}
	});
};

exports.init = (req, res) => {
	res.json({
		status: 'ok',
		data: {
			security: {
				status: securityStatus.getStatus(),
				lastActivity: securityStatus.getLastMovementDate().getTime(),
				lastArmedAt: securityStatus.getLastArmedDate().getTime(),
				alarmTriggeredCount: securityStatus.getAlarmTriggeredCount(),
				cameraHealth: securityHealth.camera.getHealth(),
				controllerHealth: securityHealth.controller.getHealth(),
				keypadHealth: securityHealth.keypad.getHealth(),
				motionSensorHealth: securityHealth.motionSensor.getHealth()
			}
		}
	});
};



exports.movement = function (req, res) {
	securityStatus.movementDetected();

	res.json({
		status: securityStatus.getStatus()
	});
};
