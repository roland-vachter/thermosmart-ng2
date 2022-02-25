const plantWateringService = require('../services/plantWatering');
const configService = require('../services/config');

exports.plantWateringInit = async (req, res) => {
	res.json({
		status: 'ok',
		data: {
			plantWatering: {
				status: plantWateringService.getStatus()
			}
		}
	});
};

exports.plantWateringSensor = async (req, res) => {
	if (!req.query.id || !req.query.status) {
		return res.status(400).json({
			status: 'error',
			reason: 'id or status parameters missing'
		});
	}

	if (req.query.status === 'wet') {
		plantWateringService.changeStatus(req.query.id, true);
	} else if (req.query.status === 'dry') {
		plantWateringService.changeStatus(req.query.id, false);
	}

	res.json({
		status: 'ok'
	});
};


exports.log = async (req, res) => {
	if (!req.body.id || !req.body.log) {
		return res.status(400).json({
			status: 'error',
			reason: 'id or log parameter is missing'
		});
	}

	let level = 'LOG';
	if (req.body.level && ['LOG', 'WARN', 'ERROR'].includes(req.body.level)) {
		level = req.body.level;
	}

	let fn = console.log;
	switch(level) {
		case 'LOG':
			fn = console.log;
			break;
		case 'WARN':
			fn = console.warn;
			break;
		case 'ERROR':
			fn = console.error;
			break;
	}

	fn.call(this, `>>> ID=${req.body.id} || ${level} || ${req.body.log} |`);

	res.sendStatus(200);
}

exports.changeConfig = async (req, res) => {
	if (!req.body.name || !req.body.value) {
		return res.status(400).json({
			status: types.RESPONSE_STATUS.ERROR,
			reason: 'name or value parameter is missing'
		});
	}

	try {
		await configService.set(req.body.name, req.body.value);
		res.json({
			status: 'ok'
		});
	} catch(e) {
		res.json({
			status: 'error',
			error: e.message
		});
	}
};

exports.getConfig = async (req, res) => {
	if (!req.query.name) {
		return res.status(400).json({
			status: types.RESPONSE_STATUS.ERROR,
			reason: 'name parameter is missing'
		});
	}

	try {
		const configItem = await configService.get(req.query.name);
		res.json(configItem.value);
	} catch(e) {
		res.json({
			status: 'error',
			error: e.message
		});
	}
}
