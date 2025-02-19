import { EventEmitter, Injectable } from '@angular/core';
import { Moment } from 'moment-timezone';
import * as moment from 'moment-timezone';
import { ServerUpdateService } from '../../shared/server-update.service';
import { HeatingConditions, HeatingPlan, HeatingPower, SolarHeatingStatus, ThermoInitUpdateData } from "../types/types";
import { Temperature } from "../types/types";
import { HeatingDefaultPlan } from "../types/types";
import { HeatingPlanOverride } from "../types/types";
import { Sensor } from "../types/types";
import { ThermoServerApiService } from './thermo-server-api.service';
import { LocationService } from '../../services/location.service';

@Injectable({
  providedIn: 'root'
})
export class ThermoDataStoreService {

	private dayNameByIndex = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

	lastUpdate: Moment = moment();
	insideConditions: {
		temperature: number,
		humidity: number
	} = {
		temperature: null,
		humidity: null
	};
	sensorsById: Record<string, Sensor> = {};
	outsideConditions: {
		temperature: number;
		humidity: number;
		color: string;
		weatherIconClass: string;
	} = {
		temperature: null,
		humidity: null,
		color: null,
		weatherIconClass: null
	};
	heatingStatus: boolean = false;
	heatingDuration: number = 0;
	solarHeatingDuration: number = 0;
	temperatures: Record<string, Temperature> = {};
	heatingPlans: Record<string, HeatingPlan> = {};
	defaultHeatingPlans: HeatingDefaultPlan[] = [];
	todaysPlan: HeatingPlan;
	nextDaysPlan: HeatingPlan;
	targetTempId: number;
	percentInDay: number = 0;
	currentTime: string;
	currentDate: Moment;
	config: Record<string, Record<string, string | number | boolean>> = {};
	heatingPower: HeatingPower = {
		status: false,
		until: moment(Date.now() + 15 * 60 * 1000)
	};
	heatingConditions: HeatingConditions;
	sensorRestartInProgress: boolean = false;
	heatingPlanOverrides: HeatingPlanOverride[] = [];
	solarHeatingStatus: SolarHeatingStatus = {
		numberOfRadiators: 0,
		wattHourConsumption: 0,
		gridInjection: 0,
		solarProduction: 0
	};

	evt: EventEmitter<string> = new EventEmitter();

	constructor(
		private serverApiService: ThermoServerApiService,
		private serverUpdateService: ServerUpdateService,
		private locationService: LocationService
	) {
		this.serverUpdateService.onUpdate()
			.subscribe(this.handleServerData.bind(this));

		setInterval(this.update.bind(this), 60000);
	}

	reset() {
		this.lastUpdate = moment();
		this.insideConditions = {
			temperature: null,
			humidity: null
		};
		this.sensorsById = {};
		this.outsideConditions = {
			temperature: null,
			humidity: null,
			color: null,
			weatherIconClass: null
		};
		this.heatingStatus = false;
		this.heatingDuration = 0;
		this.solarHeatingDuration = 0;
		this.temperatures = {};
		this.heatingPlans = {};
		this.defaultHeatingPlans = [];
		this.todaysPlan = null;
		this.nextDaysPlan = null;
		this.targetTempId = null;
		this.percentInDay = 0;
		this.currentTime = null;
		this.currentDate = null;
		this.config = {};
		this.heatingPower = {
			status: false,
			until: moment(Date.now() + 15 * 60 * 1000)
		};
		this.sensorRestartInProgress = false;
		this.heatingPlanOverrides = [];
		this.solarHeatingStatus = {
			numberOfRadiators: 0,
			wattHourConsumption: 0,
			gridInjection: 0,
			solarProduction: 0
		};
	}

  init() {
		this.reset();
        this.serverApiService.init()
			.subscribe(this.handleServerData.bind(this));
    }

	initiateSensorRestart() {
		this.sensorRestartInProgress = true;
	}

	stopSensorRestart() {
		this.sensorRestartInProgress = false;
	}

