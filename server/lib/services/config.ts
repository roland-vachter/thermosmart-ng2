import Config from '../models/Config';
import EventEmitter from 'events';
import TypedEventEmitter from 'typed-emitter';
import Cryptr from 'cryptr';

const cryptr = new Cryptr(process.env.CRYPTO_SECRET);

type Config = Record<string, number | string | undefined>;

interface ConfigOptions {
	encrypted?: boolean;
	private?: boolean;
}

interface ConfigChangeEvent {
	config: Config;
	location: number;
}

type ConfigEvents = {
	change: (c: ConfigChangeEvent) => void;
}

export const configEvts = new EventEmitter() as TypedEventEmitter<ConfigEvents>;

export const setConfig = async (name: string, value: number | string, locationId: number, options?: ConfigOptions) => {
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

	if (options?.encrypted) {
		config.encrypted = true;
	}

	if (options?.private) {
		config.private = true;
	}

	await config.save();

	if (!options?.private) {
		configEvts.emit('change', {
			config: {
				[name]: value
			},
			location: locationId
		});
	}
};

export const getAllConfigs = async (locationId: number, withPrivate = false) => {
	const config = await Config.find().exec();
	const configObj: Config = {};

	config.forEach(conf => {
		if (conf.location === locationId) {
			configObj[conf.name] = (withPrivate || !conf.private) ? conf.value : 'PRIVATE';
		}
	});

	return configObj || {};
};

export const getConfig = async (name: string, locationId: number) => {
	const configItem = await Config.findOne({
		name,
		location: locationId
	}).exec();

	if (configItem?.encrypted) {
		configItem.value = cryptr.decrypt(configItem.value as string);
	}

	return configItem || null;
};
