"use strict";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const heatingSensorHistorySchema = new Schema({
	sensor: {
		type: Number,
		ref: 'SensorSetting',
		index: true
	},
	datetime: {
		type: Date,
		index: true
	},
	t: Number,
	h: Number
});

heatingSensorHistorySchema.set('versionKey', false);

module.exports = mongoose.model('HeatingSensorHistory', heatingSensorHistorySchema);
