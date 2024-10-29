import Location, { ILocation } from '../models/Location';
import OutsideConditionHistory, { IOutsideConditionHistory } from '../models/OutsideConditionHistory';
import { outsideConditionsEvts } from './outsideConditions';
import heatingEvts from './heatingEvts';
import HeatingHistory, { IHeatingHistory } from '../models/HeatingHistory';
import TargetTempHistory, { ITargetTempHistory } from '../models/TargetTempHistory';
import HeatingStatistics, { IHeatingStatistics } from '../models/HeatingStatistics';
import { getTargetTempByLocation } from './targetTemp';
import moment, { Moment } from 'moment-timezone';
import { HydratedDocument } from 'mongoose';
import { toSameDateInUTC } from './timezoneConversion';
import HeatingHoldConditionHistory, { HeatingHoldConditionTypes } from '../models/HeatingHoldConditionHistory';


interface Total {
	date: Moment;
	daysRunningMinutes: number;
	runningMinutesTotal: number;
	daysTargetTemp: number;
	targetTempTotal: number;
	daysOutsideCondition: number;
	outsideTempTotal: number;
	outsideHumiTotal: number;
	sunshineMinutesTotal: number;
}

interface Average {
	date: string;
	totalRunningMinutes: number;
	avgRunningMinutes: number;
	avgTargetTemp: number;
	avgOutsideTemp: number;
	avgOutsideHumi: number;
	avgSunshineMinutes: number;
}


async function monitorTargetTemps () {
	const locations = await Location.find().exec()
	locations.forEach(l => monitorTargetTempByLocation(l._id));
}

async function monitorTargetTempByLocation (location: number) {
	const target = getTargetTempByLocation(location);
	if (target) {
		const result = await TargetTempHistory
			.findOne({
				location
			})
			.sort({
				datetime: -1
			})
			.exec();

		if (!result || result.t !== target.value) {
			await new TargetTempHistory({
				datetime: moment().toDate(),
				location,
				t: target.value
			}).save();
		}
	}
}

async function calculateHeatingDuration(location: HydratedDocument<ILocation>, date?: Date) {
	if (!date) {
		date = moment().toDate();
	}

	const [lastHistory, history] = await Promise.all([
		HeatingHistory
			.findOne({
				datetime: {
					$lt: moment(date).tz(location.timezone).startOf('day')
				},
				location: location._id
			})
			.sort({
				datetime: -1
			})
			.exec(),
		HeatingHistory
			.find({
				datetime: {
					$gt: moment(date).tz(location.timezone).startOf('day'),
					$lt: moment(date).tz(location.timezone).endOf('day')
				},
				location: location._id
			})
			.sort({
				datetime: 1
			})
			.exec()
	])

	if (!history?.length && !lastHistory?.status) {
		return 0;
	}

	history.unshift({
		datetime: moment(date).tz(location.timezone).startOf('day').toDate(),
		status: lastHistory ? lastHistory.status : false,
		location: location._id
	} as HydratedDocument<IHeatingHistory>);

	history.push({
		datetime: new Date(
			Math.min(
				moment().tz(location.timezone).valueOf(),
				moment(date).tz(location.timezone).endOf('day').valueOf()
			)
		),
		status: false,
		location: location._id
	} as HydratedDocument<IHeatingHistory>);

	let heatingDuration = 0; // minutes
	let lastEntry: HydratedDocument<IHeatingHistory>;

	history.forEach(entry => {
		if (lastEntry) {
			if (lastEntry.status === true && entry.status === false) {
				heatingDuration += (moment(entry.datetime).tz(location.timezone).valueOf() - moment(lastEntry.datetime).tz(location.timezone).valueOf()) / 60000;
			}

			if (lastEntry.status !== entry.status) {
				lastEntry = entry;
			}
		} else {
			lastEntry = entry;
		}
	});

	return Math.round(heatingDuration);
}

