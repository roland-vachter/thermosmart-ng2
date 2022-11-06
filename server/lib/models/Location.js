"use strict";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const location = new Schema({
	_id: Number,
	name: String,
	features: [String]
});

location.set('versionKey', false);

module.exports = mongoose.model('Location', location);
