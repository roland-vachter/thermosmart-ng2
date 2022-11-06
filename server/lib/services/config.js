const Config = require('../models/Config');

const EventEmitter = require('events');
const evts = new EventEmitter();

const set = async (name, value, locationId) => {
	let config = await Config.findOne({
		name,
		location: locationId
	}).exec();
	if (!config) {
		config = new Config({
			name,
			location: locationId
		});
	}

	config.value = value;
	await config.save();

	const changeObj = {};
	changeObj[name] = value;
	evts.emit('change', {
		config: {
			[name]: value
		},
		location: locationId
	});
};

const getAll = async (locationId) => {
	const config = await Config.find().exec();
	const configObj = {};

	config.forEach(conf => {
		if (conf.location === locationId) {
			configObj[conf.name] = conf.value;
		}
	});

	return configObj || {};
};

const get = async (name, locationId) => {
	const configItem = await Config.findOne({
		name,
		location: locationId
	}).exec();

	return configItem || null;
};

exports.set = set;
exports.get = get;
exports.getAll = getAll;
exports.evts = evts;