async function calculateAvgTargetTemp (location: HydratedDocument<ILocation>, date?: Date) {
	if (!date) {
		date = moment().toDate();
	}

	const [initial, rest] = await Promise.all([
		TargetTempHistory
			.findOne({
				datetime: {
					$lt: moment(date).tz(location.timezone).startOf('day').toDate()
				},
				location: location._id
			})
			.sort({
				datetime: -1
			})
			.exec(),
		TargetTempHistory
			.find({
				datetime: {
					$gt: moment(date).tz(location.timezone).startOf('day').toDate(),
					$lt: moment(date).tz(location.timezone).endOf('day').toDate()
				},
				location: location._id
			})
			.sort({
				datetime: 1
			})
			.exec()
	]);

	let results;
	if (initial) {
		initial.datetime = moment(date).tz(location.timezone).startOf('day').toDate();
		results = [initial, ...rest];
	} else {
		results = rest;
	}

	if (!results || !results.length) {
		console.log('no target temp history found');
		return null;
	}

	let measuredTimeTotal = 0; // minutes
	let measuredValueTotal = 0;
	let lastEntry: HydratedDocument<ITargetTempHistory>;
	let duration;

	results.forEach(entry => {
		if (lastEntry) {
			duration = (entry.datetime.getTime() - lastEntry.datetime.getTime()) / 60000;

			measuredTimeTotal += duration;
			measuredValueTotal += lastEntry.t * duration;
		}

		lastEntry = entry;
	});

	duration = (moment(date).tz(location.timezone).endOf('day').valueOf() - moment(lastEntry.datetime).tz(location.timezone).valueOf()) / 60000;
	measuredTimeTotal += duration;
	measuredValueTotal += lastEntry.t * duration;

	return measuredValueTotal / measuredTimeTotal;
}

async function calculateAvgOutsideCondition(location: HydratedDocument<ILocation>, date?: Date) {
	if (!date) {
		date = moment().toDate();
	}

	const [initial, rest] = await Promise.all([
		OutsideConditionHistory
			.findOne({
				datetime: {
					$lt: moment(date).tz(location.timezone).startOf('day').toDate()
				}
			})
			.sort({
				datetime: -1
			})
			.exec(),
		OutsideConditionHistory
			.find({
				datetime: {
					$gt: moment(date).tz(location.timezone).startOf('day').toDate(),
					$lt: moment(date).tz(location.timezone).endOf('day').toDate()
				}
			})
			.sort({
				datetime: 1
			})
			.exec()
	]);

	let results = [];
	if (initial) {
		initial.datetime = moment(date).tz(location.timezone).startOf('day').toDate();
		results = [initial, ...rest];
	} else {
		results = rest;
	}

	if (!results || !results.length) {
		return {
			t: null,
			h: null,
			sunshineMinutes: null
		};
	}

	let measuredTimeTotal = 0; // minutes
	let measuredTempTotal = 0;
	let measuredHumidityTotal = 0;
	let sunshineMinutes = 0;
	let lastEntry: HydratedDocument<IOutsideConditionHistory>;
	let duration: number;

	results.forEach(entry => {
		if (lastEntry) {
			duration = (entry.datetime.getTime() - lastEntry.datetime.getTime()) / 60000;

			measuredTimeTotal += duration;
			measuredTempTotal += lastEntry.t * duration;
			measuredHumidityTotal += lastEntry.h * duration;
			sunshineMinutes += lastEntry.sunny ? duration : 0;
		}

		lastEntry = entry;
	});

	duration = (moment(date).tz(location.timezone).endOf('day').valueOf() - moment(lastEntry.datetime).tz(location.timezone).valueOf()) / 60000;
	measuredTimeTotal += duration;
	measuredTempTotal += lastEntry.t * duration;
	measuredHumidityTotal += lastEntry.h * duration;

	return {
		t: measuredTempTotal / measuredTimeTotal,
		h: measuredHumidityTotal / measuredTimeTotal,
		sunshineMinutes
	};
}


const saveStatisticsForADay = async () => {
	console.log('statistics save started');

	try {
		const locations = await Location.find().exec();
		await Promise.all(locations.map(l => saveStatisticsForADayByLocation(l._id)));

		const lastHeatingStatistic = await HeatingStatistics
			.findOne()
			.sort({
				date: -1
			})
			.exec();

		if (lastHeatingStatistic && lastHeatingStatistic.date) {
			await OutsideConditionHistory
				.deleteMany({
					datetime: {
						$lt: moment(lastHeatingStatistic.date).subtract(2, 'month').toDate()
					}
				})
				.exec()
				.then(result => {
					console.log('Successfully cleaned up outside condition history, deleted count:', result.deletedCount);
				})
				.catch(e => {
					console.error('Failed to cleanup outside condition history with error:', e);
				});
		}

		console.log('statistics save complete');
	} catch (e) {
		console.error('statistics save failed with error', e);
	}
};

