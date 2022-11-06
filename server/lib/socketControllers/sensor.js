const socket = require('../services/socketio');
const securityStatus = require('../services/securityStatus');
const securityHealth = require('../services/securityHealth');

const authorizedSockets = [];

function isSocketAuthorized (socket) {
	return authorizedSockets.indexOf(socket) !== -1;
}

exports.init = function () {
	const io = socket.io.of('/sensor');

	securityStatus.evts.on('status', data => {
		securityHealth.controller.getIdsByLocation(data.location).then(ids => {
			ids.forEach(id => {
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
};
