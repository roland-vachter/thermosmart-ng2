"use strict";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const securityMovementHistorySchema = new Schema({
	datetime: {
		type: Date,
		index: true
	},
	location: {
		type: Number,
		ref: 'Location'
	}
});

securityMovementHistorySchema.index({datetime: 1});
securityMovementHistorySchema.set('versionKey', false);

module.exports = mongoose.model('SecurityMovementHistory', securityMovementHistorySchema);