const saveStatisticsForADayByLocation = async (locationId: number) => {
	let startDate: Date = null;

	const location = await Location
		.findOne({
			_id: locationId
		})
		.exec();

	if (!location) {
		throw new Error("Location not found");
	}

	try {
		const lastHeatingStatistic = await HeatingStatistics
			.findOne({
				location: locationId
			})
			.sort({
				date: -1
			})
			.exec();

		if (lastHeatingStatistic && lastHeatingStatistic.date) {
			startDate = new Date(lastHeatingStatistic.date.getTime() + 24 * 60 * 60 * 1000);
		} else {
			const lastHeatingHistory = await HeatingHistory
				.findOne({
					location: locationId
				})
				.sort({
					datetime: 1
				})
				.exec();

			if (lastHeatingHistory && lastHeatingHistory.datetime) {
				startDate = lastHeatingHistory.datetime;
			}
		}
	} catch (e) {
		console.error('error while determining start date for saving statistics', e);
		startDate = null;
	}

	if (startDate) {
		const startDateStart = moment(startDate).tz(location.timezone).startOf('day').toDate();
		let currentDate = startDateStart;

		const todayStart = moment().tz(location.timezone).startOf('day').toDate();

		while (currentDate < todayStart) {
			try {
				const [heatingDuration, avgTargetTemp, avgOutsideCondition] = await Promise.all([
					calculateHeatingDuration(location, currentDate),
					calculateAvgTargetTemp(location, currentDate),
					calculateAvgOutsideCondition(location, currentDate)
				]);

				await new HeatingStatistics({
					date: toSameDateInUTC(currentDate, location.timezone).startOf('day').toDate(),
					avgTargetTemp: avgTargetTemp || null,
					avgOutsideTemp: avgOutsideCondition.t,
					avgOutsideHumi: avgOutsideCondition.h,
					sunshineMinutes: avgOutsideCondition.sunshineMinutes,
					runningMinutes: heatingDuration,
					location: locationId
				}).save();
			} catch (e) {
				console.error('error while calculating statistics or saving it for date', e);
			}

			currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
		}

		// cleanup unused data + keep last month as buffer
		await HeatingHistory
			.deleteMany({
				location: locationId,
				datetime: {
					$lt: moment(currentDate).subtract(2, 'month').toDate()
				}
			})
			.exec()
			.then(result => {
				console.log('Successfully cleaned up heating history, deleted count:', result.deletedCount);
			})
			.catch(e => {
				console.error('Failed to cleanup heating history with error:', e);
			});

		await TargetTempHistory
			.deleteMany({
				location: locationId,
				datetime: {
					$lt: moment(currentDate).subtract(2, 'month').toDate()
				}
			})
			.exec()
			.then(result => {
				console.log('Successfully cleaned up target temp history, deleted count:', result.deletedCount);
			})
			.catch(e => {
				console.error('Failed to cleanup target temp history with error:', e);
			});

		await HeatingHoldConditionHistory
			.deleteMany({
				location: locationId,
				datetime: {
					$lt: moment(currentDate).subtract(2, 'month').toDate()
				}
			})
			.exec()
			.then(result => {
				console.log('Successfully cleaned up heating hold condition history, deleted count:', result.deletedCount);
			})
			.catch(e => {
				console.error('Failed to cleanup heating hold condition history with error:', e);
			});
	}
};



export const getStatisticsForToday = async (locationId: number) => {
	const location = await Location
		.findOne({
			_id: locationId
		})
		.exec();

	if (!location) {
		throw new Error("Location not found");
	}

	const heatingDuration = await calculateHeatingDuration(location);

	return {
		heatingDuration
	};
};

