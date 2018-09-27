"use strict";

const mongoose = require('mongoose');
const Float = require('mongoose-float').loadType(mongoose);
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
	tempAdjust: Float,
	humidityAdjust: Number
});

sensorSettingSchema.set('versionKey', false);

module.exports = mongoose.model('SensorSetting', sensorSettingSchema);

module.exports.evts = evts;
