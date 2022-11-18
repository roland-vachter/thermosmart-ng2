const socket = require('../services/socketio');
const securityStatus = require('../services/securityStatus');
const securityHealth = require('../services/securityHealth');

const SecurityControllers = require('../models/SecurityControllers');

const authorizedSockets = [];

function isSocketAuthorized (socket) {
	return authorizedSockets.indexOf(socket) !== -1;
}

let initialized = false;

exports.init = function () {
	if (!initialized) {
		initialized = true;

		const io = socket.io.of('/sensor');
		SecurityControllers.find().exec().then(controllers => {
			controllers.forEach(c => {
				socket.io.of(`/sensor/${c.controllerid}`)
			});
		});

		securityStatus.evts.on('status', data => {
			securityHealth.controller.getIdsByLocation(data.location).then(ids => {
				ids.forEach(id => {
					console.log('send sensor event to', id);
					socket.io.of('/sensor/' + id).emit('update', {
						security: {
							status: data.status
						}
					});
				});
			});
		});

		securityStatus.evts.on('alarm', data => {
			securityHealth.controller.getIdsByLocation(data.location).then(ids => {
				ids.forEach(id => {
					socket.io.of('/sensor/' + id).emit('update', {
						security: {
							alarm: data.on
						}
					});
				});
			});
		});

		securityHealth.evts.on('camera-movement', () => {
			securityHealth.controller.getIdsByLocation(data.location).then(ids => {
				ids.forEach(id => {
					socket.io.of('/sensor/' + id).emit('update', {
						security: {
							cameraMovement: true
						}
					});
				});
			});
		});
	}
};

securityHealth.evts.on('controller-added', controller => {
	socket.io.of(`/sensor/${controller.id}`);
});
