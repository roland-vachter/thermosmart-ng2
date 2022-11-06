"use strict";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EventEmitter = require('events');
const evts = new EventEmitter();

const heatingPlanSchema = new Schema({
	_id: Number,
	dayOfWeek: Number,
	defaultPlan: {
		type: Number,
		ref: 'HeatingPlan'
	},
	plans: [{
		plan: {
			type: Number,
			ref: 'HeatingPlan'
		},
		location: {
			type: Number,
			ref: 'Location'
		}
	}]
}, {
	usePushEach: true
});

heatingPlanSchema.index({dayOfWeek: 1});
heatingPlanSchema.set('versionKey', false);

module.exports = mongoose.model('HeatingDefaultPlan', heatingPlanSchema);

module.exports.evts = evts;
module.exports.triggerChange = function (defaultPlan, location) {
	console.log('heating default plan change triggered', defaultPlan, 'for location', location);
	evts.emit('change', {
		defaultPlan,
		location
	});
};
