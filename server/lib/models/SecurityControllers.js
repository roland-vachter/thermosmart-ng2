"use strict";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EventEmitter = require('events');
const evts = new EventEmitter();

const securityControllersSchema = new Schema({
	controllerid: String
});

securityControllersSchema.set('versionKey', false);
securityControllersSchema.index({controllerid: 1});

module.exports = mongoose.model('SecurityControllers', securityControllersSchema);

module.exports.evts = evts;