export const getStatisticsByDay = async (locationId: number, dateStart: Date, dateEnd: Date) => {
	const location = await Location
		.findOne({
			_id: locationId
		})
		.exec();

	if (!location) {
		throw new Error("Location not found");
	}

	const mStartDate = toSameDateInUTC(dateStart, location.timezone).startOf('day');
	const mEndDate = toSameDateInUTC(dateEnd, location.timezone).endOf('day');

	const heatingStatistics = await HeatingStatistics
		.find({
			date: {
				$gt: mStartDate.toDate(),
				$lt: mEndDate.toDate()
			},
			location: locationId
		})
		.lean()
		.exec();

	if (moment(dateEnd).tz(location.timezone).endOf('day').valueOf() === moment().tz(location.timezone).endOf('day').valueOf()) {
		const [todayOutsideCondition, todayTargetTemp, todayRunningMinutes] = await Promise.all([
				calculateAvgOutsideCondition(location),
				calculateAvgTargetTemp(location),
				calculateHeatingDuration(location)
			]);

		heatingStatistics.push({
			avgOutsideHumi: todayOutsideCondition.h,
			avgOutsideTemp: todayOutsideCondition.t,
			avgTargetTemp: todayTargetTemp,
			date: toSameDateInUTC(moment(), location.timezone).startOf('day').toDate(),
			runningMinutes: todayRunningMinutes,
			sunshineMinutes: todayOutsideCondition.sunshineMinutes,
			location: locationId
		} as HydratedDocument<IHeatingStatistics>);
	}

	return heatingStatistics.map(hs => ({ ...hs, date: moment(hs.date).tz('utc').format('YYYY-MM-DD') })) || [];
};

export const getStatisticsByMonth = async (locationId: number, dateStart: Date, dateEnd: Date) => {
	const location = await Location
		.findOne({
			_id: locationId
		})
		.exec();

	if (!location) {
		throw new Error("Location not found");
	}

	const heatingStatistics = await HeatingStatistics
		.find({
			date: {
				$gt: toSameDateInUTC(dateStart, location.timezone).startOf('month').toDate(),
				$lt: toSameDateInUTC(dateEnd, location.timezone).endOf('month').toDate()
			},
			location: locationId
		})
		.exec();

	const totals: Total[] = [];
	let currentMonth: Moment = null;

	heatingStatistics.forEach(statistic => {
		if (!currentMonth || currentMonth.valueOf() !== moment(statistic.date).tz('utc').startOf('month').valueOf()) {
			currentMonth = moment(statistic.date).tz('utc').startOf('month');
			totals.push({
				date: currentMonth,
				daysRunningMinutes: 0,
				runningMinutesTotal: 0,
				daysTargetTemp: 0,
				targetTempTotal: 0,
				daysOutsideCondition: 0,
				outsideTempTotal: 0,
				outsideHumiTotal: 0,
				sunshineMinutesTotal: 0
			});
		}

		const currentAvg = totals[totals.length - 1];
		currentAvg.daysRunningMinutes++;

		if (statistic.runningMinutes) {
			currentAvg.runningMinutesTotal += statistic.runningMinutes;
		}

		if (statistic.avgTargetTemp) {
			currentAvg.daysTargetTemp++;
			currentAvg.targetTempTotal += statistic.avgTargetTemp;
		}

		if (statistic.avgOutsideTemp) {
			currentAvg.daysOutsideCondition++;
			currentAvg.outsideTempTotal += statistic.avgOutsideTemp;
			currentAvg.outsideHumiTotal += statistic.avgOutsideHumi;
			currentAvg.sunshineMinutesTotal += statistic.sunshineMinutes;
		}
	});

	const avgs: Average[] = [];

	totals.forEach(total => {
		avgs.push({
			date: total.date.format('YYYY-MM'),
			totalRunningMinutes: total.runningMinutesTotal,
			avgRunningMinutes: total.daysRunningMinutes ? total.runningMinutesTotal / total.daysRunningMinutes : 0,
			avgTargetTemp: total.targetTempTotal / total.daysTargetTemp,
			avgOutsideTemp: total.outsideTempTotal / total.daysOutsideCondition,
			avgOutsideHumi: total.outsideHumiTotal / total.daysOutsideCondition,
			avgSunshineMinutes: total.sunshineMinutesTotal / total.daysOutsideCondition
		});
	});

	return avgs;
};


