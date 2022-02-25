"use strict";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EventEmitter = require('events');
const evts = new EventEmitter();

const heatingPlanOverridesSchema = new Schema({
	date: Number,
	plan: {
		type: String,
		ref: 'HeatingPlan'
	}
});

heatingPlanOverridesSchema.index({date: 1});
heatingPlanOverridesSchema.set('versionKey', false);

module.exports = mongoose.model('HeatingPlanOverrides', heatingPlanOverridesSchema);
