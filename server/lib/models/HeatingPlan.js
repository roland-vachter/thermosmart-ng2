"use strict";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const heatingPlanSchema = new Schema({
	_id: Number,
	displayOrder: {
		type: Number,
		index: true
	},
	name: {
		type: String,
		index: true
	},
	intervals: [{
		startHour: Number,
		startMinute: Number,
		temp: {
			type: Number,
			ref: 'Temperature'
		}
	}],
	iconClass: String
});

heatingPlanSchema.index({name: 1});
heatingPlanSchema.index({displayOrder: 1});
heatingPlanSchema.set('versionKey', false);

module.exports = mongoose.model('HeatingPlan', heatingPlanSchema);
