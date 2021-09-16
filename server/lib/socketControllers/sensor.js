const socket = require('../services/socketio');
const security = require('../services/security');

const authorizedSockets = [];

function isSocketAuthorized (socket) {
	return authorizedSockets.indexOf(socket) !== -1;
}

exports.init = function () {
	const sensorIo = socket.io;

	sensorIo.on('connection', (socket) => {
		security.evts.on('status', data => {
			socket.emit('update', {
				security: {
					status: data
				}
			});
		});

		security.evts.on('alarm', data => {
			socket.emit('update', {
				security: {
					alarm: data
				}
			});
		});
	});
};
