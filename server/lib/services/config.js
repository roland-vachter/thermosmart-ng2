const Config = require('../models/Config');

let configInst;

const EventEmitter = require('events');
const evts = new EventEmitter();

const set = async (name, value) => {
	let config = await Config.findOne({
		name
	});
	if (!config) {
		config = new Config({
			name
		});
	}

	config.value = value;
	await config.save();

	const changeObj = {};
	changeObj[name] = value;
	evts.emit('change', changeObj);
};

const getAll = async () => {
	const config = await Config.find();
	const configObj = {};

	config.forEach(conf => {
		configObj[conf.name] = conf.value;
	});

	return configObj || {};
};

const get = async (name) => {
	const configItem = await Config.findOne({
		name
	});

	return configItem || null;
};

exports.set = set;
exports.get = get;
exports.getAll = getAll;
exports.evts = evts;
