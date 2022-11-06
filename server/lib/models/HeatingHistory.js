"use strict";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const heatingHistorySchema = new Schema({
	datetime: {
		type: Date,
		index: true
	},
	status: Boolean,
	location: {
		type: Number,
		ref: 'Location'
	}
});

heatingHistorySchema.index({datetime: 1});
heatingHistorySchema.set('versionKey', false);

module.exports = mongoose.model('HeatingHistory', heatingHistorySchema);
