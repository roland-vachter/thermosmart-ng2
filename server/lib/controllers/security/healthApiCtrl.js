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

		const exists = await securityHealth.camera.ipExists(req.body.ip);
		if (exists) {
			res.json({
				status: types.RESPONSE_STATUS.ERROR,
				reason: 'IP already exists'
			})
		} else {
			try {
				await securityHealth.camera.add(req.body.ip);
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

		try {
			await securityHealth.camera.remove(req.body.ip);
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
		res.json(await securityHealth.camera.list());
	},
	listApis: async (req, res) => {
		res.json({
			ips: await securityHealth.camera.listIPs()
		});
	},
	reportHealth: (req, res) => {
		if (!req.query.ip || !req.query.health) {
			return res.status(400).json({
				status: types.RESPONSE_STATUS.ERROR,
				reason: 'IP or health parameter is missing'
			});
		}

		securityHealth.camera.reportHealth(req.query.ip, req.query.health === 'true' || req.query.health === true);

		res.json({
			status: types.RESPONSE_STATUS.OK
		});
	},
	reportMovement: (req, res) => {
		securityHealth.camera.reportMovement();

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

		const exists = await securityHealth.controller.idExists(req.body.id);
		if (exists) {
			res.json({
				status: types.RESPONSE_STATUS.ERROR,
				reason: 'ID already exists'
			})
		} else {
			try {
				await securityHealth.controller.add(req.body.id);
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
		res.json(await securityHealth.controller.list());
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
		if (!req.query.health) {
			return res.status(400).json({
				status: types.RESPONSE_STATUS.ERROR,
				reason: 'health parameter is missing'
			});
		}

		securityHealth.keypad.reportHealth(req.query.health === 'true' || req.query.health === true);

		res.json({
			status: types.RESPONSE_STATUS.OK
		});
	}
}

exports.motionSensor = {
	reportHealth: (req, res) => {
		if (!req.query.health || !req.query.id) {
			return res.status(400).json({
				status: types.RESPONSE_STATUS.ERROR,
				reason: 'ID or health parameter is missing'
			});
		}

		securityHealth.motionSensor.reportHealth(req.query.id, req.query.health === 'true' || req.query.health === true);

		res.json({
			status: types.RESPONSE_STATUS.OK
		});
	}
};
