"use strict";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const securityArmingHistorySchema = new Schema({
	datetime: {
		type: Date,
		index: true
	},
	status: String
});

securityArmingHistorySchema.index({datetime: 1});
securityArmingHistorySchema.set('versionKey', false);

module.exports = mongoose.model('SecurityArmingHistory', securityArmingHistorySchema);