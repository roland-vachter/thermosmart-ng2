"use strict";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EventEmitter = require('events');
const evts = new EventEmitter();

const sensorSettingSchema = new Schema({
	_id: Number,
	order: Number,
	label: String,
	enabled: {
		type: Boolean,
		default: true
	},
	tempAdjust: Number,
	humidityAdjust: Number,
	location: {
		type: Number,
		ref: 'Location'
	},
	controller: {
		type: Boolean,
		default: false
	}
});

sensorSettingSchema.set('versionKey', false);

module.exports = mongoose.model('SensorSetting', sensorSettingSchema);

module.exports.evts = evts;
