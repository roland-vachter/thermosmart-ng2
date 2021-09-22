const socket = require('../services/socketio');
const securityStatus = require('../services/securityStatus');
const securityHealth = require('../services/securityHealth');

const authorizedSockets = [];

function isSocketAuthorized (socket) {
	return authorizedSockets.indexOf(socket) !== -1;
}

exports.init = function () {
	const sensorIo = socket.io;

	sensorIo.on('connection', (socket) => {
		securityStatus.evts.on('status', data => {
			socket.emit('update', {
				security: {
					status: data
				}
			});
		});

		securityStatus.evts.on('alarm', data => {
			socket.emit('update', {
				security: {
					alarm: data
				}
			});
		});

		securityHealth.evts.on('camera-movement', () => {
			socket.emit('update', {
				security: {
					cameraMovement: true
				}
			})
		})
	});
};