	handleServerData (data: ThermoInitUpdateData) {
		const locationTimezone = this.locationService.getSelectedLocationTimezone();

		this.lastUpdate = moment();

		if (data.config) {
			Object.keys(data.config).forEach(configName => {
				if (!this.config[configName]) {
					this.config[configName] = {
						name: configName,
						value: ''
					};
				}

				this.config[configName].value = data.config[configName];
			});
		}

		if (data.sensors) {
			const ids = Object.keys(data.sensors);

			ids.forEach(id => {
				this.sensorsById[id] = data.sensors[id];
			});

			this.computeInsideConditions();
		}

		if (data.sensor) {
			if (data.sensor.deleted === true) {
				if (this.sensorsById[data.sensor.id]) {
					delete this.sensorsById[data.sensor.id];
				}
			} else {
				this.sensorsById[data.sensor.id] = data.sensor;
			}

			this.computeInsideConditions();
		}

		if (data.outside) {
			this.outsideConditions = {
				temperature: data.outside.temperature,
				humidity: data.outside.humidity,
				weatherIconClass: data.outside.weatherIconClass,
				color: data.outside.color
			}

			if (data.outside.backgroundImage) {
				document.body.style.backgroundImage =
					document.body.style.backgroundImage.substring(0, document.body.style.backgroundImage.lastIndexOf('/') + 1) + data.outside.backgroundImage;
			}
		}

		if (typeof data.isHeatingOn === 'boolean') {
			this.heatingStatus = data.isHeatingOn;
		}

		if (data.temperatures) {
			data.temperatures.forEach(temp => {
				this.temperatures[temp._id] = temp;
			});
		}

		if (!isNaN(data.targetTempId)) {
			this.targetTempId = data.targetTempId;
		}

		if (data.heatingPlans) {
			data.heatingPlans.forEach(heatingPlan => {
				this.heatingPlans[heatingPlan._id] = this.processPlanForDisplay(
					{
						...heatingPlan,
						intervals: heatingPlan.intervals.map(interval => ({
							...interval,
							temp: this.temperatures[interval.temp]
						}))
					}
				);
			});

			this.heatingPlans = { ...this.heatingPlans };
		}

		if (data.heatingDefaultPlans) {
			data.heatingDefaultPlans.forEach(heatingPlan => {
				this.defaultHeatingPlans[heatingPlan.dayOfWeek] = Object.assign({}, {
					...heatingPlan,
					plan: this.heatingPlans[heatingPlan.plan],
					nameOfDay: this.dayNameByIndex[heatingPlan.dayOfWeek]
				});
			});
			this.defaultHeatingPlans = [...this.defaultHeatingPlans];
		}

		if (data.statisticsForToday) {
			this.heatingDuration = data.statisticsForToday.heatingDuration;

			if (typeof data.statisticsForToday.solarHeatingDuration === 'number') {
				this.solarHeatingDuration = data.statisticsForToday.solarHeatingDuration;
			}
		}

		if (data.heatingPower) {
			this.heatingPower = {
				status: data.heatingPower.status,
				until: moment(data.heatingPower.until)
			}
		}

		if (data.heatingConditions) {
			this.heatingConditions = data.heatingConditions;
		}

		if (data.heatingPlanOverrides) {
			this.heatingPlanOverrides = data.heatingPlanOverrides.map(p => ({
				date: moment(p.date),
				plan: this.heatingPlans[p.plan as number]
			}));
		}

		if (data.solarHeatingStatus) {
			this.solarHeatingStatus.numberOfRadiators = data.solarHeatingStatus.numberOfRadiators;
			this.solarHeatingStatus.wattHourConsumption = data.solarHeatingStatus.wattHourConsumption;
			this.solarHeatingStatus.solarProduction = data.solarHeatingStatus.solarProduction;
			this.solarHeatingStatus.gridInjection = data.solarHeatingStatus.gridInjection;
		}

		this.updateTodaysPlan();

		const tomorrowStartOfDay = moment().tz(locationTimezone).startOf('day').add(1, 'day');
		const heatingPlanOverrideTomorrow = this.heatingPlanOverrides.find(po => po.date.valueOf() === tomorrowStartOfDay.valueOf());
		this.nextDaysPlan = heatingPlanOverrideTomorrow ? heatingPlanOverrideTomorrow.plan as HeatingPlan : this.defaultHeatingPlans[moment().add(1, 'day').day()].plan;

		this.update();

		this.evt.next();
	}

	updateTodaysPlan() {
		const locationTimezone = this.locationService.getSelectedLocationTimezone();
		const todayStartOfDay = moment().tz(locationTimezone).startOf('day');
		const heatingPlanOverrideToday = this.heatingPlanOverrides.find(po => po.date.valueOf() === todayStartOfDay.valueOf());
		this.todaysPlan = heatingPlanOverrideToday ? heatingPlanOverrideToday.plan as HeatingPlan : this.defaultHeatingPlans[moment().day()].plan;
		this.evt.emit();
	}

	get sensorList() {
		return Object.values(this.sensorsById);
	}

	private update () {
		const d = moment();
		this.percentInDay = this.getPercentInDay();
		this.currentTime = `${this.pad(d.hours(), 2)}:${this.pad(d.minutes(), 2)}`;
		this.currentDate = d;
	}

	private processPlanForDisplay (heatingPlan: HeatingPlan) {
		let lastPercent = 0;

		heatingPlan.intervals.forEach((interval, index) => {
			if (index === 0) {
				interval.label = '';
				interval.labelPosition = 0;
				interval.blockPosition = 0;
			} else {
				const percentInDay = this.getPercentInDay(interval.startHour, interval.startMinute);

				interval.label = `${this.pad(interval.startHour, 2)}:${this.pad(interval.startMinute, 2)}`;
				interval.labelPosition = percentInDay;

				heatingPlan.intervals[index - 1].blockPosition = percentInDay - lastPercent;

				lastPercent = percentInDay;
			}
		});

		if (heatingPlan.intervals.length) {
			heatingPlan.intervals[heatingPlan.intervals.length - 1].blockPosition = 100 - lastPercent;
		}

		return heatingPlan;
	}

	private pad (num: number, size: number) {
		let s = num + "";
		while (s.length < size) s = "0" + s;
		return s;
	}

	private getPercentInDay (hour?: number, minute?: number) {
		if (hour === undefined || minute === undefined) {
			const now = new Date();
			hour = now.getHours();
			minute = now.getMinutes();
		}

		const percentInDay = (hour * 60 + minute) * 100 / 1440;

		return percentInDay;
	}

	private computeInsideConditions () {
		let activeCount = 0;
		this.insideConditions.temperature = 0;
		this.insideConditions.humidity = 0;

		Object.values(this.sensorsById).forEach(sensor => {
			if (sensor.active && sensor.enabled) {
				this.insideConditions.temperature += sensor.temperature;
				this.insideConditions.humidity += sensor.humidity;

				activeCount++;
			}
		});

		this.insideConditions.temperature = this.insideConditions.temperature / activeCount;
		this.insideConditions.humidity = Math.round(this.insideConditions.humidity / activeCount);
	}
}
