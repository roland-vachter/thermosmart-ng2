import { Component, OnInit } from '@angular/core';
import { ThermoServerApiService } from '../../services/thermo-server-api.service';
import { Chart } from 'chart.js';
import moment from 'moment';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { TimezoneService } from '../../../shared/services/timezone.service';
import { LocationService } from '../../../services/location.service';
import { HeatingHoldConditionTypes } from '../../types/types';
import { ThermoDataStoreService } from '../../services/thermo-data-store.service';
import { LOCATION_FEATURE } from '../../../types/types';

@Component({
	selector: 'app-statistics-modal',
	templateUrl: './statistics-modal.component.html',
	styleUrls: ['./statistics-modal.component.scss']
})
export class StatisticsModalComponent implements OnInit {
	colors = [
		[75, 192, 192],
		[255, 116, 0],
		[115, 136, 10],
		[255, 26, 0],
		[199, 152, 16],
		[63, 76, 107]
	];
	hasSolarFeature = this.locationService.hasFeature(this.locationService.getSelectedLocation(), LOCATION_FEATURE.SOLAR_SYSTEM_HEATING);

	constructor(
		private serverApiService: ThermoServerApiService,
		private timezoneService: TimezoneService,
		private locationService: LocationService,
		private dataStore: ThermoDataStoreService,
		public bsModalRef: BsModalRef
	) { }

