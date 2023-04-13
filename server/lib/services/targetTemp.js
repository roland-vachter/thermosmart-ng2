const HeatingDefaultPlan = require('../models/HeatingDefaultPlan');
const HeatingPlanOverrides = require('../models/HeatingPlanOverrides');
const Location = require('../models/Location');
const moment = require('moment-timezone');

const EventEmitter = require('events');
const evts = new EventEmitter();

let lastTargetTempByLocation = {};

exports.evts = evts;

exports.get = (location) => {
	return lastTargetTempByLocation[location];
};

exports.update = () => {
	update();
}

async function update () {
	const locations = await Location.find().exec();

	return Promise.all(locations.map(async l => {
		const [defaultPlan, planOverride] = await Promise.all([
			HeatingDefaultPlan.findOne({
				dayOfWeek: moment().tz("Europe/Bucharest").day(),
			})
				.populate({
					path: 'defaultPlan',
					populate: {
						path: 'intervals.temp'
					}
				})
				.populate({
					path: 'plans.plan',
					populate: {
						path: 'intervals.temp'
					}
				})
				.lean()
				.exec(),
			HeatingPlanOverrides.findOne({
				date: moment().tz("Europe/Bucharest").startOf('day').valueOf(),
				location: l._id
			})
				.populate({
					path: 'plan',
					populate: {
						path: 'intervals.temp'
					}
				})
				.lean()
				.exec()
		]);

		const todaysPlan = planOverride || {
			...defaultPlan,
			plan: defaultPlan.plans?.find(p => p.location === l._id)?.plan || defaultPlan.defaultPlan
		};

		let targetTemp;

		const now = moment().tz("Europe/Bucharest");
		const nowHours = now.hours();
		const nowMinutes = now.minutes();

		todaysPlan?.plan?.intervals.forEach(interval => {
			if (nowHours > interval.startHour ||
					(nowHours === interval.startHour &&
					nowMinutes >= interval.startMinute)) {
				targetTemp = {
					...interval.temp,
					value: interval.temp.values?.find(v => v.location === l._id)?.value || interval.temp.defaultValue
				};
			}
		});

		if (lastTargetTempByLocation[l._id]?._id !== targetTemp?._id) {
			lastTargetTempByLocation[l._id] = targetTemp;
			evts.emit('change', {
				targetTemp,
				location: l._id
			});
		}
	}));
};

update();
setInterval(update, 10000);
