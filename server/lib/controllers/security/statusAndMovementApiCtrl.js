const SecurityMovementHistory = require('../../models/SecurityMovementHistory');
const SecurityArmingHistory = require('../../models/SecurityArmingHistory');
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
	Promise.all([
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
	]).then(results => {
		const [movementHistory, lastArmed] = results;

		SecurityArmingHistory
			.count({
				status: 'alarm',
				datetime: {
					$gt: lastArmed.datetime
				}
			})
			.exec()
			.then(triggeredTimes => {
				res.json({
					status: 'ok',
					data: {
						security: {
							status: securityStatus.getStatus(),
							lastActivity: movementHistory.datetime,
							lastArmedAt: lastArmed.datetime,
							alarmTriggered: securityStatus.getStatus() === 'disarmed' ? 0 : triggeredTimes,
							cameraHealth: securityHealth.camera.getHealth(),
							controllerHealth: securityHealth.controller.getHealth(),
							keypadHealth: securityHealth.keypad.getHealth(),
							motionSensorHealth: securityHealth.motionSensor.getHealth()
						}
					}
				});
			});
	});
};



exports.movement = function (req, res) {
	securityStatus.movementDetected();

	res.json({
		status: securityStatus.getStatus()
	});
};
