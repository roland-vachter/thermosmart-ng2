import Config from '../models/Config';
import EventEmitter from 'events';
import TypedEventEmitter from 'typed-emitter';

type Config = Record<string, number | string | undefined>;

interface ConfigChangeEvent {
	config: Config;
	location: number;
}

type ConfigEvents = {
	change: (c: ConfigChangeEvent) => void;
}

export const configEvts = new EventEmitter() as TypedEventEmitter<ConfigEvents>;

export const setConfig = async (name: string, value: number | string, locationId: number) => {
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

	configEvts.emit('change', {
		config: {
			[name]: value
		},
		location: locationId
	});
};

export const getAllConfigs = async (locationId: number) => {
	const config = await Config.find().exec();
	const configObj: Config = {};

	config.forEach(conf => {
		if (conf.location === locationId) {
			configObj[conf.name] = conf.value;
		}
	});

	return configObj || {};
};

export const getConfig = async (name: string, locationId: number) => {
	const configItem = await Config.findOne({
		name,
		location: locationId
	}).exec();

	return configItem || null;
};
