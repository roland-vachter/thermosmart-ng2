import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { ServerUpdateService } from '../../shared/server-update.service';
import { EventEmitter } from '@angular/core';

@Injectable()
export class ServerApiService {

	public evt = new EventEmitter();

	private dayNameByIndex = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

	lastUpdate: Date = null;
	restartSensorInProgress: boolean = false;
	insideConditions = {
		temperature: null,
		humidity: null
	};
	sensorsById = {};
	sensorList = [];
	outsideConditions = {
		temperature: null,
		humidity: null,
		weatherIconClass: null
	};
	heatingStatus: boolean = false;
	heatingDuration = {
		value: 0
	};
	temperatures: any = {};
	temperatureList: any = [];
	heatingPlans: any = {};
	heatingPlanList: any = [];
	defaultHeatingPlans: any = [];
	todaysPlan = {
		plan: {
			ref: {}
		}
	};
	nextDaysPlan = {
		plan: {
			ref: {}
		}
	};
	targetTemp = {
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

	constructor(
		private http: HttpClient,
		private serverUpdateService: ServerUpdateService,
	) {
		this.http.get('/api/init')
			.subscribe((res: any) => {
				if (res.status === 'ok') {
					this.handleServerData(res.data);
				}
			});
		
		this.serverUpdateService.onUpdate()
			.subscribe((data) => {
				this.handleServerData(data)
			});
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

		this.evt.emit();
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




	toggleHeatingPower () {
		const obs = this.http.post('/api/toggleheatingpower', {});
		obs.subscribe();
		return obs;
	}

	toggleSensorStatus (id) {
		const obs = this.http.post('/api/togglesensorstatus', {
			id
		});

		obs.subscribe();
		return obs;
	}

	changeSensorSettings (id, options) {
		const obs = this.http.post('/api/changesensorsettings', {
			id,
			label: options.label,
			tempadjust: options.tempAdjust,
			humidityadjust: options.humidityAdjust
		});

		obs.subscribe();
		return obs;
	}

	tempAdjust (id, value) {
		const obs = this.http.post('/api/tempadjust', {
			id,
			value
		});

		obs.subscribe();
		return obs;
	}

	restartSensor () {
		const obs = this.http.post('/api/restartSensor', {});

		obs.subscribe();
		return obs;
	}

	changeDefaultPlan (dayOfWeek, planId) {
		const obs = this.http.post('/api/changedefaultplan', {
			dayOfWeek,
			planId
		});

		obs.subscribe();
		return obs;
	}

	statistics () {
		return this.http.get('/api/statistics');
	}

	changeConfig (name, value) {
		const obs = this.http.post('/api/changeconfig', {
			name,
			value
		});

		obs.subscribe();
		return obs;
	}

}
