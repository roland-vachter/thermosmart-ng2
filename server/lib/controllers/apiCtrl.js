const plantWateringService = require('../services/plantWatering');
const configService = require('../services/config');
const UserModel = require('../models/User');
const types = require('../utils/types');

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
	if (!req.body.name || !req.body.value || !req.body.location) {
		return res.status(400).json({
			status: types.RESPONSE_STATUS.ERROR,
			reason: 'name, value or location parameter is missing'
		});
	}

	const location = parseInt(req.body.location, 10);

	try {
		await configService.set(req.body.name, req.body.value, location);
		res.json({
			status: 'ok'
		});
	} catch(e) {
		console.error(e);
		res.json({
			status: 'error',
			error: e.message
		});
	}
};

exports.getConfig = async (req, res) => {
	if (!req.query.name || !req.query.location) {
		return res.status(400).json({
			status: types.RESPONSE_STATUS.ERROR,
			reason: 'name or location parameter is missing'
		});
	}

	const location = parseInt(req.query.location, 10);

	try {
		const configItem = await configService.get(req.query.name, location);
		res.json(configItem.value);
	} catch(e) {
		console.error(e);
		res.json({
			status: 'error',
			error: e.message
		});
	}
}


async function getUserByEmail(user) {
	if (user?.emails?.length) {
		for (let email of user?.emails) {
			const dbUser = await UserModel.findOne({
				email: email.value
			}).populate({
				path: 'locations'
			}).exec();

			if (dbUser) {
				return dbUser;
			}
		}
	} else {
		return null;
	}
}

function getUserById(user) {
	return UserModel.findOne({
		id: user?.id
	}).populate({
		path: 'locations'
	}).exec();
}

exports.init = async (req, res) => {
	if (!req.user) {
		return res.json({
			status: 'error',
			error: 'No user found'
		})
	}

	try {
		const user = await getUserByEmail(req.user) ?? await getUserById(req.user);

		if (!user) {
			return res.json({
				status: 'error',
				error: 'No user found'
			})
		}

		res.json({
			status: 'ok',
			data: {
				user
			}
		});
	} catch(e) {
		console.error(e);
		res.json({
			status: 'error',
			error: e.message
		})
	}
}
