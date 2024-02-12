import SecurityControllers from '../models/SecurityControllers';
import { securityController, securityHealthEvents } from '../services/securityHealth';
import { securityStatusEvents } from '../services/securityStatus';
import * as websocket from '../services/websocket';


export const init = async () => {
	websocket.initWssConnection('/sensor/security');
	const controllers = await SecurityControllers.find().exec();

	controllers.forEach(c => {
		websocket.initWssConnection(`/sensor/security/${c.controllerid}`);
	});

	securityStatusEvents.on('status', async data => {
		const ids = await securityController.getIdsByLocation(data.location);

		ids.forEach(id => {
			websocket.broadcastMessage('/sensor/security/' + id, 'update', JSON.stringify({
				security: {
					status: data.status
				}
			}));
		});
	});

	securityStatusEvents.on('alarm', async data => {
		const ids = await securityController.getIdsByLocation(data.location);

		ids.forEach(id => {
			websocket.broadcastMessage('/sensor/security/' + id, 'update', JSON.stringify({
				security: {
					alarm: data.on
				}
			}));
		});
	});

	securityHealthEvents.on('camera-movement', async data => {
		const ids = await securityController.getIdsByLocation(data.location);

		ids.forEach(id => {
			websocket.broadcastMessage('/sensor/security/' + id, 'update', JSON.stringify({
				security: {
					cameraMovement: true
				}
			}));
		});
	});

	securityHealthEvents.on('controller-added', controller => {
		websocket.initWssConnection(`/sensor/security/${controller.id}`);
	});
}
