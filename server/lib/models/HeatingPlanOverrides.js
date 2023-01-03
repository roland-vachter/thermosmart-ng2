"use strict";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EventEmitter = require('events');
const evts = new EventEmitter();
const moment = require('moment-timezone');

const heatingPlanOverridesSchema = new Schema({
	date: Number,
	plan: {
		type: Number,
		ref: 'HeatingPlan'
	},
	location: {
		type: Number,
		ref: 'Location'
	}
});

heatingPlanOverridesSchema.index({date: 1});
heatingPlanOverridesSchema.set('versionKey', false);

module.exports = mongoose.model('HeatingPlanOverrides', heatingPlanOverridesSchema);

module.exports.evts = evts;
module.exports.triggerChange = function (location) {
	console.log('heating plan override change triggered');
	evts.emit('change', {
		location
	});
};


function cleanup () {

}

cleanup();
setTimeout(() => {
	cleanup();
	setInterval(saveStatisticsForADay, 24 * 60 * 60 * 1000);
}, moment().tz('Europe/Bucharest').endOf('day').diff(moment()) + 60 * 1000);
