const security = require('../../services/security');
const types = require('../../utils/types');

exports.camera = {
	add: async (req, res) => {
		if (!req.body.ip) {
			return res.status(400).json({
				status: types.RESPONSE_STATUS.ERROR,
				reason: 'IP parameter is missing'
			});
		}

		const exists = await security.securityCameraIpExists(req.body.ip);
		if (exists) {
			res.json({
				status: types.RESPONSE_STATUS.ERROR,
				reason: 'IP already exists'
			})
		} else {
			try {
				await security.addSecurityCamera(req.body.ip);
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
			await security.removeSecurityCamera(req.body.ip);
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
	list: (req, res) => {
		res.json(security.getSecurityCameras());
	},
	listApis: (req, res) => {
		res.json(security.getSecurityCameraIps());
	},
	reportHealth: (req, res) => {
		if (!req.body.ip || !req.body.health) {
			return res.status(400).json({
				status: types.RESPONSE_STATUS.ERROR,
				reason: 'IP or health parameter is missing'
			});
		}

		security.reportCameraHealth(req.body.ip, req.body.health === 'true' || req.body.health === true);

		res.json({
			status: types.RESPONSE_STATUS.OK
		});
	},
	reportMovement: () => {

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

		const exists = await security.securityControllerIdExists(req.body.id);
		if (exists) {
			res.json({
				status: types.RESPONSE_STATUS.ERROR,
				reason: 'ID already exists'
			})
		} else {
			try {
				await security.addSecurityController(req.body.id);
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
			await security.removeSecurityController(req.body.id);
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
	list: (req, res) => {
		res.json(security.getSecurityControllers());
	},
	reportHealth: (req, res) => {
		if (!req.body.id) {
			return res.status(400).json({
				status: types.RESPONSE_STATUS.ERROR,
				reason: 'ID parameter is missing'
			});
		}

		security.reportControllerHealth(req.body.id);

		res.json({
			status: types.RESPONSE_STATUS.OK
		});
	}
};

exports.keypad = {
	reportHealth: (req, res) => {
		if (!req.body.health) {
			return res.status(400).json({
				status: types.RESPONSE_STATUS.ERROR,
				reason: 'health parameter is missing'
			});
		}

		security.reportKeypadHealth(req.body.health === 'true' || req.body.health === true);

		res.json({
			status: types.RESPONSE_STATUS.OK
		});
	}
}

exports.motionSensor = {
	reportHealth: (req, res) => {
		if (!req.body.health) {
			return res.status(400).json({
				status: types.RESPONSE_STATUS.ERROR,
				reason: 'health parameter is missing'
			});
		}

		security.reportMotionSensorHealth(req.body.health === 'true' || req.body.health === true);

		res.json({
			status: types.RESPONSE_STATUS.OK
		});
	}
};