	ngOnInit() {
		const location = this.locationService.getSelectedLocation();

		this.serverApiService.statistics().subscribe(response => {
			if (response.data) {
				if (response.data.heatingForToday || response.data.heatingConditionsForToday) {
					const datasets = [];
					let colorIndex = 0;

					if (response.data.heatingForToday) {
						datasets.push({
							label: 'Heating status',
							yAxisID: "activeStatus",
							data: response.data.heatingForToday.map(item => ({
								x: this.timezoneService.toSameDateInCurrentTimezone(item.datetime, location.timezone),
								y: item.status ? 10 : 0
							})),
							steppedLine: true,
							backgroundColor: `rgba(${this.colors[colorIndex][0]},${this.colors[colorIndex][1]},${this.colors[colorIndex][2]},0.4)`,
							borderColor: `rgba(${this.colors[colorIndex][0]},${this.colors[colorIndex][1]},${this.colors[colorIndex][2]},1)`,
							borderCapStyle: 'butt',
							borderDash: [],
							borderDashOffset: 0.0,
							borderJoinStyle: 'miter',
							borderWidth: 2,
							pointBorderColor: `rgba(${this.colors[colorIndex][0]},${this.colors[colorIndex][1]},${this.colors[colorIndex][2]},1)`,
							pointBackgroundColor: "#fff",
							pointBorderWidth: 1,
							pointHoverRadius: 4,
							pointHoverBackgroundColor: `rgba(${this.colors[colorIndex][0]},${this.colors[colorIndex][1]},${this.colors[colorIndex][2]},1)`,
							pointHoverBorderColor: "rgba(220,220,220,1)",
							pointHoverBorderWidth: 2,
							pointRadius: 2,
							pointHitRadius: 3,
						});

						colorIndex++;
					}

					if (response.data.heatingConditionsForToday) {
						if (response.data.heatingConditionsForToday[HeatingHoldConditionTypes.POWERED_OFF]) {
							datasets.push({
								label: 'Power off',
								yAxisID: "activeStatus",
								data: response.data.heatingConditionsForToday[HeatingHoldConditionTypes.POWERED_OFF].map(item => ({
									x: this.timezoneService.toSameDateInCurrentTimezone(item.datetime, location.timezone),
									y: item.status ? 8 : 0
								})),
								steppedLine: true,
								backgroundColor: `rgba(${this.colors[colorIndex][0]},${this.colors[colorIndex][1]},${this.colors[colorIndex][2]},0.4)`,
								borderColor: `rgba(${this.colors[colorIndex][0]},${this.colors[colorIndex][1]},${this.colors[colorIndex][2]},1)`,
								borderCapStyle: 'butt',
								borderDash: [],
								borderDashOffset: 0.0,
								borderJoinStyle: 'miter',
								borderWidth: 2,
								pointBorderColor: `rgba(${this.colors[colorIndex][0]},${this.colors[colorIndex][1]},${this.colors[colorIndex][2]},1)`,
								pointBackgroundColor: "#fff",
								pointBorderWidth: 1,
								pointHoverRadius: 4,
								pointHoverBackgroundColor: `rgba(${this.colors[colorIndex][0]},${this.colors[colorIndex][1]},${this.colors[colorIndex][2]},1)`,
								pointHoverBorderColor: "rgba(220,220,220,1)",
								pointHoverBorderWidth: 2,
								pointRadius: 2,
								pointHitRadius: 3
							});

							colorIndex++;
						}

						if (response.data.heatingConditionsForToday[HeatingHoldConditionTypes.WINDOW_OPEN]) {
							datasets.push({
								label: 'Window open',
								yAxisID: "activeStatus",
								data: response.data.heatingConditionsForToday[HeatingHoldConditionTypes.WINDOW_OPEN].map(item => ({
									x: this.timezoneService.toSameDateInCurrentTimezone(item.datetime, location.timezone),
									y: item.status ? 6 : 0
								})),
								steppedLine: true,
								backgroundColor: `rgba(${this.colors[colorIndex][0]},${this.colors[colorIndex][1]},${this.colors[colorIndex][2]},0.4)`,
								borderColor: `rgba(${this.colors[colorIndex][0]},${this.colors[colorIndex][1]},${this.colors[colorIndex][2]},1)`,
								borderCapStyle: 'butt',
								borderDash: [],
								borderDashOffset: 0.0,
								borderJoinStyle: 'miter',
								borderWidth: 2,
								pointBorderColor: `rgba(${this.colors[colorIndex][0]},${this.colors[colorIndex][1]},${this.colors[colorIndex][2]},1)`,
								pointBackgroundColor: "#fff",
								pointBorderWidth: 1,
								pointHoverRadius: 4,
								pointHoverBackgroundColor: `rgba(${this.colors[colorIndex][0]},${this.colors[colorIndex][1]},${this.colors[colorIndex][2]},1)`,
								pointHoverBorderColor: "rgba(220,220,220,1)",
								pointHoverBorderWidth: 2,
								pointRadius: 2,
								pointHitRadius: 3
							});

							colorIndex++;
						}

						if (this.dataStore.config.weatherForecastFeature &&
								response.data.heatingConditionsForToday[HeatingHoldConditionTypes.FAVORABLE_WEATHER_FORECAST]) {
							datasets.push({
								label: 'Favorable weather',
								yAxisID: "activeStatus",
								data: response.data.heatingConditionsForToday[HeatingHoldConditionTypes.FAVORABLE_WEATHER_FORECAST].map(item => ({
									x: this.timezoneService.toSameDateInCurrentTimezone(item.datetime, location.timezone),
									y: item.status ? 4 : 0
								})),
								steppedLine: true,
								backgroundColor: `rgba(${this.colors[colorIndex][0]},${this.colors[colorIndex][1]},${this.colors[colorIndex][2]},0.4)`,
								borderColor: `rgba(${this.colors[colorIndex][0]},${this.colors[colorIndex][1]},${this.colors[colorIndex][2]},1)`,
								borderCapStyle: 'butt',
								borderDash: [],
								borderDashOffset: 0.0,
								borderJoinStyle: 'miter',
								borderWidth: 2,
								pointBorderColor: `rgba(${this.colors[colorIndex][0]},${this.colors[colorIndex][1]},${this.colors[colorIndex][2]},1)`,
								pointBackgroundColor: "#fff",
								pointBorderWidth: 1,
								pointHoverRadius: 4,
								pointHoverBackgroundColor: `rgba(${this.colors[colorIndex][0]},${this.colors[colorIndex][1]},${this.colors[colorIndex][2]},1)`,
								pointHoverBorderColor: "rgba(220,220,220,1)",
								pointHoverBorderWidth: 2,
								pointRadius: 2,
								pointHitRadius: 3
							});

							colorIndex++;
						}

						if (this.dataStore.config.temperatureTrendsFeature &&
								response.data.heatingConditionsForToday[HeatingHoldConditionTypes.INCREASING_TREND]) {
							datasets.push({
								label: 'Increasing trend',
								yAxisID: "activeStatus",
								data: response.data.heatingConditionsForToday[HeatingHoldConditionTypes.INCREASING_TREND].map(item => ({
									x: this.timezoneService.toSameDateInCurrentTimezone(item.datetime, location.timezone),
									y: item.status ? 2 : 0
								})),
								steppedLine: true,
								backgroundColor: `rgba(${this.colors[colorIndex][0]},${this.colors[colorIndex][1]},${this.colors[colorIndex][2]},0.4)`,
								borderColor: `rgba(${this.colors[colorIndex][0]},${this.colors[colorIndex][1]},${this.colors[colorIndex][2]},1)`,
								borderCapStyle: 'butt',
								borderDash: [],
								borderDashOffset: 0.0,
								borderJoinStyle: 'miter',
								borderWidth: 2,
								pointBorderColor: `rgba(${this.colors[colorIndex][0]},${this.colors[colorIndex][1]},${this.colors[colorIndex][2]},1)`,
								pointBackgroundColor: "#fff",
								pointBorderWidth: 1,
								pointHoverRadius: 4,
								pointHoverBackgroundColor: `rgba(${this.colors[colorIndex][0]},${this.colors[colorIndex][1]},${this.colors[colorIndex][2]},1)`,
								pointHoverBorderColor: "rgba(220,220,220,1)",
								pointHoverBorderWidth: 2,
								pointRadius: 2,
								pointHitRadius: 3
							});

							colorIndex++;
						}
					}

					new Chart(document.querySelector('#heatingHistoryChart'), {
						type: 'line',
						data: {
							datasets
						},
						options: {
							maintainAspectRatio: false,
							responsive: true,
							tooltips: {
								callbacks: {
									label: function(tooltipItem, data) {
										if (tooltipItem.yLabel > 0) {
											return `${data.datasets[tooltipItem.datasetIndex].label}: ON`;
										} else {
											return `${data.datasets[tooltipItem.datasetIndex].label}: OFF`;
										}
									}
								}
							},
							scales: {
								xAxes: [{
									type: 'time',
									time: {
										unit: 'hour',
										tooltipFormat: 'MMM Do, HH:mm',
										unitStepSize: 1,
										displayFormats: {
											millisecond: 'SSS [ms]',
											second: 'h:mm:ss a',
											minute: 'h:mm:ss a',
											hour: 'HH:mm',
											day: 'MMM D',
											week: 'll',
											month: 'MMM YYYY',
											quarter: '[Q]Q - YYYY',
											year: 'YYYY'
										}
									}
								}],
								yAxes: [{
									id: "activeStatus",
									ticks: {
										callback: function(value) {
											return value === 0 ? 'OFF' : value === 10 ? 'ON' : '';
										},
										fixedStepSize: 1,
										min: 0,
										max: 10
									}
								}]
							}
						}
					});
				}

				if (this.hasSolarFeature && (response.data.solarHeatingForToday || response.data.solarForToday)) {
					const datasets = [];
					let colorIndex = 0;

					if (response.data.solarHeatingForToday) {
						datasets.push({
							label: 'Radiator heating',
							yAxisID: "watts",
							data: response.data.solarHeatingForToday.map(item => ({
								x: this.timezoneService.toSameDateInCurrentTimezone(item.datetime, location.timezone),
								y: item.wattHourConsumption
							})),
							steppedLine: true,
							backgroundColor: `rgba(${this.colors[colorIndex][0]},${this.colors[colorIndex][1]},${this.colors[colorIndex][2]},0.4)`,
							borderColor: `rgba(${this.colors[colorIndex][0]},${this.colors[colorIndex][1]},${this.colors[colorIndex][2]},1)`,
							borderCapStyle: 'butt',
							borderDash: [],
							borderDashOffset: 0.0,
							borderJoinStyle: 'miter',
							borderWidth: 2,
							pointBorderColor: `rgba(${this.colors[colorIndex][0]},${this.colors[colorIndex][1]},${this.colors[colorIndex][2]},1)`,
							pointBackgroundColor: "#fff",
							pointBorderWidth: 1,
							pointHoverRadius: 4,
							pointHoverBackgroundColor: `rgba(${this.colors[colorIndex][0]},${this.colors[colorIndex][1]},${this.colors[colorIndex][2]},1)`,
							pointHoverBorderColor: "rgba(220,220,220,1)",
							pointHoverBorderWidth: 2,
							pointRadius: 2,
							pointHitRadius: 3,
						});

						colorIndex++;
					}

					if (response.data.solarForToday) {
						datasets.push({
							label: 'Solar production',
							yAxisID: "watts",
							data: response.data.solarForToday.map(item => ({
								x: this.timezoneService.toSameDateInCurrentTimezone(item.datetime, location.timezone),
								y: item.solarProduction
							})),
							backgroundColor: `rgba(${this.colors[colorIndex][0]},${this.colors[colorIndex][1]},${this.colors[colorIndex][2]},0.4)`,
							borderColor: `rgba(${this.colors[colorIndex][0]},${this.colors[colorIndex][1]},${this.colors[colorIndex][2]},1)`,
							borderCapStyle: 'butt',
							borderDash: [],
							borderDashOffset: 0.0,
							borderJoinStyle: 'miter',
							borderWidth: 1,
							pointBorderColor: `rgba(${this.colors[colorIndex][0]},${this.colors[colorIndex][1]},${this.colors[colorIndex][2]},1)`,
							pointBackgroundColor: "#fff",
							pointBorderWidth: 0,
							pointRadius: 0,
							pointHitRadius: 3,
							pointHoverRadius: 2,
							pointHoverBackgroundColor: `rgba(${this.colors[colorIndex][0]},${this.colors[colorIndex][1]},${this.colors[colorIndex][2]},1)`,
							pointHoverBorderColor: "rgba(220,220,220,1)",
							pointHoverBorderWidth: 1,
							fill: false
						});

						colorIndex++;

						datasets.push({
							label: 'Consumption',
							yAxisID: "watts",
							data: response.data.solarForToday.map(item => ({
								x: this.timezoneService.toSameDateInCurrentTimezone(item.datetime, location.timezone),
								y: item.consumption
							})),
							backgroundColor: `rgba(${this.colors[colorIndex][0]},${this.colors[colorIndex][1]},${this.colors[colorIndex][2]},0.4)`,
							borderColor: `rgba(${this.colors[colorIndex][0]},${this.colors[colorIndex][1]},${this.colors[colorIndex][2]},1)`,
							borderCapStyle: 'butt',
							borderDash: [],
							borderDashOffset: 0.0,
							borderJoinStyle: 'miter',
							borderWidth: 1,
							pointBorderColor: `rgba(${this.colors[colorIndex][0]},${this.colors[colorIndex][1]},${this.colors[colorIndex][2]},1)`,
							pointBackgroundColor: "#fff",
							pointBorderWidth: 0,
							pointHoverRadius: 2,
							pointRadius: 0,
							pointHitRadius: 3,
							pointHoverBackgroundColor: `rgba(${this.colors[colorIndex][0]},${this.colors[colorIndex][1]},${this.colors[colorIndex][2]},1)`,
							pointHoverBorderColor: "rgba(220,220,220,1)",
							pointHoverBorderWidth: 1,
							fill: false
						});

						colorIndex++;
					}

					new Chart(document.querySelector('#solarHistoryChart'), {
						type: 'line',
						data: {
							datasets
						},
						options: {
							maintainAspectRatio: false,
							responsive: true,
							tooltips: {
								callbacks: {
									label: function(tooltipItem, data) {
										return `${data.datasets[tooltipItem.datasetIndex].label}: ${tooltipItem.yLabel}W`;
									}
								}
							},
							scales: {
								xAxes: [{
									type: 'time',
									time: {
										unit: 'hour',
										tooltipFormat: 'MMM Do, HH:mm',
										unitStepSize: 1,
										displayFormats: {
											millisecond: 'SSS [ms]',
											second: 'h:mm:ss a',
											minute: 'h:mm:ss a',
											hour: 'HH:mm',
											day: 'MMM D',
											week: 'll',
											month: 'MMM YYYY',
											quarter: '[Q]Q - YYYY',
											year: 'YYYY'
										}
									}
								}],
								yAxes: [{
									id: "watts",
									ticks: {
										callback: value => value,
										min: 0
									}
								}]
							}
						}
					});
				}

				if (response.data.statisticsForLastMonth) {
					const minTargetTemp = Math.min(...response.data.statisticsForLastMonth.map(item => item.avgTargetTemp));
					const maxTargetTemp = Math.max(...response.data.statisticsForLastMonth.map(item => item.avgTargetTemp));

					const minAvgOutsideTemp = Math.min(...response.data.statisticsForLastMonth.map(item => item.avgOutsideTemp));
					const maxAvgOutsideTemp = Math.max(...response.data.statisticsForLastMonth.map(item => item.avgOutsideTemp));

					const datasets = [{
						label: 'Heating time',
						yAxisID: "duration",
						data: [
							...response.data.statisticsForLastMonth.map(item => ({
								x: moment(item.date).startOf('day'),
								y: item.runningMinutes
							}))
						],
						backgroundColor: `rgba(${this.colors[0][0]},${this.colors[0][1]},${this.colors[0][2]},0.4)`,
						borderColor: `rgba(${this.colors[0][0]},${this.colors[0][1]},${this.colors[0][2]},1)`,
						borderCapStyle: 'butt',
						borderDash: [],
						borderDashOffset: 0.0,
						borderJoinStyle: 'miter',
						borderWidth: 2,
						pointBorderColor: `rgba(${this.colors[0][0]},${this.colors[0][1]},${this.colors[0][2]},1)`,
						pointBackgroundColor: "#fff",
						pointBorderWidth: 1,
						pointHoverRadius: 4,
						pointHoverBackgroundColor: `rgba(${this.colors[0][0]},${this.colors[0][1]},${this.colors[0][2]},1)`,
						pointHoverBorderColor: "rgba(220,220,220,1)",
						pointHoverBorderWidth: 2,
						pointRadius: 2,
						pointHitRadius: 3,
					}, {
						label: 'Avg target temp.',
						yAxisID: "temp",
						data: [
							...response.data.statisticsForLastMonth.map(item => ({
								x: moment(item.date).startOf('day'),
								y: item.avgTargetTemp
							}))
						],
						borderColor: `rgba(${this.colors[1][0]},${this.colors[1][1]},${this.colors[1][2]},1)`,
						borderCapStyle: 'butt',
						borderDash: [],
						borderDashOffset: 0.0,
						borderJoinStyle: 'miter',
						borderWidth: 2,
						pointBorderColor: `rgba(${this.colors[1][0]},${this.colors[1][1]},${this.colors[1][2]},1)`,
						pointBackgroundColor: "#fff",
						pointBorderWidth: 1,
						pointHoverRadius: 4,
						pointHoverBackgroundColor: `rgba(${this.colors[1][0]},${this.colors[1][1]},${this.colors[1][2]},1)`,
						pointHoverBorderColor: "rgba(220,220,220,1)",
						pointHoverBorderWidth: 2,
						pointRadius: 2,
						pointHitRadius: 3,
						fill: false,
					}, {
						label: 'Avg out temp.',
						yAxisID: "temp",
						data: [
							...response.data.statisticsForLastMonth.map(item => ({
								x: moment(item.date).startOf('day'),
								y: item.avgOutsideTemp
							}))
						],
						borderColor: `rgba(${this.colors[2][0]},${this.colors[2][1]},${this.colors[2][2]},1)`,
						borderCapStyle: 'butt',
						borderDash: [],
						borderDashOffset: 0.0,
						borderJoinStyle: 'miter',
						borderWidth: 2,
						pointBorderColor: `rgba(${this.colors[2][0]},${this.colors[2][1]},${this.colors[2][2]},1)`,
						pointBackgroundColor: "#fff",
						pointBorderWidth: 1,
						pointHoverRadius: 4,
						pointHoverBackgroundColor: `rgba(${this.colors[2][0]},${this.colors[2][1]},${this.colors[2][2]},1)`,
						pointHoverBorderColor: "rgba(220,220,220,1)",
						pointHoverBorderWidth: 2,
						pointRadius: 2,
						pointHitRadius: 3,
						fill: false,
					}, {
						label: 'Sunshine',
						yAxisID: "duration",
						data: [
							...response.data.statisticsForLastMonth.map(item => ({
								x: moment(item.date).startOf('day'),
								y: item.sunshineMinutes
							}))
						],
						borderColor: `rgba(${this.colors[4][0]},${this.colors[4][1]},${this.colors[4][2]},1)`,
						borderCapStyle: 'butt',
						borderDash: [],
						borderDashOffset: 0.0,
						borderJoinStyle: 'miter',
						borderWidth: 2,
						pointBorderColor: `rgba(${this.colors[4][0]},${this.colors[4][1]},${this.colors[4][2]},1)`,
						pointBackgroundColor: "#fff",
						pointBorderWidth: 1,
						pointHoverRadius: 4,
						pointHoverBackgroundColor: `rgba(${this.colors[4][0]},${this.colors[4][1]},${this.colors[4][2]},1)`,
						pointHoverBorderColor: "rgba(220,220,220,1)",
						pointHoverBorderWidth: 2,
						pointRadius: 2,
						pointHitRadius: 3,
						fill: false,
					}];

					if (this.hasSolarFeature) {
						datasets.push({
							label: 'Radiator heating',
							yAxisID: "duration",
							data: [
								...response.data.statisticsForLastMonth.map(item => ({
									x: moment(item.date).startOf('day'),
									y: item.radiatorRunningMinutes
								}))
							],
							borderColor: `rgba(${this.colors[5][0]},${this.colors[5][1]},${this.colors[5][2]},1)`,
							borderCapStyle: 'butt',
							borderDash: [],
							borderDashOffset: 0.0,
							borderJoinStyle: 'miter',
							borderWidth: 2,
							pointBorderColor: `rgba(${this.colors[5][0]},${this.colors[5][1]},${this.colors[5][2]},1)`,
							pointBackgroundColor: "#fff",
							pointBorderWidth: 1,
							pointHoverRadius: 4,
							pointHoverBackgroundColor: `rgba(${this.colors[5][0]},${this.colors[5][1]},${this.colors[5][2]},1)`,
							pointHoverBorderColor: "rgba(220,220,220,1)",
							pointHoverBorderWidth: 2,
							pointRadius: 2,
							pointHitRadius: 3,
							fill: false,
						});
					}

					new Chart(document.querySelector('#statisticsLast30Days'), {
						type: 'line',
						data: {
							datasets
						},
						options: {
							maintainAspectRatio: false,
							responsive: true,
							tooltips: {
								intersect: true,
								mode: 'x',
								callbacks: {
									label: function(tooltipItem, data) {
										switch (tooltipItem.datasetIndex) {
											case 0:
											case 3:
											case 4:
												let str = '';
												const duration = moment.duration(tooltipItem.yLabel * 60 * 1000);

												str += `${duration.hours() || 0}h `;
												str += `${duration.minutes() || 0}m`;

												return `${data.datasets[tooltipItem.datasetIndex].label}: ${str.trim()}`;
											case 1:
											case 2:
												return `${data.datasets[tooltipItem.datasetIndex].label}: ${tooltipItem.yLabel.toFixed(1)}`;
										}
									}
								}
							},
							scales: {
								xAxes: [{
									type: 'time',
									time: {
										unit: 'day',
										tooltipFormat: 'MMM Do',
										unitStepSize: 1,
										displayFormats: {
											millisecond: 'SSS [ms]',
											second: 'h:mm:ss a',
											minute: 'h:mm:ss a',
											hour: 'HH:mm',
											day: 'MMM D',
											week: 'll',
											month: 'MMM YYYY',
											quarter: '[Q]Q - YYYY',
											year: 'YYYY'
										}
									}
								}],
								yAxes: [{
									id: "duration",
									ticks: {
										callback: value => {
											let str = '';

											const duration = moment.duration(value * 60 * 1000);

											str += `${duration.hours() || 0}h `;
											str += `${duration.minutes() || 0}m`;

											return str.trim();
										},
										fixedStepSize: 60,
										min: 0
									}
								}, {
									id: "temp",
									ticks: {
										callback: value => value,
										fixedStepSize: 2,
										min: Math.floor(Math.min(minTargetTemp, minAvgOutsideTemp)),
										max: Math.ceil(Math.max(maxTargetTemp, maxAvgOutsideTemp))
									}
								}]
							}
						}
					});
				}


				if (response.data.statisticsByMonth) {
					const minTargetTemp = Math.min(...response.data.statisticsByMonth.map(item => item.avgTargetTemp));
					const maxTargetTemp = Math.max(...response.data.statisticsByMonth.map(item => item.avgTargetTemp));

					const minAvgOutsideTemp = Math.min(...response.data.statisticsByMonth.map(item => item.avgOutsideTemp));
					const maxAvgOutsideTemp = Math.max(...response.data.statisticsByMonth.map(item => item.avgOutsideTemp));

					const datasets = [{
						label: 'Avg heating time',
						yAxisID: "duration",
						data: [
							...response.data.statisticsByMonth.map(item => ({
								x: moment(item.date).startOf('month'),
								y: item.avgRunningMinutes
							}))
						],
						backgroundColor: `rgba(${this.colors[0][0]},${this.colors[0][1]},${this.colors[0][2]},0.4)`,
						borderColor: `rgba(${this.colors[0][0]},${this.colors[0][1]},${this.colors[0][2]},1)`,
						borderCapStyle: 'butt',
						borderDash: [],
						borderDashOffset: 0.0,
						borderJoinStyle: 'miter',
						borderWidth: 2,
						pointBorderColor: `rgba(${this.colors[0][0]},${this.colors[0][1]},${this.colors[0][2]},1)`,
						pointBackgroundColor: "#fff",
						pointBorderWidth: 1,
						pointHoverRadius: 4,
						pointHoverBackgroundColor: `rgba(${this.colors[0][0]},${this.colors[0][1]},${this.colors[0][2]},1)`,
						pointHoverBorderColor: "rgba(220,220,220,1)",
						pointHoverBorderWidth: 2,
						pointRadius: 2,
						pointHitRadius: 3,
					}, {
						label: 'Avg target temp.',
						yAxisID: "temp",
						data: [
							...response.data.statisticsByMonth.map(item => ({
								x: moment(item.date).startOf('month'),
								y: item.avgTargetTemp
							}))
						],
						borderColor: `rgba(${this.colors[1][0]},${this.colors[1][1]},${this.colors[1][2]},1)`,
						borderCapStyle: 'butt',
						borderDash: [],
						borderDashOffset: 0.0,
						borderJoinStyle: 'miter',
						borderWidth: 2,
						pointBorderColor: `rgba(${this.colors[1][0]},${this.colors[1][1]},${this.colors[1][2]},1)`,
						pointBackgroundColor: "#fff",
						pointBorderWidth: 1,
						pointHoverRadius: 4,
						pointHoverBackgroundColor: `rgba(${this.colors[1][0]},${this.colors[1][1]},${this.colors[1][2]},1)`,
						pointHoverBorderColor: "rgba(220,220,220,1)",
						pointHoverBorderWidth: 2,
						pointRadius: 2,
						pointHitRadius: 3,
						fill: false,
					}, {
						label: 'Avg out temp.',
						yAxisID: "temp",
						data: [
							...response.data.statisticsByMonth.map(item => ({
								x: moment(item.date).startOf('month'),
								y: item.avgOutsideTemp
							}))
						],
						borderColor: `rgba(${this.colors[2][0]},${this.colors[2][1]},${this.colors[2][2]},1)`,
						borderCapStyle: 'butt',
						borderDash: [],
						borderDashOffset: 0.0,
						borderJoinStyle: 'miter',
						borderWidth: 2,
						pointBorderColor: `rgba(${this.colors[2][0]},${this.colors[2][1]},${this.colors[2][2]},1)`,
						pointBackgroundColor: "#fff",
						pointBorderWidth: 1,
						pointHoverRadius: 4,
						pointHoverBackgroundColor: `rgba(${this.colors[2][0]},${this.colors[2][1]},${this.colors[2][2]},1)`,
						pointHoverBorderColor: "rgba(220,220,220,1)",
						pointHoverBorderWidth: 2,
						pointRadius: 2,
						pointHitRadius: 3,
						fill: false,
					}, {
						label: 'Avg sunshine/day',
						yAxisID: "duration",
						data: [
							...response.data.statisticsByMonth.map(item => ({
								x: moment(item.date).startOf('month'),
								y: item.avgSunshineMinutes
							}))
						],
						borderColor: `rgba(${this.colors[4][0]},${this.colors[4][1]},${this.colors[4][2]},1)`,
						borderCapStyle: 'butt',
						borderDash: [],
						borderDashOffset: 0.0,
						borderJoinStyle: 'miter',
						borderWidth: 2,
						pointBorderColor: `rgba(${this.colors[4][0]},${this.colors[4][1]},${this.colors[4][2]},1)`,
						pointBackgroundColor: "#fff",
						pointBorderWidth: 1,
						pointHoverRadius: 4,
						pointHoverBackgroundColor: `rgba(${this.colors[4][0]},${this.colors[4][1]},${this.colors[4][2]},1)`,
						pointHoverBorderColor: "rgba(220,220,220,1)",
						pointHoverBorderWidth: 2,
						pointRadius: 2,
						pointHitRadius: 3,
						fill: false,
					}];

					if (this.hasSolarFeature) {
						datasets.push({
							label: 'Avg radiator heating',
							yAxisID: "duration",
							data: [
								...response.data.statisticsByMonth.map(item => ({
									x: moment(item.date).startOf('month'),
									y: item.avgRadiatorRunningMinutes
								}))
							],
							borderColor: `rgba(${this.colors[5][0]},${this.colors[5][1]},${this.colors[5][2]},1)`,
							borderCapStyle: 'butt',
							borderDash: [],
							borderDashOffset: 0.0,
							borderJoinStyle: 'miter',
							borderWidth: 2,
							pointBorderColor: `rgba(${this.colors[5][0]},${this.colors[5][1]},${this.colors[5][2]},1)`,
							pointBackgroundColor: "#fff",
							pointBorderWidth: 1,
							pointHoverRadius: 4,
							pointHoverBackgroundColor: `rgba(${this.colors[5][0]},${this.colors[5][1]},${this.colors[5][2]},1)`,
							pointHoverBorderColor: "rgba(220,220,220,1)",
							pointHoverBorderWidth: 2,
							pointRadius: 2,
							pointHitRadius: 3,
							fill: false,
						})
					}

					new Chart(document.querySelector('#statisticsByMonth'), {
						type: 'line',
						data: {
							datasets
						},
						options: {
							maintainAspectRatio: false,
							responsive: true,
							tooltips: {
								intersect: true,
								mode: 'x',
								callbacks: {
									label: function(tooltipItem, data) {
										switch (tooltipItem.datasetIndex) {
											case 0:
											case 3:
											case 4:
												let str = '';
												const duration = moment.duration(tooltipItem.yLabel * 60 * 1000);

												str += `${duration.hours() || 0}h `;
												str += `${duration.minutes() || 0}m`;

												return `${data.datasets[tooltipItem.datasetIndex].label}: ${str.trim()}`;
											case 1:
											case 2:
												return `${data.datasets[tooltipItem.datasetIndex].label}: ${tooltipItem.yLabel.toFixed(1)}`;
										}
									}
								}
							},
							scales: {
								xAxes: [{
									type: 'time',
									time: {
										unit: 'month',
										tooltipFormat: 'YYYY MMM',
										unitStepSize: 1,
										displayFormats: {
											millisecond: 'SSS [ms]',
											second: 'h:mm:ss a',
											minute: 'h:mm:ss a',
											hour: 'HH:mm',
											day: 'MMM D',
											week: 'll',
											month: 'MMM YYYY',
											quarter: '[Q]Q - YYYY',
											year: 'YYYY'
										}
									}
								}],
								yAxes: [{
									id: "duration",
									ticks: {
										callback: value => {
											let str = '';

											const duration = moment.duration(value * 60 * 1000);

											str += `${duration.hours() || 0}h `;
											str += `${duration.minutes() || 0}m`;

											return str.trim();
										},
										fixedStepSize: 60,
										min: 0
									}
								}, {
									id: "temp",
									ticks: {
										callback: value => value,
										fixedStepSize: 2,
										min: Math.floor(Math.min(minTargetTemp, minAvgOutsideTemp)),
										max: Math.ceil(Math.max(maxTargetTemp, maxAvgOutsideTemp))
									},
									tooltipFormat: value => value.toFixed(1)
								}]
							}
						}
					});
				}


				if (response.data.statisticsByYear) {
					const minTargetTemp = Math.min(...response.data.statisticsByYear.map(item => item.avgTargetTemp));
					const maxTargetTemp = Math.max(...response.data.statisticsByYear.map(item => item.avgTargetTemp));

					const minAvgOutsideTemp = Math.min(...response.data.statisticsByYear.map(item => item.avgOutsideTemp));
					const maxAvgOutsideTemp = Math.max(...response.data.statisticsByYear.map(item => item.avgOutsideTemp));

					const datasets = [{
						label: 'Avg heating time',
						yAxisID: "duration",
						data: [
							...response.data.statisticsByYear.map(item => ({
								x: moment(item.year, 'YYYY').startOf('year'),
								y: item.avgRunningMinutes
							}))
						],
						backgroundColor: `rgba(${this.colors[0][0]},${this.colors[0][1]},${this.colors[0][2]},0.4)`,
						borderColor: `rgba(${this.colors[0][0]},${this.colors[0][1]},${this.colors[0][2]},1)`,
						borderCapStyle: 'butt',
						borderDash: [],
						borderDashOffset: 0.0,
						borderJoinStyle: 'miter',
						borderWidth: 2,
						pointBorderColor: `rgba(${this.colors[0][0]},${this.colors[0][1]},${this.colors[0][2]},1)`,
						pointBackgroundColor: "#fff",
						pointBorderWidth: 1,
						pointHoverRadius: 4,
						pointHoverBackgroundColor: `rgba(${this.colors[0][0]},${this.colors[0][1]},${this.colors[0][2]},1)`,
						pointHoverBorderColor: "rgba(220,220,220,1)",
						pointHoverBorderWidth: 2,
						pointRadius: 2,
						pointHitRadius: 3,
					}, {
						label: 'Avg target temp.',
						yAxisID: "temp",
						data: [
							...response.data.statisticsByYear.map(item => ({
								x: moment(item.year, 'YYYY').startOf('year'),
								y: item.avgTargetTemp
							}))
						],
						borderColor: `rgba(${this.colors[1][0]},${this.colors[1][1]},${this.colors[1][2]},1)`,
						borderCapStyle: 'butt',
						borderDash: [],
						borderDashOffset: 0.0,
						borderJoinStyle: 'miter',
						borderWidth: 2,
						pointBorderColor: `rgba(${this.colors[1][0]},${this.colors[1][1]},${this.colors[1][2]},1)`,
						pointBackgroundColor: "#fff",
						pointBorderWidth: 1,
						pointHoverRadius: 4,
						pointHoverBackgroundColor: `rgba(${this.colors[1][0]},${this.colors[1][1]},${this.colors[1][2]},1)`,
						pointHoverBorderColor: "rgba(220,220,220,1)",
						pointHoverBorderWidth: 2,
						pointRadius: 2,
						pointHitRadius: 3,
						fill: false,
					}, {
						label: 'Avg out temp.',
						yAxisID: "temp",
						data: [
							...response.data.statisticsByYear.map(item => ({
								x: moment(item.year, 'YYYY').startOf('year'),
								y: item.avgOutsideTemp
							}))
						],
						borderColor: `rgba(${this.colors[2][0]},${this.colors[2][1]},${this.colors[2][2]},1)`,
						borderCapStyle: 'butt',
						borderDash: [],
						borderDashOffset: 0.0,
						borderJoinStyle: 'miter',
						borderWidth: 2,
						pointBorderColor: `rgba(${this.colors[2][0]},${this.colors[2][1]},${this.colors[2][2]},1)`,
						pointBackgroundColor: "#fff",
						pointBorderWidth: 1,
						pointHoverRadius: 4,
						pointHoverBackgroundColor: `rgba(${this.colors[2][0]},${this.colors[2][1]},${this.colors[2][2]},1)`,
						pointHoverBorderColor: "rgba(220,220,220,1)",
						pointHoverBorderWidth: 2,
						pointRadius: 2,
						pointHitRadius: 3,
						fill: false,
					}, {
						label: 'Avg sunshine/day',
						yAxisID: "duration",
						data: [
							...response.data.statisticsByYear.map(item => ({
								x: moment(item.year, 'YYYY').startOf('year'),
								y: item.avgSunshineMinutes
							}))
						],
						borderColor: `rgba(${this.colors[4][0]},${this.colors[4][1]},${this.colors[4][2]},1)`,
						borderCapStyle: 'butt',
						borderDash: [],
						borderDashOffset: 0.0,
						borderJoinStyle: 'miter',
						borderWidth: 2,
						pointBorderColor: `rgba(${this.colors[4][0]},${this.colors[4][1]},${this.colors[4][2]},1)`,
						pointBackgroundColor: "#fff",
						pointBorderWidth: 1,
						pointHoverRadius: 4,
						pointHoverBackgroundColor: `rgba(${this.colors[4][0]},${this.colors[4][1]},${this.colors[4][2]},1)`,
						pointHoverBorderColor: "rgba(220,220,220,1)",
						pointHoverBorderWidth: 2,
						pointRadius: 2,
						pointHitRadius: 3,
						fill: false,
					}];

					if (this.hasSolarFeature) {
						datasets.push({
							label: 'Avg radiator heating',
							yAxisID: "duration",
							data: [
								...response.data.statisticsByYear.map(item => ({
									x: moment(item.year, 'YYYY').startOf('year'),
									y: item.avgSunshineMinutes
								}))
							],
							borderColor: `rgba(${this.colors[5][0]},${this.colors[5][1]},${this.colors[5][2]},1)`,
							borderCapStyle: 'butt',
							borderDash: [],
							borderDashOffset: 0.0,
							borderJoinStyle: 'miter',
							borderWidth: 2,
							pointBorderColor: `rgba(${this.colors[5][0]},${this.colors[5][1]},${this.colors[5][2]},1)`,
							pointBackgroundColor: "#fff",
							pointBorderWidth: 1,
							pointHoverRadius: 4,
							pointHoverBackgroundColor: `rgba(${this.colors[5][0]},${this.colors[5][1]},${this.colors[5][2]},1)`,
							pointHoverBorderColor: "rgba(220,220,220,1)",
							pointHoverBorderWidth: 2,
							pointRadius: 2,
							pointHitRadius: 3,
							fill: false,
						});
					}

					new Chart(document.querySelector('#statisticsByYear'), {
						type: 'line',
						data: {
							datasets
						},
						options: {
							maintainAspectRatio: false,
							responsive: true,
							tooltips: {
								intersect: true,
								mode: 'x',
								callbacks: {
									label: function(tooltipItem, data) {
										switch (tooltipItem.datasetIndex) {
											case 0:
											case 3:
											case 4:
												let str = '';
												const duration = moment.duration(tooltipItem.yLabel * 60 * 1000);

												str += `${duration.hours() || 0}h `;
												str += `${duration.minutes() || 0}m`;

												return `${data.datasets[tooltipItem.datasetIndex].label}: ${str.trim()}`;
											case 1:
											case 2:
												return `${data.datasets[tooltipItem.datasetIndex].label}: ${tooltipItem.yLabel.toFixed(1)}`;
										}
									}
								}
							},
							scales: {
								xAxes: [{
									type: 'time',
									time: {
										unit: 'year',
										tooltipFormat: 'YYYY',
										unitStepSize: 1,
										displayFormats: {
											millisecond: 'SSS [ms]',
											second: 'h:mm:ss a',
											minute: 'h:mm:ss a',
											hour: 'HH:mm',
											day: 'MMM D',
											week: 'll',
											month: 'MMM YYYY',
											quarter: '[Q]Q - YYYY',
											year: 'YYYY'
										}
									}
								}],
								yAxes: [{
									id: "duration",
									ticks: {
										callback: value => {
											let str = '';

											const duration = moment.duration(value * 60 * 1000);

											str += `${duration.hours() || 0}h `;
											str += `${duration.minutes() || 0}m`;

											return str.trim();
										},
										fixedStepSize: 60,
										min: 0
									}
								}, {
									id: "temp",
									ticks: {
										callback: value => value,
										fixedStepSize: 2,
										min: Math.floor(Math.min(minTargetTemp, minAvgOutsideTemp)),
										max: Math.ceil(Math.max(maxTargetTemp, maxAvgOutsideTemp))
									},
									tooltipFormat: value => value.toFixed(1)
								}]
							}
						}
					});
				}


				if (response.data.sensorTempHistory) {
					const minTemp = Math.min(...response.data.sensorTempHistory.map(item => item.t));
					const maxTemp = Math.max(...response.data.sensorTempHistory.map(item => item.t));

					const sensors = [];
					response.data.sensorTempHistory.forEach(sth => {
						if (!sensors.find(s => s._id === sth.sensor._id)) {
							sensors.push(sth.sensor);
						}
					});

					sensors.sort((a, b) => a.order - b.order);

					new Chart(document.querySelector('#sensorTempHistoryChart'), {
						type: 'line',
						data: {
							datasets: sensors.map((s, index) => ({
								label: s.label,
								yAxisID: "temp",
								data: [
									...response.data.sensorTempHistory.filter(sth => sth.sensor._id === s._id).map(item => ({
										x: this.timezoneService.toSameDateInCurrentTimezone(item.datetime, location.timezone),
										y: item.t
									}))
								],
								backgroundColor: `rgba(
									${this.colors[index % this.colors.length][0]},
									${this.colors[index % this.colors.length][1]},
									${this.colors[index % this.colors.length][2]},
									0.4
								)`,
								borderColor: `rgba(
									${this.colors[index % this.colors.length][0]},
									${this.colors[index % this.colors.length][1]},
									${this.colors[index % this.colors.length][2]},
									1
								)`,
								borderCapStyle: 'butt',
								borderDash: [],
								borderDashOffset: 0.0,
								borderJoinStyle: 'miter',
								borderWidth: 2,
								pointBorderColor: `rgba(
									${this.colors[index % this.colors.length][0]},
									${this.colors[index % this.colors.length][1]},
									${this.colors[index % this.colors.length][2]},
									1
								)`,
								pointBackgroundColor: "#fff",
								pointBorderWidth: 1,
								pointHoverRadius: 4,
								pointHoverBackgroundColor: `rgba(
									${this.colors[index % this.colors.length][0]},
									${this.colors[index % this.colors.length][1]},
									${this.colors[index % this.colors.length][2]},
									1
								)`,
								pointHoverBorderColor: "rgba(220,220,220,1)",
								pointHoverBorderWidth: 2,
								pointRadius: 2,
								pointHitRadius: 3,
								fill: false,
								tension: 0.3
							}))
						},
						options: {
							maintainAspectRatio: false,
							responsive: true,
							tooltips: {
								callbacks: {
									label: function(tooltipItem, data) {
										return `${data.datasets[tooltipItem.datasetIndex].label}: ${tooltipItem.yLabel.toFixed(1)}`;
									}
								}
							},
							scales: {
								xAxes: [{
									type: 'time',
									time: {
										unit: 'hour',
										tooltipFormat: 'MMM Do, HH:mm',
										unitStepSize: 1,
										displayFormats: {
											millisecond: 'SSS [ms]',
											second: 'h:mm:ss a',
											minute: 'h:mm:ss a',
											hour: 'HH:mm',
											day: 'MMM D',
											week: 'll',
											month: 'MMM YYYY',
											quarter: '[Q]Q - YYYY',
											year: 'YYYY'
										}
									}
								}],
								yAxes: [{
									id: "temp",
									ticks: {
										callback: value => value,
										// fixedStepSize: 2,
										min: parseFloat((minTemp - 0.1).toFixed(1)),
										max: parseFloat((maxTemp + 0.1).toFixed(1))
									},
									tooltipFormat: value => value.toFixed(1)
								}]
							}
						}
					});
				}
			}
		});
	}

}
