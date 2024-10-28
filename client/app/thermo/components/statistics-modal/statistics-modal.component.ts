import { Component, OnInit } from '@angular/core';
import { ThermoServerApiService } from '../../services/thermo-server-api.service';
import { Chart } from 'chart.js';
import moment from 'moment';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { TimezoneService } from '../../../shared/services/timezone.service';
import { LocationService } from '../../../services/location.service';
import { HeatingHoldConditionTypes } from '../../types/types';
import { ThermoDataStoreService } from '../../services/thermo-data-store.service';

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
					if (response.data.heatingForToday) {
						datasets.push({
							label: 'Heating status',
							data: response.data.heatingForToday.map(item => ({
								x: this.timezoneService.toSameDateInCurrentTimezone(item.datetime, location.timezone),
								y: item.status ? 10 : 0
							})),
							steppedLine: true,
							backgroundColor: `rgba(${this.colors[0][0]},${this.colors[0][1]},${this.colors[0][2]},0.4)`,
							borderColor: `rgba(${this.colors[0][0]},${this.colors[0][1]},${this.colors[0][2]},1)`,
							borderCapStyle: 'butt',
							borderDash: [],
							borderDashOffset: 0.0,
							borderJoinStyle: 'miter',
							pointBorderColor: `rgba(${this.colors[0][0]},${this.colors[0][1]},${this.colors[0][2]},1)`,
							pointBackgroundColor: "#fff",
							pointBorderWidth: 1,
							pointHoverRadius: 6,
							pointHoverBackgroundColor: `rgba(${this.colors[0][0]},${this.colors[0][1]},${this.colors[0][2]},1)`,
							pointHoverBorderColor: "rgba(220,220,220,1)",
							pointHoverBorderWidth: 2,
							pointRadius: 3,
							pointHitRadius: 5,
						});
					}

					if (response.data.heatingConditionsForToday) {
						if (response.data.heatingConditionsForToday[HeatingHoldConditionTypes.POWERED_OFF]) {
							datasets.push({
								label: 'Power off',
								data: response.data.heatingConditionsForToday[HeatingHoldConditionTypes.POWERED_OFF].map(item => ({
									x: this.timezoneService.toSameDateInCurrentTimezone(item.datetime, location.timezone),
									y: item.status ? 5 : 0
								})),
								steppedLine: true,
								backgroundColor: `rgba(${this.colors[1][0]},${this.colors[1][1]},${this.colors[1][2]},0.4)`,
								borderColor: `rgba(${this.colors[1][0]},${this.colors[1][1]},${this.colors[1][2]},1)`,
								borderCapStyle: 'butt',
								borderDash: [],
								borderDashOffset: 0.0,
								borderJoinStyle: 'miter',
								pointBorderColor: `rgba(${this.colors[1][0]},${this.colors[1][1]},${this.colors[1][2]},1)`,
								pointBackgroundColor: "#fff",
								pointBorderWidth: 1,
								pointHoverRadius: 6,
								pointHoverBackgroundColor: `rgba(${this.colors[1][0]},${this.colors[1][1]},${this.colors[1][2]},1)`,
								pointHoverBorderColor: "rgba(220,220,220,1)",
								pointHoverBorderWidth: 2,
								pointRadius: 3,
								pointHitRadius: 5,
							});
						}

						if (response.data.heatingConditionsForToday[HeatingHoldConditionTypes.WINDOW_OPEN]) {
							datasets.push({
								label: 'Window open',
								data: response.data.heatingConditionsForToday[HeatingHoldConditionTypes.WINDOW_OPEN].map(item => ({
									x: this.timezoneService.toSameDateInCurrentTimezone(item.datetime, location.timezone),
									y: item.status ? 5 : 0
								})),
								steppedLine: true,
								backgroundColor: `rgba(${this.colors[2][0]},${this.colors[2][1]},${this.colors[2][2]},0.4)`,
								borderColor: `rgba(${this.colors[2][0]},${this.colors[2][1]},${this.colors[2][2]},1)`,
								borderCapStyle: 'butt',
								borderDash: [],
								borderDashOffset: 0.0,
								borderJoinStyle: 'miter',
								pointBorderColor: `rgba(${this.colors[2][0]},${this.colors[2][1]},${this.colors[2][2]},1)`,
								pointBackgroundColor: "#fff",
								pointBorderWidth: 1,
								pointHoverRadius: 6,
								pointHoverBackgroundColor: `rgba(${this.colors[2][0]},${this.colors[2][1]},${this.colors[2][2]},1)`,
								pointHoverBorderColor: "rgba(220,220,220,1)",
								pointHoverBorderWidth: 2,
								pointRadius: 3,
								pointHitRadius: 5,
							});
						}

						if (this.dataStore.config.weatherForecastFeature &&
								response.data.heatingConditionsForToday[HeatingHoldConditionTypes.FAVORABLE_WEATHER_FORECAST]) {
							datasets.push({
								label: 'Favorable weather',
								data: response.data.heatingConditionsForToday[HeatingHoldConditionTypes.FAVORABLE_WEATHER_FORECAST].map(item => ({
									x: this.timezoneService.toSameDateInCurrentTimezone(item.datetime, location.timezone),
									y: item.status ? 5 : 0
								})),
								steppedLine: true,
								backgroundColor: `rgba(${this.colors[3][0]},${this.colors[3][1]},${this.colors[3][2]},0.4)`,
								borderColor: `rgba(${this.colors[3][0]},${this.colors[3][1]},${this.colors[3][2]},1)`,
								borderCapStyle: 'butt',
								borderDash: [],
								borderDashOffset: 0.0,
								borderJoinStyle: 'miter',
								pointBorderColor: `rgba(${this.colors[3][0]},${this.colors[3][1]},${this.colors[3][2]},1)`,
								pointBackgroundColor: "#fff",
								pointBorderWidth: 1,
								pointHoverRadius: 6,
								pointHoverBackgroundColor: `rgba(${this.colors[3][0]},${this.colors[3][1]},${this.colors[3][2]},1)`,
								pointHoverBorderColor: "rgba(220,220,220,1)",
								pointHoverBorderWidth: 2,
								pointRadius: 3,
								pointHitRadius: 5,
							});
						}

						if (this.dataStore.config.temperatureTrendsFeature &&
								response.data.heatingConditionsForToday[HeatingHoldConditionTypes.INCREASING_TREND]) {
							datasets.push({
								label: 'Increasing trend',
								data: response.data.heatingConditionsForToday[HeatingHoldConditionTypes.INCREASING_TREND].map(item => ({
									x: this.timezoneService.toSameDateInCurrentTimezone(item.datetime, location.timezone),
									y: item.status ? 5 : 0
								})),
								steppedLine: true,
								backgroundColor: `rgba(${this.colors[4][0]},${this.colors[4][1]},${this.colors[4][2]},0.4)`,
								borderColor: `rgba(${this.colors[4][0]},${this.colors[4][1]},${this.colors[4][2]},1)`,
								borderCapStyle: 'butt',
								borderDash: [],
								borderDashOffset: 0.0,
								borderJoinStyle: 'miter',
								pointBorderColor: `rgba(${this.colors[4][0]},${this.colors[4][1]},${this.colors[4][2]},1)`,
								pointBackgroundColor: "#fff",
								pointBorderWidth: 1,
								pointHoverRadius: 6,
								pointHoverBackgroundColor: `rgba(${this.colors[4][0]},${this.colors[4][1]},${this.colors[4][2]},1)`,
								pointHoverBorderColor: "rgba(220,220,220,1)",
								pointHoverBorderWidth: 2,
								pointRadius: 3,
								pointHitRadius: 5,
							});
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
									ticks: {
										callback: function(value) {
											return value === 0 ? 'OFF' : value === 5 ? 'ACTIVE' : value === 10 ? 'ON' : '';
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

				if (response.data.statisticsForLastMonth) {
					const minTargetTemp = Math.min(...response.data.statisticsForLastMonth.map(item => item.avgTargetTemp));
					const maxTargetTemp = Math.max(...response.data.statisticsForLastMonth.map(item => item.avgTargetTemp));

					const minAvgOutsideTemp = Math.min(...response.data.statisticsForLastMonth.map(item => item.avgOutsideTemp));
					const maxAvgOutsideTemp = Math.max(...response.data.statisticsForLastMonth.map(item => item.avgOutsideTemp));

					new Chart(document.querySelector('#statisticsLast30Days'), {
						type: 'line',
						data: {
							datasets: [{
								label: 'Heating running time',
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
								pointBorderColor: `rgba(${this.colors[0][0]},${this.colors[0][1]},${this.colors[0][2]},1)`,
								pointBackgroundColor: "#fff",
								pointBorderWidth: 1,
								pointHoverRadius: 6,
								pointHoverBackgroundColor: `rgba(${this.colors[0][0]},${this.colors[0][1]},${this.colors[0][2]},1)`,
								pointHoverBorderColor: "rgba(220,220,220,1)",
								pointHoverBorderWidth: 2,
								pointRadius: 3,
								pointHitRadius: 5,
							}, {
								label: 'Avg target temperature',
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
								pointBorderColor: `rgba(${this.colors[1][0]},${this.colors[1][1]},${this.colors[1][2]},1)`,
								pointBackgroundColor: "#fff",
								pointBorderWidth: 1,
								pointHoverRadius: 6,
								pointHoverBackgroundColor: `rgba(${this.colors[1][0]},${this.colors[1][1]},${this.colors[1][2]},1)`,
								pointHoverBorderColor: "rgba(220,220,220,1)",
								pointHoverBorderWidth: 2,
								pointRadius: 3,
								pointHitRadius: 5,
								fill: false,
							}, {
								label: 'Avg outside temperature',
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
								pointBorderColor: `rgba(${this.colors[2][0]},${this.colors[2][1]},${this.colors[2][2]},1)`,
								pointBackgroundColor: "#fff",
								pointBorderWidth: 1,
								pointHoverRadius: 6,
								pointHoverBackgroundColor: `rgba(${this.colors[2][0]},${this.colors[2][1]},${this.colors[2][2]},1)`,
								pointHoverBorderColor: "rgba(220,220,220,1)",
								pointHoverBorderWidth: 2,
								pointRadius: 3,
								pointHitRadius: 5,
								fill: false,
							}, {
								label: 'Avg sunshine a day',
								yAxisID: "duration2",
								data: [
									...response.data.statisticsForLastMonth.map(item => ({
										x: moment(item.date).startOf('day'),
										y: item.sunshineMinutes
									}))
								],
								backgroundColor: `rgba(${this.colors[3][0]},${this.colors[3][1]},${this.colors[3][2]},0.4)`,
								borderColor: `rgba(${this.colors[3][0]},${this.colors[3][1]},${this.colors[3][2]},1)`,
								borderCapStyle: 'butt',
								borderDash: [],
								borderDashOffset: 0.0,
								borderJoinStyle: 'miter',
								pointBorderColor: `rgba(${this.colors[3][0]},${this.colors[3][1]},${this.colors[3][2]},1)`,
								pointBackgroundColor: "#fff",
								pointBorderWidth: 1,
								pointHoverRadius: 6,
								pointHoverBackgroundColor: `rgba(${this.colors[3][0]},${this.colors[3][1]},${this.colors[3][2]},1)`,
								pointHoverBorderColor: "rgba(220,220,220,1)",
								pointHoverBorderWidth: 2,
								pointRadius: 3,
								pointHitRadius: 5,
							}]
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
									id: "duration2",
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

					new Chart(document.querySelector('#statisticsByMonth'), {
						type: 'line',
						data: {
							datasets: [{
								label: 'Avg heating running time',
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
								pointBorderColor: `rgba(${this.colors[0][0]},${this.colors[0][1]},${this.colors[0][2]},1)`,
								pointBackgroundColor: "#fff",
								pointBorderWidth: 1,
								pointHoverRadius: 6,
								pointHoverBackgroundColor: `rgba(${this.colors[0][0]},${this.colors[0][1]},${this.colors[0][2]},1)`,
								pointHoverBorderColor: "rgba(220,220,220,1)",
								pointHoverBorderWidth: 2,
								pointRadius: 3,
								pointHitRadius: 5,
							}, {
								label: 'Avg target temperature',
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
								pointBorderColor: `rgba(${this.colors[1][0]},${this.colors[1][1]},${this.colors[1][2]},1)`,
								pointBackgroundColor: "#fff",
								pointBorderWidth: 1,
								pointHoverRadius: 6,
								pointHoverBackgroundColor: `rgba(${this.colors[1][0]},${this.colors[1][1]},${this.colors[1][2]},1)`,
								pointHoverBorderColor: "rgba(220,220,220,1)",
								pointHoverBorderWidth: 2,
								pointRadius: 3,
								pointHitRadius: 5,
								fill: false,
							}, {
								label: 'Avg outside temperature',
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
								pointBorderColor: `rgba(${this.colors[2][0]},${this.colors[2][1]},${this.colors[2][2]},1)`,
								pointBackgroundColor: "#fff",
								pointBorderWidth: 1,
								pointHoverRadius: 6,
								pointHoverBackgroundColor: `rgba(${this.colors[2][0]},${this.colors[2][1]},${this.colors[2][2]},1)`,
								pointHoverBorderColor: "rgba(220,220,220,1)",
								pointHoverBorderWidth: 2,
								pointRadius: 3,
								pointHitRadius: 5,
								fill: false,
							}, {
								label: 'Avg sunshine a day',
								yAxisID: "duration2",
								data: [
									...response.data.statisticsForLastMonth.map(item => ({
										x: moment(item.date).startOf('month'),
										y: item.sunshineMinutes
									}))
								],
								backgroundColor: `rgba(${this.colors[3][0]},${this.colors[3][1]},${this.colors[3][2]},0.4)`,
								borderColor: `rgba(${this.colors[3][0]},${this.colors[3][1]},${this.colors[3][2]},1)`,
								borderCapStyle: 'butt',
								borderDash: [],
								borderDashOffset: 0.0,
								borderJoinStyle: 'miter',
								pointBorderColor: `rgba(${this.colors[3][0]},${this.colors[3][1]},${this.colors[3][2]},1)`,
								pointBackgroundColor: "#fff",
								pointBorderWidth: 1,
								pointHoverRadius: 6,
								pointHoverBackgroundColor: `rgba(${this.colors[3][0]},${this.colors[3][1]},${this.colors[3][2]},1)`,
								pointHoverBorderColor: "rgba(220,220,220,1)",
								pointHoverBorderWidth: 2,
								pointRadius: 3,
								pointHitRadius: 5,
							}]
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
									id: "duration2",
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

					new Chart(document.querySelector('#statisticsByYear'), {
						type: 'line',
						data: {
							datasets: [{
								label: 'Avg heating running time',
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
								pointBorderColor: `rgba(${this.colors[0][0]},${this.colors[0][1]},${this.colors[0][2]},1)`,
								pointBackgroundColor: "#fff",
								pointBorderWidth: 1,
								pointHoverRadius: 6,
								pointHoverBackgroundColor: `rgba(${this.colors[0][0]},${this.colors[0][1]},${this.colors[0][2]},1)`,
								pointHoverBorderColor: "rgba(220,220,220,1)",
								pointHoverBorderWidth: 2,
								pointRadius: 3,
								pointHitRadius: 5,
							}, {
								label: 'Avg target temperature',
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
								pointBorderColor: `rgba(${this.colors[1][0]},${this.colors[1][1]},${this.colors[1][2]},1)`,
								pointBackgroundColor: "#fff",
								pointBorderWidth: 1,
								pointHoverRadius: 6,
								pointHoverBackgroundColor: `rgba(${this.colors[1][0]},${this.colors[1][1]},${this.colors[1][2]},1)`,
								pointHoverBorderColor: "rgba(220,220,220,1)",
								pointHoverBorderWidth: 2,
								pointRadius: 3,
								pointHitRadius: 5,
								fill: false,
							}, {
								label: 'Avg outside temperature',
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
								pointBorderColor: `rgba(${this.colors[2][0]},${this.colors[2][1]},${this.colors[2][2]},1)`,
								pointBackgroundColor: "#fff",
								pointBorderWidth: 1,
								pointHoverRadius: 6,
								pointHoverBackgroundColor: `rgba(${this.colors[2][0]},${this.colors[2][1]},${this.colors[2][2]},1)`,
								pointHoverBorderColor: "rgba(220,220,220,1)",
								pointHoverBorderWidth: 2,
								pointRadius: 3,
								pointHitRadius: 5,
								fill: false,
							}, {
								label: 'Avg sunshine a day',
								yAxisID: "duration2",
								data: [
									...response.data.statisticsByYear.map(item => ({
										x: moment(item.year, 'YYYY').startOf('year'),
										y: item.avgSunshineMinutes
									}))
								],
								backgroundColor: `rgba(${this.colors[3][0]},${this.colors[3][1]},${this.colors[3][2]},0.4)`,
								borderColor: `rgba(${this.colors[3][0]},${this.colors[3][1]},${this.colors[3][2]},1)`,
								borderCapStyle: 'butt',
								borderDash: [],
								borderDashOffset: 0.0,
								borderJoinStyle: 'miter',
								pointBorderColor: `rgba(${this.colors[3][0]},${this.colors[3][1]},${this.colors[3][2]},1)`,
								pointBackgroundColor: "#fff",
								pointBorderWidth: 1,
								pointHoverRadius: 6,
								pointHoverBackgroundColor: `rgba(${this.colors[3][0]},${this.colors[3][1]},${this.colors[3][2]},1)`,
								pointHoverBorderColor: "rgba(220,220,220,1)",
								pointHoverBorderWidth: 2,
								pointRadius: 3,
								pointHitRadius: 5,
							}]
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
									id: "duration2",
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
								pointBorderColor: `rgba(
									${this.colors[index % this.colors.length][0]},
									${this.colors[index % this.colors.length][1]},
									${this.colors[index % this.colors.length][2]},
									1
								)`,
								pointBackgroundColor: "#fff",
								pointBorderWidth: 1,
								pointHoverRadius: 6,
								pointHoverBackgroundColor: `rgba(
									${this.colors[index % this.colors.length][0]},
									${this.colors[index % this.colors.length][1]},
									${this.colors[index % this.colors.length][2]},
									1
								)`,
								pointHoverBorderColor: "rgba(220,220,220,1)",
								pointHoverBorderWidth: 2,
								pointRadius: 3,
								pointHitRadius: 5,
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
