"use strict";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const heatingStatisticsSchema = new Schema({
	date: Date,
	avgTargetTemp: Number,
	avgOutsideTemp: Number,
	avgOutsideHumi: Number,
	runningMinutes: Number,
	location: {
		type: Number,
		ref: 'Location'
	}
});

heatingStatisticsSchema.index({date: 1, location: 1});
heatingStatisticsSchema.set('versionKey', false);

module.exports = mongoose.model('HeatingStatistics', heatingStatisticsSchema);
