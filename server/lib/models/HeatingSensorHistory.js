"use strict";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment-timezone');

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

const HeatingSensorHistory = mongoose.model('HeatingSensorHistory', heatingSensorHistorySchema);
module.exports = HeatingSensorHistory;

function cleanup () {
	HeatingSensorHistory
		.deleteMany({
			datetime: {
				$lt: moment().subtract(1, 'week').tz("Europe/Bucharest").startOf('day').toDate()
			}
		})
		.lean()
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
