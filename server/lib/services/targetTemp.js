const HeatingDefaultPlan = require('../models/HeatingDefaultPlan');
const HeatingPlanOverrides = require('../models/HeatingPlanOverrides');
const moment = require('moment-timezone');

const EventEmitter = require('events');
const evts = new EventEmitter();

let lastTargetTemp = null;

exports.evts = evts;

exports.get = () => {
	return lastTargetTemp;
};

exports.update = () => {
	update();
}

async function update () {
	const [defaultPlan, planOverride] = await Promise.all([
		HeatingDefaultPlan.findOne({
			dayOfWeek: moment().tz("Europe/Bucharest").day()
		})
			.populate({
				path: 'plan',
				populate: {
					path: 'intervals.temp'
				}
			})
			.exec(),
		HeatingPlanOverrides.findOne({
			date: moment().tz("Europe/Bucharest").startOf('day').valueOf()
		})
			.populate({
				path: 'plan',
				populate: {
					path: 'intervals.temp'
				}
			})
			.exec()
	]);

	const todaysPlan = planOverride || defaultPlan;
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
};

update();
setInterval(update, 10000);
