const HeatingDefaultPlan = require('../models/HeatingDefaultPlan');
const moment = require('moment-timezone');

const EventEmitter = require('events');
const evts = new EventEmitter();

let lastTargetTemp = null;

exports.evts = evts;

exports.get = () => {
	return lastTargetTemp;
};

function update () {
	return HeatingDefaultPlan.findOne({
			dayOfWeek: moment().tz("Europe/Bucharest").day()
		})
		.populate({
			path: 'plan',
			populate: {
				path: 'intervals.temp'
			}
		})
		.exec()
		.then(todaysPlan => {
			let targetTemp;

			const now = moment().tz("Europe/Bucharest");
			const nowHours = now.hours();
			const nowMinutes = now.minutes();

			todaysPlan.plan.intervals.forEach(interval => {
				if (nowHours > interval.startHour ||
						(nowHours === interval.startHour &&
						nowMinutes >= interval.startMinute)) {
					targetTemp = interval.temp;
				}
			});

			if (lastTargetTemp !== targetTemp) {
				lastTargetTemp = targetTemp;
				evts.emit('change', targetTemp);
			}
		});
};

update();
setInterval(update, 10000);
