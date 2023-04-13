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

const HeatingPlanOverrides = mongoose.model('HeatingPlanOverrides', heatingPlanOverridesSchema);

module.exports = HeatingPlanOverrides;
module.exports.evts = evts;
module.exports.triggerChange = function (location) {
	console.log('heating plan override change triggered');
	evts.emit('change', {
		location
	});
};

function cleanup () {
	HeatingPlanOverrides
		.deleteMany({
			date: {
				$lt: moment().tz("Europe/Bucharest").startOf('day').valueOf()
			}
		})
		.exec()
		.then(result => {
			console.log('Successfully cleaned up heating plan overrides, deleted count:', result.deletedCount);
		})
		.catch(e => {
			console.error('Failed to cleanup heating plan overrides with error:', e);
		});
}

cleanup();
setTimeout(() => {
	cleanup();
	setInterval(cleanup, 24 * 60 * 60 * 1000);
}, moment().tz('Europe/Bucharest').endOf('day').diff(moment()) + 60 * 1000);
