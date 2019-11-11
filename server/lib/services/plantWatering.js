const EventEmitter = require('events');
const evts = new EventEmitter();

const PlantWateringStatusHistory = require('../models/PlantWateringStatusHistory');

const STATUSES = {
	DRY: false,
	WET: true
};

let status = STATUSES.WET;
const sensors = {};

exports.evts = evts;

exports.getStatus = () => status;

PlantWateringStatusHistory
	.findOne()
	.sort({
		datetime: -1
	})
	.exec()
	.then((result) => {
		if (result) {
			status = result.status;
		}
	});

exports.changeStatus = (id, newStatus) => {
	sensors[id] = newStatus;

	let intermStatus = true;

	Object.keys(sensors).forEach(id => {
		intermStatus = intermStatus && sensors[id];
	});

	status = intermStatus;

	evts.emit('change', status);
	new PlantWateringStatusHistory({
		datetime: new Date(),
		status: status
	}).save();
};
