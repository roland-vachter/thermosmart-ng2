"use strict";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EventEmitter = require('events');
const evts = new EventEmitter();

const securityCamerasSchema = new Schema({
	ip: String
});

securityCamerasSchema.set('versionKey', false);
securityCamerasSchema.index({ip: 1});

module.exports = mongoose.model('SecurityCameras', securityCamerasSchema);

module.exports.evts = evts;
