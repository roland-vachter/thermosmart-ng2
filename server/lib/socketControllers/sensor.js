const socket = require('../services/socketio');
const security = require('../services/security');

const authorizedSockets = [];

function isSocketAuthorized (socket) {
	return authorizedSockets.indexOf(socket) !== -1;
}

exports.init = function () {
	const frontendIo = socket.io;

	frontendIo.on('connection', (socket) => {
		console.log('connected');

		security.evts.on('status', data => {
			//socket.forEach(io => {
				socket.emit('update', {
					security: {
						status: data
					}
				});
			//});
		});

		security.evts.on('alarm', data => {
			//socket.forEach(io => {
				socket.emit('update', {
					security: {
						alarm: data
					}
				});
			//});
		});
	});
};
