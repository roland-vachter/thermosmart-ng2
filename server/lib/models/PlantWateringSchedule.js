"use strict";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const plantWateringScheduleSchema = new Schema({
	minutesUntilDry: Number,
	zone: Number,
	label: String
});

plantWateringScheduleSchema.index({zone: 1});
plantWateringScheduleSchema.set('versionKey', false);

module.exports = mongoose.model('PlantWateringSchedule', plantWateringScheduleSchema);
