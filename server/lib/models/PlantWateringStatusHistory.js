"use strict";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const plantWateringStatusHistorySchema = new Schema({
	datetime: {
		type: Date,
		index: true
	},
	status: Boolean
});

plantWateringStatusHistorySchema.index({datetime: 1});
plantWateringStatusHistorySchema.set('versionKey', false);

module.exports = mongoose.model('PlantWateringStatusHistory', plantWateringStatusHistorySchema);
