"use strict";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
	emails: {
		type: [String],
		index: true
	},
	username: {
		type: String,
		index: true
	},
	password: String,
	locations: [{
		type: Number,
		ref: 'Location'
	}],
	permissions: [String]
});

userSchema.set('versionKey', false);

module.exports = mongoose.model('User', userSchema);