export const getStatisticsByYear = async (locationId: number, dateStart: Date, dateEnd: Date) => {
	const location = await Location
		.findOne({
			_id: locationId
		})
		.exec();

	if (!location) {
		throw new Error("Location not found");
	}

	const years: number[] = [moment(dateStart).tz(location.timezone).startOf('year').year()];

	const endYear = moment(dateEnd).tz(location.timezone).startOf('year').year();
	let year = years[0] + 1;
	while (year <= endYear) {
		years.push(year);
		year++;
	}

	const currentYear = moment().tz(location.timezone).year();

	return Promise.all(years.map(async y => {
		const byMonths = await getStatisticsByMonth(
			location._id,
			moment.tz(`${y}-01-01`, 'YYYY-MM-DD', location.timezone).toDate(),
			moment.tz(y < currentYear ? `${y}-12-31` : moment().tz(location.timezone).format('YYYY-MM-DD'), 'YYYY-MM-DD', location.timezone).toDate()
		);

		return {
			year: y,
			avgRunningMinutes: byMonths.reduce((acc, v) => acc + v.avgRunningMinutes, 0) / (y < currentYear ? 12 : (moment().tz(location.timezone).month() + 1)),
			avgTargetTemp: byMonths.reduce((acc, v) => acc + v.avgTargetTemp, 0) / (y < currentYear ? 12 : (moment().tz(location.timezone).month() + 1)),
			avgOutsideTemp: byMonths.reduce((acc, v) => acc + v.avgOutsideTemp, 0) / (y < currentYear ? 12 : (moment().tz(location.timezone).month() + 1)),
			avgOutsideHumi: byMonths.reduce((acc, v) => acc + v.avgOutsideHumi, 0) / (y < currentYear ? 12 : (moment().tz(location.timezone).month() + 1)),
			avgSunshineMinutes: byMonths.reduce((acc, v) => acc + v.avgSunshineMinutes, 0) / (y < currentYear ? 12 : (moment().tz(location.timezone).month() + 1))
		};
	}));
}


export const initStatistics = () => {
	outsideConditionsEvts.on('change', async values => {
		if (values && !isNaN(values.temperature) && !isNaN(values.humidity)) {
			await new OutsideConditionHistory({
				datetime: moment().toDate(),
				t: values.temperature,
				h: values.humidity,
				sunny: values.sunny
			}).save();
		}
	});

	heatingEvts.on('changeHeating', async data => {
		const result = await HeatingHistory
			.findOne({
				location: data.location
			})
			.sort({
				datetime: -1
			})
			.exec();

		if (!result || result.status !== data.isOn) {
			await new HeatingHistory({
				datetime: moment().toDate(),
				location: data.location,
				status: data.isOn
			}).save();
		}
	});

	heatingEvts.on('changeHeatingPower', async data => {
		const result = await HeatingHoldConditionHistory
			.findOne({
				location: data.location,
				type: HeatingHoldConditionTypes.POWERED_OFF
			})
			.sort({
				datetime: -1
			})
			.exec();

		if (!result || result.status === data.poweredOn) {
			await new HeatingHoldConditionHistory({
				datetime: moment().toDate(),
				location: data.location,
				type: HeatingHoldConditionTypes.POWERED_OFF,
				status: !data.poweredOn
			}).save();
		}
	});

	heatingEvts.on('conditionStatusChange', async data => {
		const resultWeather = await HeatingHoldConditionHistory
			.findOne({
				location: data.location,
				type: HeatingHoldConditionTypes.FAVORABLE_WEATHER_FORECAST
			})
			.sort({
				datetime: -1
			})
			.exec();

		if (!resultWeather || resultWeather.status !== data.hasFavorableWeatherForecast) {
			await new HeatingHoldConditionHistory({
				datetime: moment().toDate(),
				location: data.location,
				type: HeatingHoldConditionTypes.FAVORABLE_WEATHER_FORECAST,
				status: data.hasFavorableWeatherForecast
			}).save();
		}

		const resultTrend = await HeatingHoldConditionHistory
			.findOne({
				location: data.location,
				type: HeatingHoldConditionTypes.INCREASING_TREND
			})
			.sort({
				datetime: -1
			})
			.exec();

		if (!resultTrend || resultTrend.status !== data.hasIncreasingTrend) {
			await new HeatingHoldConditionHistory({
				datetime: moment().toDate(),
				location: data.location,
				type: HeatingHoldConditionTypes.INCREASING_TREND,
				status: data.hasIncreasingTrend
			}).save();
		}

		const resultWindow = await HeatingHoldConditionHistory
			.findOne({
				location: data.location,
				type: HeatingHoldConditionTypes.WINDOW_OPEN
			})
			.sort({
				datetime: -1
			})
			.exec();

		if (!resultWindow || resultWindow.status !== data.hasWindowOpen) {
			await new HeatingHoldConditionHistory({
				datetime: moment().toDate(),
				location: data.location,
				type: HeatingHoldConditionTypes.WINDOW_OPEN,
				status: data.hasWindowOpen
			}).save();
		}
	});

	void monitorTargetTemps();
	setInterval(monitorTargetTemps, 60000);

	void saveStatisticsForADay();
	setInterval(saveStatisticsForADay, 60 * 60 * 1000);
};
