"use strict";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
	emails: {
		type: [String],
		index: true
	},
	facebookid: {
		type: String,
		index: true
	},
	locations: [{
		type: Number,
		ref: 'Location'
	}],
	permissions: [String]
});

userSchema.set('versionKey', false);

module.exports = mongoose.model('User', userSchema);
