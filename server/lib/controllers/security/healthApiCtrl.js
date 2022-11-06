const securityHealth = require('../../services/securityHealth');
const types = require('../../utils/types');

exports.camera = {
	add: async (req, res) => {
		if (!req.body.ip) {
			return res.status(400).json({
				status: types.RESPONSE_STATUS.ERROR,
				reason: 'IP parameter is missing'
			});
		}

		if (!req.body.location) {
			return res.status(400).json({
				status: types.RESPONSE_STATUS.ERROR,
				reason: 'Location parameter is missing'
			});
		}

		const location = parseInt(req.body.location, 10);

		const exists = await securityHealth.camera.ipExists(req.body.ip, location);
		if (exists) {
			res.json({
				status: types.RESPONSE_STATUS.ERROR,
				reason: 'IP already exists'
			})
		} else {
			try {
				await securityHealth.camera.add(req.body.ip, location);
				res.json({
					status: types.RESPONSE_STATUS.OK
				});
			} catch (e) {
				res.json({
					status: types.RESPONSE_STATUS.ERROR,
					reason: e
				});
			}
		}
	},
	remove: async (req, res) => {
		if (!req.body.ip) {
			return res.status(400).json({
				status: types.RESPONSE_STATUS.ERROR,
				reason: 'IP parameter is missing'
			});
		}

		if (!req.body.location) {
			return res.status(400).json({
				status: types.RESPONSE_STATUS.ERROR,
				reason: 'Location parameter is missing'
			});
		}

		const location = parseInt(req.body.location, 10);

		try {
			await securityHealth.camera.remove(req.body.ip, location);
			res.json({
				status: types.RESPONSE_STATUS.OK
			});
		} catch (e) {
			res.json({
				status: types.RESPONSE_STATUS.ERROR,
				reason: e
			});
		}
	},
	list: async (req, res) => {
		if (!req.query.location) {
			return res.status(400).json({
				status: types.RESPONSE_STATUS.ERROR,
				reason: 'Location parameter is missing'
			});
		}

		const location = parseInt(req.query.location, 10);

		res.json(await securityHealth.camera.list(location));
	},
	listIps: async (req, res) => {
		if (!req.query.id) {
			return res.status(400).json({
				status: types.RESPONSE_STATUS.ERROR,
				reason: 'ID parameter is missing'
			});
		}

		res.json({
			ips: await securityHealth.camera.listIPs(await securityHealth.controller.getLocationById(req.query.id))
		});
	},
	reportHealth: (req, res) => {
		if (!req.query.ip || !req.query.health || !req.query.id) {
			return res.status(400).json({
				status: types.RESPONSE_STATUS.ERROR,
				reason: 'IP, health or ID parameter is missing'
			});
		}

		securityHealth.camera.reportHealth(req.query.id, req.query.ip, req.query.health === 'true' || req.query.health === true);

		res.json({
			status: types.RESPONSE_STATUS.OK
		});
	},
	reportMovement: async (req, res) => {
		if (!req.query.id) {
			return res.status(400).json({
				status: types.RESPONSE_STATUS.ERROR,
				reason: 'ID parameter is missing'
			});
		}

		securityHealth.camera.reportMovement(req.query.id, await securityHealth.controller.getLocationById(req.query.id));

		res.sendStatus(200);
	}
};



exports.controller = {
	add: async (req, res) => {
		if (!req.body.id) {
			return res.status(400).json({
				status: types.RESPONSE_STATUS.ERROR,
				reason: 'ID parameter is missing'
			});
		}

		if (!req.body.location) {
			return res.status(400).json({
				status: types.RESPONSE_STATUS.ERROR,
				reason: 'Location parameter is missing'
			});
		}

		const location = parseInt(req.body.location, 10);

		const exists = await securityHealth.controller.idExists(req.body.id);
		if (exists) {
			res.json({
				status: types.RESPONSE_STATUS.ERROR,
				reason: 'ID already exists'
			})
		} else {
			try {
				await securityHealth.controller.add(req.body.id, location);
				res.json({
					status: types.RESPONSE_STATUS.OK
				});
			} catch (e) {
				res.json({
					status: types.RESPONSE_STATUS.ERROR,
					reason: e
				});
			}
		}
	},
	remove: async (req, res) => {
		if (!req.body.id) {
			return res.status(400).json({
				status: types.RESPONSE_STATUS.ERROR,
				reason: 'ID parameter is missing'
			});
		}

		try {
			await securityHealth.controller.remove(req.body.id);
			res.json({
				status: types.RESPONSE_STATUS.OK
			});
		} catch (e) {
			res.json({
				status: types.RESPONSE_STATUS.ERROR,
				reason: e
			});
		}
	},
	list: async (req, res) => {
		if (!req.query.location) {
			return res.status(400).json({
				status: types.RESPONSE_STATUS.ERROR,
				reason: 'Location parameter is missing'
			});
		}

		const location = parseInt(req.query.location, 10);

		res.json(await securityHealth.controller.list(location));
	},
	reportHealth: (req, res) => {
		if (!req.query.id) {
			return res.status(400).json({
				status: types.RESPONSE_STATUS.ERROR,
				reason: 'ID parameter is missing'
			});
		}

		securityHealth.controller.reportHealth(req.query.id);

		res.json({
			status: types.RESPONSE_STATUS.OK
		});
	}
};

exports.keypad = {
	reportHealth: (req, res) => {
		if (!req.query.health || !req.query.id) {
			return res.status(400).json({
				status: types.RESPONSE_STATUS.ERROR,
				reason: 'ID or health parameter is missing'
			});
		}

		securityHealth.keypad.reportHealth(req.query.id, req.query.health === 'true' || req.query.health === true);

		res.json({
			status: types.RESPONSE_STATUS.OK
		});
	}
}

exports.motionSensor = {
	reportHealth: async (req, res) => {
		if (!req.query.health || !req.query.id) {
			return res.status(400).json({
				status: types.RESPONSE_STATUS.ERROR,
				reason: 'ID or health parameter is missing'
			});
		}

		console.log('belep');

		await securityHealth.motionSensor.reportHealth(req.query.id, req.query.health === 'true' || req.query.health === true);

		res.json({
			status: types.RESPONSE_STATUS.OK
		});
	}
};
