import HeatingDefaultPlan, { IHeatingPlanWithLocationPopulated } from "../models/HeatingDefaultPlan";
import HeatingPlanOverrides from "../models/HeatingPlanOverrides";
import Location from "../models/Location";
import moment from "moment-timezone";
import EventEmitter from "events";
import TypedEventEmitter from "typed-emitter";
import { ITemperature } from "../models/Temperature";
import { IHeatingPlanPopulated } from "../models/HeatingPlan";

interface TargetTemp extends ITemperature {
	value: number;
}

interface TargetTempChangeEvent {
	targetTemp: TargetTemp;
	location: number;
}

type TargetTempEvents = {
	change: (t: TargetTempChangeEvent) => void;
}

type TargetTempByLocation = Record<number, TargetTemp>;

export const targetTempEvts = new EventEmitter() as TypedEventEmitter<TargetTempEvents>;

const lastTargetTempByLocation: TargetTempByLocation = {};

export const getTargetTempByLocation = (location: number) => {
	return lastTargetTempByLocation[location];
};

export async function updateTargetTemp () {
	const locations = await Location.find().exec();

	return Promise.all(locations.map(async l => {
		const [defaultPlan, planOverride] = await Promise.all([
			HeatingDefaultPlan.findOne({
				dayOfWeek: moment().tz(l.timezone).day(),
			})
				.populate<{ defaultPlan: IHeatingPlanPopulated }>({
					path: 'defaultPlan',
					populate: {
						path: 'intervals.temp'
					}
				})
				.populate<{ plans: IHeatingPlanWithLocationPopulated[] }>({
					path: 'plans.plan',
					populate: {
						path: 'intervals.temp'
					}
				})
				.lean()
				.exec(),
			HeatingPlanOverrides.findOne({
				date: moment().tz(l.timezone).startOf('day').valueOf(),
				location: l._id
			})
				.populate<{ plan: IHeatingPlanPopulated }>({
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
			plan: defaultPlan?.plans?.find(p => p.location === l._id)?.plan || defaultPlan?.defaultPlan
		};

		let targetTemp: TargetTemp = {} as TargetTemp;

		const now = moment().tz(l.timezone);
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

		if (lastTargetTempByLocation[l._id]?._id !== targetTemp?._id || lastTargetTempByLocation[l._id]?.value !== targetTemp?.value) {
			lastTargetTempByLocation[l._id] = targetTemp;
			targetTempEvts.emit('change', {
				targetTemp,
				location: l._id
			});
		}
	}));
};

void updateTargetTemp();
setInterval(updateTargetTemp, 10000);
