"use strict";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const config = new Schema({
	name: {
		type: String,
		index: true
	},
	value: Schema.Types.Mixed
});

config.set('versionKey', false);

module.exports = mongoose.model('Config', config);
