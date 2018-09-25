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
		status = result.status;
	});

exports.changeStatus = (id, newStatus) => {
	sensors[id] = newStatus;
	console.log(sensors);

	let intermStatus = true;

	Object.keys(sensors).forEach(id => {
		intermStatus = intermStatus && sensors[id];
	});

	status = intermStatus;

	console.log('new status', status);

	evts.emit('change', status);
	new PlantWateringStatusHistory({
		datetime: new Date(),
		status: status
	}).save();
};
