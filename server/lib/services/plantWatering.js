const EventEmitter = require('events');
const PlantWateringSchedule = require('../models/PlantWateringSchedule');
const evts = new EventEmitter();

const PlantWateringStatusHistory = require('../models/PlantWateringStatusHistory');

const STATUS = {
	DRY: false,
	WET: true
};
exports.STATUS = STATUS;
const MINUTES_UNTIL_DRY = 6;

const zones = [1, 2];

let status = {};
let initialPromise = Promise.all(zones.map(async z => {
	const [schedule, lastHistoryItem] = await Promise.all([
		PlantWateringSchedule
			.findOne({
				zone: z
			})
			.lean()
			.exec(),
		PlantWateringStatusHistory
			.findOne({
				zone: z
			})
			.sort({
				datetime: -1
			})
			.lean()
			.exec()
	]);

	if (lastHistoryItem) {
		status[z] = lastHistoryItem.status;
	} else {
		status[z] = STATUS.WET;
	}

	if (schedule) {
		status[z].minutesUntilDry = schedule.minutesUntilDry;
		status[z].label = schedule.label;
	} else {
		new PlantWateringSchedule({
			zone: z,
			label: z,
			minutesUntilDry: MINUTES_UNTIL_DRY
		}).save();
		status[z].minutesUntilDry = MINUTES_UNTIL_DRY;
		status[z].label = z;
	}
})).then(() => {
	initialPromise = null;
	setInterval(() => {
		Object.keys(status).forEach(z => {
			status[z].minutesUntilDry -= 1;
			if (status[z].minutesUntilDry <= 0) {
				status[z].minutesUntilDry = 0;
				status[z].status = STATUS.DRY;

				new PlantWateringStatusHistory({
					zone: z,
					datetime: new Date(),
					status: STATUS.DRY
				}).save();

				PlantWateringSchedule
					.findOneAndUpdate({
						zone: z
					}, {
						minutesUntilDry: 0
					});

				evts.emit('update', status[z]);
			}
		});
	}, 60 * 1000);
});

exports.evts = evts;

exports.getStatus = async () => initialPromise ? initialPromise.then(() => status) : status;

exports.markAsWet = (z) => {
	new PlantWateringStatusHistory({
		zone: z,
		datetime: new Date(),
		status: STATUS.WET
	}).save();

	PlantWateringSchedule
		.findOneAndUpdate({
			zone: z
		}, {
			minutesUntilDry: MINUTES_UNTIL_DRY
		});

	evts.emit('update', status[z]);
};
