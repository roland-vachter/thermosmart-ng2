import { Component, OnInit } from '@angular/core';
import { ThermoServerApiService } from '../../services/thermo-server-api.service';
import { Chart } from 'chart.js';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import * as moment from 'moment';

@Component({
	selector: 'app-statistics-modal',
	templateUrl: './statistics-modal.component.html',
	styleUrls: ['./statistics-modal.component.scss']
})
export class StatisticsModalComponent implements OnInit {
	constructor(
			private serverApiService: ThermoServerApiService,
			public bsModalRef: BsModalRef) { }

	ngOnInit() {
		this.serverApiService.statistics().subscribe((response: any) => {
			if (response.data) {
				if (response.data.statisticsForToday) {
					new Chart(document.querySelector('#heatingHistoryChart'), {
						type: 'line',
						data: {
							datasets: [{
								label: 'Heating status',
								data: response.data.statisticsForToday.map(item => {return {x: item.datetime, y: item.status ? 10 : 0}; }),
								steppedLine: true,
								backgroundColor: "rgba(75,192,192,0.4)",
								borderColor: "rgba(75,192,192,1)",
								borderCapStyle: 'butt',
								borderDash: [],
								borderDashOffset: 0.0,
								borderJoinStyle: 'miter',
								pointBorderColor: "rgba(75,192,192,1)",
								pointBackgroundColor: "#fff",
								pointBorderWidth: 1,
								pointHoverRadius: 6,
								pointHoverBackgroundColor: "rgba(75,192,192,1)",
								pointHoverBorderColor: "rgba(220,220,220,1)",
								pointHoverBorderWidth: 2,
								pointRadius: 3,
								pointHitRadius: 9,
							}]
						},
						options: {
							maintainAspectRatio: false,
							responsive: true,
							tooltips: {
								callbacks: {
									label: function(tooltipItem, data) {
										if (tooltipItem.yLabel === 10) {
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
									...response.data.statisticsForLastMonth.map(item => {return {x: item.date, y: item.runningMinutes}; })
								],
								backgroundColor: "rgba(75,192,192,0.4)",
								borderColor: "rgba(75,192,192,1)",
								borderCapStyle: 'butt',
								borderDash: [],
								borderDashOffset: 0.0,
								borderJoinStyle: 'miter',
								pointBorderColor: "rgba(75,192,192,1)",
								pointBackgroundColor: "#fff",
								pointBorderWidth: 1,
								pointHoverRadius: 6,
								pointHoverBackgroundColor: "rgba(75,192,192,1)",
								pointHoverBorderColor: "rgba(220,220,220,1)",
								pointHoverBorderWidth: 2,
								pointRadius: 3,
								pointHitRadius: 9,
							}, {
								label: 'Avg target temperature',
								yAxisID: "temp",
								data: [
									...response.data.statisticsForLastMonth.map(item => {return {x: item.date, y: item.avgTargetTemp}; })
								],
								borderColor: "rgba(255,116,0,1)",
								borderCapStyle: 'butt',
								borderDash: [],
								borderDashOffset: 0.0,
								borderJoinStyle: 'miter',
								pointBorderColor: "rgba(255,116,0,1)",
								pointBackgroundColor: "#fff",
								pointBorderWidth: 1,
								pointHoverRadius: 6,
								pointHoverBackgroundColor: "rgba(255,116,0,1)",
								pointHoverBorderColor: "rgba(220,220,220,1)",
								pointHoverBorderWidth: 2,
								pointRadius: 3,
								pointHitRadius: 9,
								fill: false,
							}, {
								label: 'Avg outside temperature',
								yAxisID: "temp",
								data: [
									...response.data.statisticsForLastMonth.map(item => {return {x: item.date, y: item.avgOutsideTemp}; })
								],
								borderColor: "rgba(115,136,10,1)",
								borderCapStyle: 'butt',
								borderDash: [],
								borderDashOffset: 0.0,
								borderJoinStyle: 'miter',
								pointBorderColor: "rgba(115,136,10,1)",
								pointBackgroundColor: "#fff",
								pointBorderWidth: 1,
								pointHoverRadius: 6,
								pointHoverBackgroundColor: "rgba(115,136,10,1)",
								pointHoverBorderColor: "rgba(220,220,220,1)",
								pointHoverBorderWidth: 2,
								pointRadius: 3,
								pointHitRadius: 9,
								fill: false,
							}]
						},
						options: {
							maintainAspectRatio: false,
							responsive: true,
							tooltips: {
								mode: 'x',
								intersect: true,
								callbacks: {
									label: function(tooltipItem, data) {
										switch (tooltipItem.datasetIndex) {
											case 0:
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

					new Chart(document.querySelector('#statisticsByMonth'), {
						type: 'line',
						data: {
							datasets: [{
								label: 'Avg heating running time',
								yAxisID: "duration",
								data: [
									...response.data.statisticsByMonth.map(item => {return {x: item.date, y: item.avgRunningMinutes}; })
								],
								backgroundColor: "rgba(75,192,192,0.4)",
								borderColor: "rgba(75,192,192,1)",
								borderCapStyle: 'butt',
								borderDash: [],
								borderDashOffset: 0.0,
								borderJoinStyle: 'miter',
								pointBorderColor: "rgba(75,192,192,1)",
								pointBackgroundColor: "#fff",
								pointBorderWidth: 1,
								pointHoverRadius: 6,
								pointHoverBackgroundColor: "rgba(75,192,192,1)",
								pointHoverBorderColor: "rgba(220,220,220,1)",
								pointHoverBorderWidth: 2,
								pointRadius: 3,
								pointHitRadius: 9,
							}, {
								label: 'Avg target temperature',
								yAxisID: "temp",
								data: [
									...response.data.statisticsByMonth.map(item => {return {x: item.date, y: item.avgTargetTemp}; })
								],
								borderColor: "rgba(255,116,0,1)",
								borderCapStyle: 'butt',
								borderDash: [],
								borderDashOffset: 0.0,
								borderJoinStyle: 'miter',
								pointBorderColor: "rgba(255,116,0,1)",
								pointBackgroundColor: "#fff",
								pointBorderWidth: 1,
								pointHoverRadius: 6,
								pointHoverBackgroundColor: "rgba(255,116,0,1)",
								pointHoverBorderColor: "rgba(220,220,220,1)",
								pointHoverBorderWidth: 2,
								pointRadius: 3,
								pointHitRadius: 9,
								fill: false,
							}, {
								label: 'Avg outside temperature',
								yAxisID: "temp",
								data: [
									...response.data.statisticsByMonth.map(item => {return {x: item.date, y: item.avgOutsideTemp}; })
								],
								borderColor: "rgba(115,136,10,1)",
								borderCapStyle: 'butt',
								borderDash: [],
								borderDashOffset: 0.0,
								borderJoinStyle: 'miter',
								pointBorderColor: "rgba(115,136,10,1)",
								pointBackgroundColor: "#fff",
								pointBorderWidth: 1,
								pointHoverRadius: 6,
								pointHoverBackgroundColor: "rgba(115,136,10,1)",
								pointHoverBorderColor: "rgba(220,220,220,1)",
								pointHoverBorderWidth: 2,
								pointRadius: 3,
								pointHitRadius: 9,
								fill: false,
							}]
						},
						options: {
							maintainAspectRatio: false,
							responsive: true,
							tooltips: {
								mode: 'x',
								intersect: true,
								callbacks: {
									label: function(tooltipItem, data) {
										switch (tooltipItem.datasetIndex) {
											case 0:
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
			}
		});
	}

}
