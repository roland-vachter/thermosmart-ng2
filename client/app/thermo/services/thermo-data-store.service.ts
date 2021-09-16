import { ApplicationRef, EventEmitter, Injectable } from '@angular/core';
import { ServerUpdateService } from '../../shared/server-update.service';
import { ThermoServerApiService } from './thermo-server-api.service';

@Injectable()
export class ThermoDataStoreService {

    private dayNameByIndex = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

	lastUpdate: any = null;
	insideConditions: any = {
		temperature: null,
		humidity: null
	};
	sensorsById = {};
	sensorList = [];
	outsideConditions: any = {
		temperature: null,
		humidity: null,
		weatherIconClass: null
	};
	heatingStatus: any = false;
	heatingDuration: any = {
		value: 0
	};
	temperatures: any = {};
	temperatureList: any = [];
	heatingPlans: any = {};
	heatingPlanList: any = [];
	defaultHeatingPlans: any = [];
	todaysPlan: any = {
		plan: {
			ref: {}
		}
	};
	nextDaysPlan: any = {
		plan: {
			ref: {}
		}
	};
	targetTemp: any = {
		ref: {
			value: 0,
			color: 'gray'
		}
	};
	percentInDay: any = 0;
	currentTime: any = null;
	currentDate: any = null;
	config: any = {};
	heatingPower = {
		status: false,
		until: new Date(new Date().getTime() + 15 * 60 * 1000)
	};

    evt: EventEmitter<string> = new EventEmitter();

	constructor(
        private serverApiService: ThermoServerApiService,
        private serverUpdateService: ServerUpdateService,
        private appRef: ApplicationRef
    ) {
        this.serverUpdateService.onUpdate()
			.subscribe(this.handleServerData.bind(this));

        setInterval(this.update.bind(this), 60000);

        this.init();
    }

    init() {
        this.serverApiService.init()
			.subscribe(this.handleServerData.bind(this));
    }

    handleServerData (data: any) {
		this.lastUpdate = new Date();

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
				if (!this.sensorsById[id]) {
					this.sensorsById[id] = data.sensors[id];
					this.sensorList.push(data.sensors[id]);
				} else {
					Object.assign(this.sensorsById[id], data.sensors[id]);
				}
			});

			this.computeInsideConditions();
		}

		if (data.sensor) {
			if (data.sensor.deleted === true) {
				if (this.sensorsById[data.sensor.id]) {
					this.sensorList.splice(this.sensorList.indexOf(this.sensorsById[data.sensor.id]), 1);
					delete this.sensorsById[data.sensor.id];
				}
			} else {
				if (!this.sensorsById[data.sensor.id]) {
					this.sensorsById[data.sensor.id] = data.sensor;
					this.sensorList.push(data.sensor);
				}

				Object.assign(this.sensorsById[data.sensor.id], data.sensor);
			}

			this.computeInsideConditions();
		}

		if (data.outside) {
			this.outsideConditions.temperature = data.outside.temperature;
			this.outsideConditions.humidity = data.outside.humidity;
			this.outsideConditions.weatherIconClass = data.outside.weatherIconClass;

			if (data.outside.backgroundImage) {
				document.body.style.backgroundImage = document.body.style.backgroundImage.substring(0, document.body.style.backgroundImage.lastIndexOf('/') + 1) + data.outside.backgroundImage;
			}
		}

		if (typeof data.isHeatingOn === 'boolean') {
			this.heatingStatus = data.isHeatingOn;
		}

		if (data.temperatures) {
			data.temperatures.forEach(temp => {
				if (!this.temperatures[temp._id]) {
					this.temperatures[temp._id] = {};
					this.temperatureList.push(this.temperatures[temp._id]);
				}

				this.temperatures[temp._id].ref = temp;
			});
		}

		if (data.targetTempId) {
			this.targetTemp = this.temperatures[data.targetTempId];
		}

		if (data.heatingPlans) {
			data.heatingPlans.forEach(heatingPlan => {
				if (!this.heatingPlans[heatingPlan._id]) {
					this.heatingPlans[heatingPlan._id] = {};
					this.heatingPlanList.push(this.heatingPlans[heatingPlan._id]);
				}

				this.heatingPlans[heatingPlan._id].ref = Object.assign({}, heatingPlan);

				heatingPlan.intervals.forEach(override => {
					override.temp = this.temperatures[override.temp];
				});

				this.processPlanForDisplay(heatingPlan);
			});
		}

		if (data.heatingDefaultPlans) {
			data.heatingDefaultPlans.forEach(heatingPlan => {
				if (!this.defaultHeatingPlans[heatingPlan.dayOfWeek]) {
					this.defaultHeatingPlans[heatingPlan.dayOfWeek] = {};
				}

				this.defaultHeatingPlans[heatingPlan.dayOfWeek] = Object.assign({}, heatingPlan);

				this.defaultHeatingPlans[heatingPlan.dayOfWeek].plan = this.heatingPlans[heatingPlan.plan];
				this.defaultHeatingPlans[heatingPlan.dayOfWeek].nameOfDay = this.dayNameByIndex[heatingPlan.dayOfWeek];
			});
		}

		if (data.statisticsForToday) {
			this.heatingDuration = data.statisticsForToday.heatingDuration;
		}

		if (data.heatingPower) {
			this.heatingPower.status = data.heatingPower.status;
			this.heatingPower.until = new Date(data.heatingPower.until);
		}

		this.todaysPlan = this.defaultHeatingPlans[new Date().getDay()];
		this.nextDaysPlan = this.defaultHeatingPlans[new Date(new Date().getTime() + 24 * 60 * 60 * 1000).getDay()];

		this.update();

        this.evt.next();
	}

    private update () {
		const d = new Date();
		this.percentInDay = this.getPercentInDay();
		this.currentTime = `${this.pad(d.getHours(), 2)}:${this.pad(d.getMinutes(), 2)}`;
		this.currentDate = d;

        this.appRef.tick();
	}

    private processPlanForDisplay (heatingPlan) {
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
	}

	private pad (num, size) {
		let s = num+"";
		while (s.length < size) s = "0" + s;
		return s;
	}

	private getPercentInDay (hour = undefined, minute = undefined) {
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

		this.sensorList.forEach(sensor => {
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
