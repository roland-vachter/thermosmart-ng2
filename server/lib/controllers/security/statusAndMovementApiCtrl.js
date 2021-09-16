const SecurityMovementHistory = require('../../models/SecurityMovementHistory');
const SecurityArmingHistory = require('../../models/SecurityArmingHistory');
const security = require('../../services/security');

exports.toggleArm = (req, res) => {
	security.toggleArm();

	res.json({
		status: 'ok'
	});
};

exports.status = (req, res) => {
	res.json({
		status: 'ok',
		data: {
			security: {
				status: security.getStatus()
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
							status: security.getStatus(),
							lastActivity: movementHistory.datetime,
							lastArmedAt: lastArmed.datetime,
							alarmTriggered: security.getStatus() === 'disarmed' ? 0 : triggeredTimes,
							cameraHealth: security.getCameraHealth(),
							controllerHealth: security.getControllerHealth(),
							keypadHealth: security.getKeypadHealth(),
							motionSensorHealth: security.getMotionSensorHealth()
						}
					}
				});
			});
	});
};



exports.movement = function (req, res) {
	security.movementDetected();

	res.json({
		status: security.getStatus()
	});
};
