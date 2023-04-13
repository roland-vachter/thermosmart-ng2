
const securityStatus = require('../services/securityStatus');
const securityHealth = require('../services/securityHealth');
const websocket = require('../services/websocket');

const SecurityControllers = require('../models/SecurityControllers');


websocket.initWssConnection('/sensor/security');
SecurityControllers.find().lean().exec().then(controllers => {
	controllers.forEach(c => {
		websocket.initWssConnection(`/sensor/security/${c.controllerid}`);
	});
});

securityStatus.evts.on('status', data => {
	securityHealth.controller.getIdsByLocation(data.location).then(ids => {
		ids.forEach(id => {
			console.log('send sensor event to', id);
			websocket.broadcastMessage('/sensor/security/' + id, 'update', JSON.stringify({
				security: {
					status: data.status
				}
			}));
		});
	});
});

securityStatus.evts.on('alarm', data => {
	securityHealth.controller.getIdsByLocation(data.location).then(ids => {
		ids.forEach(id => {
			websocket.broadcastMessage('/sensor/security/' + id, 'update', JSON.stringify({
				security: {
					alarm: data.on
				}
			}));
		});
	});
});

securityHealth.evts.on('camera-movement', () => {
	securityHealth.controller.getIdsByLocation(data.location).then(ids => {
		ids.forEach(id => {
			websocket.broadcastMessage('/sensor/security/' + id, 'update', JSON.stringify({
				security: {
					cameraMovement: true
				}
			}));
		});
	});
});

securityHealth.evts.on('controller-added', controller => {
	websocket.initWssConnection(`/sensor/security/${controller.id}`);
});
