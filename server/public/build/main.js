/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	
	__webpack_require__(1);
	
	__webpack_require__(4);
	__webpack_require__(5);
	__webpack_require__(6);
	__webpack_require__(11);
	__webpack_require__(12);
	
	__webpack_require__(13);
	
	__webpack_require__(15);

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	
	var assetsDomain = __webpack_require__(2);
	var fingerprint = __webpack_require__(3);
	
	exports.inApp = assetsDomain + '/assets/' + fingerprint + '/';
	exports.bower = assetsDomain + '/assets/bower/' + fingerprint + '/';

/***/ }),
/* 2 */
/***/ (function(module, exports) {

	"use strict";
	
	module.exports = "";

/***/ }),
/* 3 */
/***/ (function(module, exports) {

	"use strict";
	
	module.exports = "ECsZBWQDTG";

/***/ }),
/* 4 */
/***/ (function(module, exports) {

	/* global angular */
	
	"use strict";
	
	module.exports = angular.module('thermoSmart', ['ngRoute', 'ui.bootstrap']);

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

	/* global $, io */
	
	"use strict";
	
	var _module = __webpack_require__(4);
	
	_module.service('socketio', function ($rootScope) {
		var socket = io.connect('/frontend');
		return {
			on: function on(eventName, callback) {
				socket.on(eventName, function () {
					var args = arguments;
					$rootScope.$apply(function () {
						callback.apply(socket, args);
					});
				});
			},
			emit: function emit(eventName, data, callback) {
				socket.emit(eventName, data, function () {
					var args = arguments;
					$rootScope.$apply(function () {
						if (callback) {
							callback.apply(socket, args);
						}
					});
				});
			}
		};
	});
	
	_module.service('loginStatus', function ($http) {
		var url = '/login/facebook/checkstatus';
	
		return {
			check: function check() {
				$http.get(url).then(function () {
					// do nothing, user is logged in
				}, function () {
					document.location.reload();
				});
			}
		};
	});
	
	_module.service('passcode', function () {
		console.log('service initialized');
	
		var passCodeEl = $('#security-passcode');
		var passCodeEvt = $({});
		var modalOpen = false;
	
		var securityKeypadModal = $('.security-keypad--modal');
	
		var changeValue = function changeValue(value) {
			passCodeEl.removeClass('color-border-red');
			passCodeEl.val(value);
			passCodeEvt.trigger('change', value);
	
			if (passCodeEl.val().length === 4) {
				if (passCodeEl.val() === '1423') {
					passCodeEvt.trigger('valid');
				} else {
					passCodeEvt.trigger('invalid');
					passCodeEl.addClass('color-border-red');
				}
			}
		};
	
		var onKeyPress = function onKeyPress(key) {
			var numberKey = parseInt(key, 10);
			if (numberKey >= 0 && numberKey <= 9) {
				if (passCodeEl.val().length >= 4) {
					changeValue('');
				}
	
				changeValue(passCodeEl.val() + '' + numberKey);
			}
	
			if (key === 'Backspace') {
				changeValue(passCodeEl.val().substr(0, passCodeEl.val().length - 1));
			}
	
			if (key === 'Delete') {
				changeValue('');
			}
		};
	
		document.addEventListener('keyup', function (evt) {
			if (modalOpen) {
				onKeyPress(evt.key);
			}
		});
	
		securityKeypadModal.on('click', function (evt) {
			onKeyPress(evt.target.getAttribute('data-value'));
		});
	
		securityKeypadModal.on('show.bs.modal', function () {
			modalOpen = true;
	
			changeValue('');
		});
	
		securityKeypadModal.on('hide.bs.modal', function () {
			modalOpen = false;
	
			passCodeEvt.trigger('closed');
	
			changeValue('');
		});
	
		return {
			check: function check() {
				return new Promise(function (resolve) {
					securityKeypadModal.modal('show');
	
					var onValid = function onValid() {
						passCodeEvt.off('valid', onValid);
						passCodeEvt.off('closed', onClosed);
	
						resolve({
							status: 'valid'
						});
						securityKeypadModal.modal('hide');
					};
	
					var onClosed = function onClosed() {
						passCodeEvt.off('valid', onValid);
						passCodeEvt.off('closed', onClosed);
	
						resolve({
							status: 'closed'
						});
					};
	
					passCodeEvt.on('valid', onValid);
					passCodeEvt.on('closed', onClosed);
				});
			}
		};
	});

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	__webpack_require__(7);
	__webpack_require__(9);
	__webpack_require__(10);

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

	/* global $ */
	
	'use strict';
	
	var _module = __webpack_require__(4);
	var helpers = __webpack_require__(8);
	
	var SECURITY_STATUSES = {
		DISARMED: 'disarmed',
		ARMING: 'arming',
		ARMED: 'armed',
		PREACTIVATED: 'preactivated',
		ACTIVATED: 'activated'
	};
	
	var SECURITY_ARMED_STATUSES = [SECURITY_STATUSES.ARMED, SECURITY_STATUSES.PREACTIVATED, SECURITY_STATUSES.ACTIVATED];
	
	var processPlanForDisplay = function processPlanForDisplay(heatingPlan) {
		var lastPercent = 0;
	
		heatingPlan.intervals.forEach(function (interval, index) {
			if (index === 0) {
				interval.label = '';
				interval.labelPosition = 0;
				interval.blockPosition = 0;
			} else {
				var percentInDay = helpers.getPercentInDay(interval.startHour, interval.startMinute);
	
				interval.label = helpers.pad(interval.startHour, 2) + ':' + helpers.pad(interval.startMinute, 2);
				interval.labelPosition = percentInDay;
	
				heatingPlan.intervals[index - 1].blockPosition = percentInDay - lastPercent;
	
				lastPercent = percentInDay;
			}
		});
	
		if (heatingPlan.intervals.length) {
			heatingPlan.intervals[heatingPlan.intervals.length - 1].blockPosition = 100 - lastPercent;
		}
	};
	
	var getCurrentTemp = function getCurrentTemp(todaysPlan) {
		var temp = null;
		var today = new Date();
	
		todaysPlan.intervals.forEach(function (interval) {
			if (today.getHours() > interval.startHour || today.getHours() === interval.startHour && today.getMinutes() >= interval.startMinute) {
				temp = interval.temp;
			}
		});
	
		return temp;
	};
	
	var updateView = function updateView($scope) {
		var d = new Date();
		$scope.percentInDay = helpers.getPercentInDay();
		$scope.currentTime = helpers.pad(d.getHours(), 2) + ':' + helpers.pad(d.getMinutes(), 2);
		$scope.currentDate = d;
	
		$scope.targetTemp = getCurrentTemp($scope.todaysPlan.plan.ref);
	};
	
	_module.controller('mainCtrl', ['$scope', '$http', '$uibModal', 'socketio', 'loginStatus', 'passcode', function ($scope, $http, $uibModal, socketio, loginStatus, passcode) {
		loginStatus.check();
	
		$scope.lastUpdate = null;
	
		$scope.security = SECURITY_STATUSES.DISARMED;
	
		$scope.SECURITY_STATUSES = SECURITY_STATUSES;
		$scope.SECURITY_ARMED_STATUSES = SECURITY_ARMED_STATUSES;
	
		$scope.targetTemp = 0;
	
		$scope.inside = {
			temp: 0,
			humi: 0
		};
	
		$scope.outside = {
			temp: 0,
			humi: 0,
			weatherIconClass: ''
		};
	
		$scope.temps = {};
		$scope.heatingPlans = {};
		$scope.heatingDefaultPlans = {};
		$scope.todaysPlan = {};
		$scope.isHeatingOn = false;
		$scope.init = false;
		$scope.statisticsForToday = {
			heatingDuration: 0
		};
	
		$scope.initInProgress = false;
		$scope.restartSensorInProgress = false;
	
		var dayNameByIndex = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	
		$scope.statisticsModalOpen = function () {
			$uibModal.open({
				templateUrl: 'views/statistics-modal.html',
				controller: 'modalStatisticsCtrl',
				size: 'lg'
			}).result.then(function () {}, function () {});
		};
	
		$scope.openModalChangeSensorLabel = function (id) {
			$uibModal.open({
				templateUrl: 'views/change-sensor-label.html',
				controller: 'modalSensorLabelCtrl',
				size: 'sm',
				resolve: {
					content: function content() {
						return {
							id: id,
							label: $scope.inside.individual[id].label
						};
					}
				}
			}).result.then(function (results) {
				$http.post('/api/changesensorlabel', {
					id: results.id,
					label: results.label || $scope.inside.individual[id].label
				});
			}, function () {});
		};
	
		$scope.toggleSensorStatus = function (id) {
			$http.post('/api/togglesensorstatus', {
				id: id
			});
		};
	
		var handleServerData = function handleServerData(data) {
			$scope.lastUpdate = new Date();
	
			if (typeof data.restartSensorInProgress === 'boolean') {
				$scope.restartSensorInProgress = data.restartSensorInProgress;
			}
	
			if (data.outside) {
				$scope.outside.temp = data.outside.temperature;
				$scope.outside.humi = data.outside.humidity;
				$scope.outside.weatherIconClass = data.outside.weatherIconClass;
	
				if (data.outside.backgroundImage) {
					document.body.style.backgroundImage = document.body.style.backgroundImage.substring(0, document.body.style.backgroundImage.lastIndexOf('/') + 1) + data.outside.backgroundImage;
				}
			}
	
			if (data.inside) {
				var ids = Object.keys(data.inside);
	
				$scope.inside.temp = 0;
				$scope.inside.humi = 0;
	
				var activeCount = 0;
				ids.forEach(function (id) {
					if (data.inside[id].active && data.inside[id].enabled) {
						$scope.inside.temp += data.inside[id].temperature;
						$scope.inside.humi += data.inside[id].humidity;
	
						activeCount++;
					}
				});
	
				$scope.inside.temp = $scope.inside.temp / activeCount;
				$scope.inside.humi = Math.round($scope.inside.humi / activeCount);
	
				$scope.inside.individual = data.inside;
			}
	
			if (typeof data.isHeatingOn === 'boolean') {
				$scope.isHeatingOn = data.isHeatingOn;
			}
	
			if (data.temperatures) {
				data.temperatures.forEach(function (temp) {
					if (!$scope.temps[temp._id]) {
						$scope.temps[temp._id] = {};
					}
	
					$scope.temps[temp._id].ref = temp;
				});
			}
	
			if (data.heatingPlans) {
				data.heatingPlans.forEach(function (heatingPlan) {
					if (!$scope.heatingPlans[heatingPlan._id]) {
						$scope.heatingPlans[heatingPlan._id] = {};
					}
	
					$scope.heatingPlans[heatingPlan._id].ref = Object.assign({}, heatingPlan);
	
					heatingPlan.intervals.forEach(function (override) {
						override.temp = $scope.temps[override.temp];
					});
	
					processPlanForDisplay(heatingPlan);
				});
			}
	
			if (data.heatingDefaultPlans) {
				data.heatingDefaultPlans.forEach(function (heatingPlan) {
					if (!$scope.heatingDefaultPlans[heatingPlan.dayOfWeek]) {
						$scope.heatingDefaultPlans[heatingPlan.dayOfWeek] = {};
					}
	
					$scope.heatingDefaultPlans[heatingPlan.dayOfWeek] = Object.assign({}, heatingPlan);
	
					$scope.heatingDefaultPlans[heatingPlan.dayOfWeek].plan = $scope.heatingPlans[heatingPlan.plan];
					$scope.heatingDefaultPlans[heatingPlan.dayOfWeek].nameOfDay = dayNameByIndex[heatingPlan.dayOfWeek];
				});
			}
	
			if (data.statisticsForToday) {
				$scope.statisticsForToday = data.statisticsForToday;
			}
	
			if (data.security) {
				$scope.security = data.security.status;
			}
	
			$scope.todaysPlan = $scope.heatingDefaultPlans[new Date().getDay()];
			updateView($scope);
		};
	
		var init = function init() {
			$scope.initInProgress = true;
	
			$http.get('/api/init?_=' + new Date().getTime()).then(function (response) {
				if (response.data && response.data.data) {
					var data = response.data.data;
	
					handleServerData(data);
	
					$scope.todaysPlan = $scope.heatingDefaultPlans[new Date().getDay()];
	
					updateView($scope);
	
					if (!$scope.init) {
						setInterval(function () {
							updateView($scope);
						}, 60000);
					}
	
					$scope.init = true;
	
					/*$(".responsive-calendar").responsiveCalendar({
	    	time: '2016-12',
	    	events: {
	    		"2016-12-30": {
	    			"number": 5,
	    			"url": "http://w3widgets.com/responsive-slider"
	    		},
	    		"2016-12-26": {
	    			"number": 1,
	    			"url": "http://w3widgets.com"
	    		},
	    		"2016-12-03": {
	    			number: ' ',
	    			badgeClass: "icon-work"
	    		},
	    		"2016-12-12": {}
	    	}
	    });*/
				}
	
				$scope.initInProgress = false;
			}, function (err) {
				$scope.initInProgress = false;
				console.log(err);
			});
		};
	
		socketio.on('update', handleServerData);
	
		$scope.tempAdjust = function (id, value) {
			$scope.temps[id].ref.value += value;
			$scope.temps[id].ref.value = parseFloat($scope.temps[id].ref.value.toFixed(1));
	
			$http.post('/api/tempadjust', {
				_id: id,
				value: $scope.temps[id].ref.value
			});
		};
	
		$scope.restartSensor = function () {
			$http.post('/api/restartsensor');
		};
	
		$scope.securityToggleAlarm = function () {
			passcode.check().then(function (result) {
				if (result.status === 'valid') {
					$http.post('/api/securitytogglealarm');
	
					switch ($scope.security) {
						case SECURITY_STATUSES.DISARMED:
							$scope.security = SECURITY_STATUSES.ARMING;
							break;
	
						case SECURITY_STATUSES.ARMING:
							$scope.security = SECURITY_STATUSES.DISARMED;
							break;
	
						default:
							$scope.security = SECURITY_STATUSES.DISARMED;
							break;
					}
				}
			});
		};
	
		var selectedDayOfWeekToChange = null;
		var selectPlanModal = $('.thermo-select-plan--modal');
		selectPlanModal.on('show.bs.modal', function (e) {
			var srcEl = e.relatedTarget;
	
			if (srcEl.getAttribute('data-default-week-plan')) {
				selectedDayOfWeekToChange = srcEl.getAttribute('data-default-week-plan');
			}
		});
		selectPlanModal.on('hide.bs.modal', function () {
			selectedDayOfWeekToChange = null;
		});
	
		$scope.selectPlan = function (planId) {
			if (selectedDayOfWeekToChange) {
				$http.post('/api/changedefaultplan', {
					dayOfWeek: selectedDayOfWeekToChange,
					planId: planId
				});
	
				selectPlanModal.modal('hide');
			}
		};
	
		$scope.scope = function () {
			return $scope;
		};
	
		$scope.refresh = function () {
			init();
		};
	
		init();
	}]);

/***/ }),
/* 8 */
/***/ (function(module, exports) {

	"use strict";
	
	function pad(num, size) {
		var s = num + "";
		while (s.length < size) {
			s = "0" + s;
		}return s;
	}
	
	var getPercentInDay = function getPercentInDay(hour, minute) {
		if (hour === undefined || minute === undefined) {
			var now = new Date();
			hour = now.getHours();
			minute = now.getMinutes();
		}
	
		var percentInDay = (hour * 60 + minute) * 100 / 1440;
	
		return percentInDay;
	};
	
	module.exports = {
		getPercentInDay: getPercentInDay,
		pad: pad
	};

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

	/* global Chart, moment */
	
	'use strict';
	
	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
	
	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }
	
	var _module = __webpack_require__(4);
	
	_module.controller('modalStatisticsCtrl', ['$scope', '$http', 'loginStatus', function ($scope, $http, loginStatus) {
		loginStatus.check();
	
		$scope.initInProgress = false;
	
		var handleServerData = function handleServerData(data) {
			if (data.statisticsForLastMonth && data.statisticsForLastMonth.length) {
				var minTargetTemp = Math.min.apply(Math, _toConsumableArray(data.statisticsForLastMonth.map(function (item) {
					return item.avgTargetTemp;
				}))).toFixed(1);
				var maxTargetTemp = Math.max.apply(Math, _toConsumableArray(data.statisticsForLastMonth.map(function (item) {
					return item.avgTargetTemp;
				}))).toFixed(1);
	
				var minAvgOutsideTemp = Math.min.apply(Math, _toConsumableArray(data.statisticsForLastMonth.map(function (item) {
					return item.avgOutsideTemp;
				}))).toFixed(1);
				var maxAvgOutsideTemp = Math.max.apply(Math, _toConsumableArray(data.statisticsForLastMonth.map(function (item) {
					return item.avgOutsideTemp;
				}))).toFixed(1);
	
				new Chart(document.querySelector('#statisticsLast30Days'), _defineProperty({
					type: 'line',
					options: {
						maintainAspectRatio: false,
						responsive: true
					},
					data: {
						datasets: [{
							label: 'Heating running time',
							yAxisID: "duration",
							data: [].concat(_toConsumableArray(data.statisticsForLastMonth.map(function (item) {
								return { x: item.date, y: item.runningMinutes };
							}))),
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
							pointHitRadius: 9
						}, {
							label: 'Avg target temperature',
							yAxisID: "temp",
							data: [].concat(_toConsumableArray(data.statisticsForLastMonth.map(function (item) {
								return { x: item.date, y: item.avgTargetTemp };
							}))),
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
							fill: false
						}, {
							label: 'Avg outside temperature',
							yAxisID: "temp",
							data: [].concat(_toConsumableArray(data.statisticsForLastMonth.map(function (item) {
								return { x: item.date, y: item.avgOutsideTemp };
							}))),
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
							fill: false
						}]
					}
				}, 'options', {
					tooltips: {
						mode: 'x',
						intersect: true,
						callbacks: {
							label: function label(tooltipItem, data) {
								switch (tooltipItem.datasetIndex) {
									case 0:
										var str = '';
										var duration = moment.duration(tooltipItem.yLabel * 60 * 1000);
	
										str += (duration.hours() || 0) + 'h ';
										str += (duration.minutes() || 0) + 'm';
	
										return data.datasets[tooltipItem.datasetIndex].label + ': ' + str.trim();
									case 1:
									case 2:
										return data.datasets[tooltipItem.datasetIndex].label + ': ' + tooltipItem.yLabel.toFixed(1);
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
								callback: function callback(value) {
									var str = '';
	
									var duration = moment.duration(value * 60 * 1000);
	
									str += (duration.hours() || 0) + 'h ';
									str += (duration.minutes() || 0) + 'm';
	
									return str.trim();
								},
								fixedStepSize: 60,
								min: 0
							}
						}, {
							id: "temp",
							ticks: {
								callback: function callback(value) {
									return value;
								},
								fixedStepSize: 2,
								min: Math.floor(Math.min(minTargetTemp, minAvgOutsideTemp)),
								max: Math.ceil(Math.max(maxTargetTemp, maxAvgOutsideTemp))
							}
						}]
					}
				}));
			}
	
			if (data.statisticsByMonth && data.statisticsByMonth.length) {
				var _minTargetTemp = Math.min.apply(Math, _toConsumableArray(data.statisticsByMonth.map(function (item) {
					return item.avgTargetTemp;
				}))).toFixed(1);
				var _maxTargetTemp = Math.max.apply(Math, _toConsumableArray(data.statisticsByMonth.map(function (item) {
					return item.avgTargetTemp;
				}))).toFixed(1);
	
				var _minAvgOutsideTemp = Math.min.apply(Math, _toConsumableArray(data.statisticsByMonth.map(function (item) {
					return item.avgOutsideTemp;
				}))).toFixed(1);
				var _maxAvgOutsideTemp = Math.max.apply(Math, _toConsumableArray(data.statisticsByMonth.map(function (item) {
					return item.avgOutsideTemp;
				}))).toFixed(1);
	
				new Chart(document.querySelector('#statisticsByMonth'), _defineProperty({
					type: 'line',
					options: {
						maintainAspectRatio: false,
						responsive: true
					},
					data: {
						datasets: [{
							label: 'Avg heating running time',
							yAxisID: "duration",
							data: [].concat(_toConsumableArray(data.statisticsByMonth.map(function (item) {
								return { x: item.date, y: item.avgRunningMinutes };
							}))),
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
							pointHitRadius: 9
						}, {
							label: 'Avg target temperature',
							yAxisID: "temp",
							data: [].concat(_toConsumableArray(data.statisticsByMonth.map(function (item) {
								return { x: item.date, y: item.avgTargetTemp };
							}))),
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
							fill: false
						}, {
							label: 'Avg outside temperature',
							yAxisID: "temp",
							data: [].concat(_toConsumableArray(data.statisticsByMonth.map(function (item) {
								return { x: item.date, y: item.avgOutsideTemp };
							}))),
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
							fill: false
						}]
					}
				}, 'options', {
					tooltips: {
						mode: 'x',
						intersect: true,
						callbacks: {
							label: function label(tooltipItem, data) {
								switch (tooltipItem.datasetIndex) {
									case 0:
										var str = '';
										var duration = moment.duration(tooltipItem.yLabel * 60 * 1000);
	
										str += (duration.hours() || 0) + 'h ';
										str += (duration.minutes() || 0) + 'm';
	
										return data.datasets[tooltipItem.datasetIndex].label + ': ' + str.trim();
									case 1:
									case 2:
										return data.datasets[tooltipItem.datasetIndex].label + ': ' + tooltipItem.yLabel.toFixed(1);
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
								callback: function callback(value) {
									var str = '';
	
									var duration = moment.duration(value * 60 * 1000);
	
									str += (duration.hours() || 0) + 'h ';
									str += (duration.minutes() || 0) + 'm';
	
									return str.trim();
								},
								fixedStepSize: 60,
								min: 0
							}
						}, {
							id: "temp",
							ticks: {
								callback: function callback(value) {
									return value;
								},
								fixedStepSize: 2,
								min: Math.floor(Math.min(_minTargetTemp, _minAvgOutsideTemp)),
								max: Math.ceil(Math.max(_maxTargetTemp, _maxAvgOutsideTemp))
							},
							tooltipFormat: function tooltipFormat(value) {
								return value.toFixed(1);
							}
						}]
					}
				}));
			}
	
			if (data.statisticsForToday && data.statisticsForToday.length) {
				new Chart(document.querySelector('#heatingHistoryChart'), _defineProperty({
					type: 'line',
					options: {
						maintainAspectRatio: false,
						responsive: true
					},
					data: {
						datasets: [{
							label: 'Heating status',
							data: data.statisticsForToday.map(function (item) {
								return { x: item.datetime, y: item.status ? 10 : 0 };
							}),
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
							pointHitRadius: 9
						}]
					}
				}, 'options', {
					tooltips: {
						mode: 'x',
						intersect: true,
						callbacks: {
							label: function label(tooltipItem, data) {
								if (tooltipItem.yLabel === 10) {
									return data.datasets[tooltipItem.datasetIndex].label + ': ON';
								} else {
									return data.datasets[tooltipItem.datasetIndex].label + ': OFF';
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
								callback: function callback(value) {
									return value === 0 ? 'OFF' : value === 10 ? 'ON' : '';
								},
								fixedStepSize: 1,
								min: 0,
								max: 10
							}
						}]
					}
				}));
			}
		};
	
		var init = function init() {
			$scope.initInProgress = true;
	
			$http.get('/api/statistics?_=' + new Date().getTime()).then(function (response) {
				if (response.data && response.data.data) {
					var data = response.data.data;
	
					handleServerData(data, true);
				}
			}, function (err) {
				console.log(err);
			});
		};
	
		init();
	}]);

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var _module = __webpack_require__(4);
	
	_module.controller('modalSensorLabelCtrl', ['$scope', 'content', 'loginStatus', '$http', function ($scope, content, loginStatus, $http) {
		loginStatus.check();
	
		$scope.id = content.id;
		$scope.label = content.label;
	
		$scope.save = function () {
			$scope.$close({
				id: $scope.id,
				label: $scope.label
			});
		};
	}]);

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

	/* global angular */
	
	'use strict';
	
	var _module = __webpack_require__(4);
	__webpack_require__(6);
	
	_module.config(['$routeProvider', function ($routeProvider) {
		$routeProvider.when('/', {
			templateUrl: '/views/index.html',
			controller: 'mainCtrl'
		});
	}]);

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

	/* global moment */
	
	'use strict';
	
	var _module = __webpack_require__(4);
	
	_module.filter('float', ['$sce', function ($sce) {
		return function (value) {
			var transformedValue = '';
	
			if (value >= 0) {
				transformedValue += Math.floor(value);
			} else {
				transformedValue += Math.ceil(value);
			}
	
			var decimal = Math.abs(value) % 1;
	
			if (decimal && decimal.toFixed(1) === '1.0') {
				decimal = 0;
	
				if (value >= 0) {
					transformedValue = Math.floor(value) + 1;
				} else {
					transformedValue = Math.ceil(value) - 1;
				}
			}
			transformedValue += '<span class="decimal">' + (decimal ? decimal.toFixed(1).substr(1) : '.0') + '</span>';
	
			return $sce.trustAsHtml(transformedValue);
		};
	}]);
	
	_module.filter('first2chars', function () {
		return function (value) {
			return value ? value.substr(0, 2) : '';
		};
	});
	
	_module.filter('duration', function () {
		return function (value) {
			var str = '';
	
			var duration = moment.duration(value * 60 * 1000);
	
			str += (duration.hours() || 0) + 'h ';
			str += (duration.minutes() || 0) + 'm';
	
			return str.trim();
		};
	});

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(14);

/***/ }),
/* 14 */
/***/ (function(module, exports) {

	/*!
	 * Bootstrap v3.3.7 (http://getbootstrap.com)
	 * Copyright 2011-2016 Twitter, Inc.
	 * Licensed under the MIT license
	 */
	
	if (typeof jQuery === 'undefined') {
	  throw new Error('Bootstrap\'s JavaScript requires jQuery')
	}
	
	+function ($) {
	  'use strict';
	  var version = $.fn.jquery.split(' ')[0].split('.')
	  if ((version[0] < 2 && version[1] < 9) || (version[0] == 1 && version[1] == 9 && version[2] < 1) || (version[0] > 3)) {
	    throw new Error('Bootstrap\'s JavaScript requires jQuery version 1.9.1 or higher, but lower than version 4')
	  }
	}(jQuery);
	
	/* ========================================================================
	 * Bootstrap: transition.js v3.3.7
	 * http://getbootstrap.com/javascript/#transitions
	 * ========================================================================
	 * Copyright 2011-2016 Twitter, Inc.
	 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
	 * ======================================================================== */
	
	
	+function ($) {
	  'use strict';
	
	  // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
	  // ============================================================
	
	  function transitionEnd() {
	    var el = document.createElement('bootstrap')
	
	    var transEndEventNames = {
	      WebkitTransition : 'webkitTransitionEnd',
	      MozTransition    : 'transitionend',
	      OTransition      : 'oTransitionEnd otransitionend',
	      transition       : 'transitionend'
	    }
	
	    for (var name in transEndEventNames) {
	      if (el.style[name] !== undefined) {
	        return { end: transEndEventNames[name] }
	      }
	    }
	
	    return false // explicit for ie8 (  ._.)
	  }
	
	  // http://blog.alexmaccaw.com/css-transitions
	  $.fn.emulateTransitionEnd = function (duration) {
	    var called = false
	    var $el = this
	    $(this).one('bsTransitionEnd', function () { called = true })
	    var callback = function () { if (!called) $($el).trigger($.support.transition.end) }
	    setTimeout(callback, duration)
	    return this
	  }
	
	  $(function () {
	    $.support.transition = transitionEnd()
	
	    if (!$.support.transition) return
	
	    $.event.special.bsTransitionEnd = {
	      bindType: $.support.transition.end,
	      delegateType: $.support.transition.end,
	      handle: function (e) {
	        if ($(e.target).is(this)) return e.handleObj.handler.apply(this, arguments)
	      }
	    }
	  })
	
	}(jQuery);
	
	/* ========================================================================
	 * Bootstrap: alert.js v3.3.7
	 * http://getbootstrap.com/javascript/#alerts
	 * ========================================================================
	 * Copyright 2011-2016 Twitter, Inc.
	 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
	 * ======================================================================== */
	
	
	+function ($) {
	  'use strict';
	
	  // ALERT CLASS DEFINITION
	  // ======================
	
	  var dismiss = '[data-dismiss="alert"]'
	  var Alert   = function (el) {
	    $(el).on('click', dismiss, this.close)
	  }
	
	  Alert.VERSION = '3.3.7'
	
	  Alert.TRANSITION_DURATION = 150
	
	  Alert.prototype.close = function (e) {
	    var $this    = $(this)
	    var selector = $this.attr('data-target')
	
	    if (!selector) {
	      selector = $this.attr('href')
	      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
	    }
	
	    var $parent = $(selector === '#' ? [] : selector)
	
	    if (e) e.preventDefault()
	
	    if (!$parent.length) {
	      $parent = $this.closest('.alert')
	    }
	
	    $parent.trigger(e = $.Event('close.bs.alert'))
	
	    if (e.isDefaultPrevented()) return
	
	    $parent.removeClass('in')
	
	    function removeElement() {
	      // detach from parent, fire event then clean up data
	      $parent.detach().trigger('closed.bs.alert').remove()
	    }
	
	    $.support.transition && $parent.hasClass('fade') ?
	      $parent
	        .one('bsTransitionEnd', removeElement)
	        .emulateTransitionEnd(Alert.TRANSITION_DURATION) :
	      removeElement()
	  }
	
	
	  // ALERT PLUGIN DEFINITION
	  // =======================
	
	  function Plugin(option) {
	    return this.each(function () {
	      var $this = $(this)
	      var data  = $this.data('bs.alert')
	
	      if (!data) $this.data('bs.alert', (data = new Alert(this)))
	      if (typeof option == 'string') data[option].call($this)
	    })
	  }
	
	  var old = $.fn.alert
	
	  $.fn.alert             = Plugin
	  $.fn.alert.Constructor = Alert
	
	
	  // ALERT NO CONFLICT
	  // =================
	
	  $.fn.alert.noConflict = function () {
	    $.fn.alert = old
	    return this
	  }
	
	
	  // ALERT DATA-API
	  // ==============
	
	  $(document).on('click.bs.alert.data-api', dismiss, Alert.prototype.close)
	
	}(jQuery);
	
	/* ========================================================================
	 * Bootstrap: button.js v3.3.7
	 * http://getbootstrap.com/javascript/#buttons
	 * ========================================================================
	 * Copyright 2011-2016 Twitter, Inc.
	 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
	 * ======================================================================== */
	
	
	+function ($) {
	  'use strict';
	
	  // BUTTON PUBLIC CLASS DEFINITION
	  // ==============================
	
	  var Button = function (element, options) {
	    this.$element  = $(element)
	    this.options   = $.extend({}, Button.DEFAULTS, options)
	    this.isLoading = false
	  }
	
	  Button.VERSION  = '3.3.7'
	
	  Button.DEFAULTS = {
	    loadingText: 'loading...'
	  }
	
	  Button.prototype.setState = function (state) {
	    var d    = 'disabled'
	    var $el  = this.$element
	    var val  = $el.is('input') ? 'val' : 'html'
	    var data = $el.data()
	
	    state += 'Text'
	
	    if (data.resetText == null) $el.data('resetText', $el[val]())
	
	    // push to event loop to allow forms to submit
	    setTimeout($.proxy(function () {
	      $el[val](data[state] == null ? this.options[state] : data[state])
	
	      if (state == 'loadingText') {
	        this.isLoading = true
	        $el.addClass(d).attr(d, d).prop(d, true)
	      } else if (this.isLoading) {
	        this.isLoading = false
	        $el.removeClass(d).removeAttr(d).prop(d, false)
	      }
	    }, this), 0)
	  }
	
	  Button.prototype.toggle = function () {
	    var changed = true
	    var $parent = this.$element.closest('[data-toggle="buttons"]')
	
	    if ($parent.length) {
	      var $input = this.$element.find('input')
	      if ($input.prop('type') == 'radio') {
	        if ($input.prop('checked')) changed = false
	        $parent.find('.active').removeClass('active')
	        this.$element.addClass('active')
	      } else if ($input.prop('type') == 'checkbox') {
	        if (($input.prop('checked')) !== this.$element.hasClass('active')) changed = false
	        this.$element.toggleClass('active')
	      }
	      $input.prop('checked', this.$element.hasClass('active'))
	      if (changed) $input.trigger('change')
	    } else {
	      this.$element.attr('aria-pressed', !this.$element.hasClass('active'))
	      this.$element.toggleClass('active')
	    }
	  }
	
	
	  // BUTTON PLUGIN DEFINITION
	  // ========================
	
	  function Plugin(option) {
	    return this.each(function () {
	      var $this   = $(this)
	      var data    = $this.data('bs.button')
	      var options = typeof option == 'object' && option
	
	      if (!data) $this.data('bs.button', (data = new Button(this, options)))
	
	      if (option == 'toggle') data.toggle()
	      else if (option) data.setState(option)
	    })
	  }
	
	  var old = $.fn.button
	
	  $.fn.button             = Plugin
	  $.fn.button.Constructor = Button
	
	
	  // BUTTON NO CONFLICT
	  // ==================
	
	  $.fn.button.noConflict = function () {
	    $.fn.button = old
	    return this
	  }
	
	
	  // BUTTON DATA-API
	  // ===============
	
	  $(document)
	    .on('click.bs.button.data-api', '[data-toggle^="button"]', function (e) {
	      var $btn = $(e.target).closest('.btn')
	      Plugin.call($btn, 'toggle')
	      if (!($(e.target).is('input[type="radio"], input[type="checkbox"]'))) {
	        // Prevent double click on radios, and the double selections (so cancellation) on checkboxes
	        e.preventDefault()
	        // The target component still receive the focus
	        if ($btn.is('input,button')) $btn.trigger('focus')
	        else $btn.find('input:visible,button:visible').first().trigger('focus')
	      }
	    })
	    .on('focus.bs.button.data-api blur.bs.button.data-api', '[data-toggle^="button"]', function (e) {
	      $(e.target).closest('.btn').toggleClass('focus', /^focus(in)?$/.test(e.type))
	    })
	
	}(jQuery);
	
	/* ========================================================================
	 * Bootstrap: carousel.js v3.3.7
	 * http://getbootstrap.com/javascript/#carousel
	 * ========================================================================
	 * Copyright 2011-2016 Twitter, Inc.
	 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
	 * ======================================================================== */
	
	
	+function ($) {
	  'use strict';
	
	  // CAROUSEL CLASS DEFINITION
	  // =========================
	
	  var Carousel = function (element, options) {
	    this.$element    = $(element)
	    this.$indicators = this.$element.find('.carousel-indicators')
	    this.options     = options
	    this.paused      = null
	    this.sliding     = null
	    this.interval    = null
	    this.$active     = null
	    this.$items      = null
	
	    this.options.keyboard && this.$element.on('keydown.bs.carousel', $.proxy(this.keydown, this))
	
	    this.options.pause == 'hover' && !('ontouchstart' in document.documentElement) && this.$element
	      .on('mouseenter.bs.carousel', $.proxy(this.pause, this))
	      .on('mouseleave.bs.carousel', $.proxy(this.cycle, this))
	  }
	
	  Carousel.VERSION  = '3.3.7'
	
	  Carousel.TRANSITION_DURATION = 600
	
	  Carousel.DEFAULTS = {
	    interval: 5000,
	    pause: 'hover',
	    wrap: true,
	    keyboard: true
	  }
	
	  Carousel.prototype.keydown = function (e) {
	    if (/input|textarea/i.test(e.target.tagName)) return
	    switch (e.which) {
	      case 37: this.prev(); break
	      case 39: this.next(); break
	      default: return
	    }
	
	    e.preventDefault()
	  }
	
	  Carousel.prototype.cycle = function (e) {
	    e || (this.paused = false)
	
	    this.interval && clearInterval(this.interval)
	
	    this.options.interval
	      && !this.paused
	      && (this.interval = setInterval($.proxy(this.next, this), this.options.interval))
	
	    return this
	  }
	
	  Carousel.prototype.getItemIndex = function (item) {
	    this.$items = item.parent().children('.item')
	    return this.$items.index(item || this.$active)
	  }
	
	  Carousel.prototype.getItemForDirection = function (direction, active) {
	    var activeIndex = this.getItemIndex(active)
	    var willWrap = (direction == 'prev' && activeIndex === 0)
	                || (direction == 'next' && activeIndex == (this.$items.length - 1))
	    if (willWrap && !this.options.wrap) return active
	    var delta = direction == 'prev' ? -1 : 1
	    var itemIndex = (activeIndex + delta) % this.$items.length
	    return this.$items.eq(itemIndex)
	  }
	
	  Carousel.prototype.to = function (pos) {
	    var that        = this
	    var activeIndex = this.getItemIndex(this.$active = this.$element.find('.item.active'))
	
	    if (pos > (this.$items.length - 1) || pos < 0) return
	
	    if (this.sliding)       return this.$element.one('slid.bs.carousel', function () { that.to(pos) }) // yes, "slid"
	    if (activeIndex == pos) return this.pause().cycle()
	
	    return this.slide(pos > activeIndex ? 'next' : 'prev', this.$items.eq(pos))
	  }
	
	  Carousel.prototype.pause = function (e) {
	    e || (this.paused = true)
	
	    if (this.$element.find('.next, .prev').length && $.support.transition) {
	      this.$element.trigger($.support.transition.end)
	      this.cycle(true)
	    }
	
	    this.interval = clearInterval(this.interval)
	
	    return this
	  }
	
	  Carousel.prototype.next = function () {
	    if (this.sliding) return
	    return this.slide('next')
	  }
	
	  Carousel.prototype.prev = function () {
	    if (this.sliding) return
	    return this.slide('prev')
	  }
	
	  Carousel.prototype.slide = function (type, next) {
	    var $active   = this.$element.find('.item.active')
	    var $next     = next || this.getItemForDirection(type, $active)
	    var isCycling = this.interval
	    var direction = type == 'next' ? 'left' : 'right'
	    var that      = this
	
	    if ($next.hasClass('active')) return (this.sliding = false)
	
	    var relatedTarget = $next[0]
	    var slideEvent = $.Event('slide.bs.carousel', {
	      relatedTarget: relatedTarget,
	      direction: direction
	    })
	    this.$element.trigger(slideEvent)
	    if (slideEvent.isDefaultPrevented()) return
	
	    this.sliding = true
	
	    isCycling && this.pause()
	
	    if (this.$indicators.length) {
	      this.$indicators.find('.active').removeClass('active')
	      var $nextIndicator = $(this.$indicators.children()[this.getItemIndex($next)])
	      $nextIndicator && $nextIndicator.addClass('active')
	    }
	
	    var slidEvent = $.Event('slid.bs.carousel', { relatedTarget: relatedTarget, direction: direction }) // yes, "slid"
	    if ($.support.transition && this.$element.hasClass('slide')) {
	      $next.addClass(type)
	      $next[0].offsetWidth // force reflow
	      $active.addClass(direction)
	      $next.addClass(direction)
	      $active
	        .one('bsTransitionEnd', function () {
	          $next.removeClass([type, direction].join(' ')).addClass('active')
	          $active.removeClass(['active', direction].join(' '))
	          that.sliding = false
	          setTimeout(function () {
	            that.$element.trigger(slidEvent)
	          }, 0)
	        })
	        .emulateTransitionEnd(Carousel.TRANSITION_DURATION)
	    } else {
	      $active.removeClass('active')
	      $next.addClass('active')
	      this.sliding = false
	      this.$element.trigger(slidEvent)
	    }
	
	    isCycling && this.cycle()
	
	    return this
	  }
	
	
	  // CAROUSEL PLUGIN DEFINITION
	  // ==========================
	
	  function Plugin(option) {
	    return this.each(function () {
	      var $this   = $(this)
	      var data    = $this.data('bs.carousel')
	      var options = $.extend({}, Carousel.DEFAULTS, $this.data(), typeof option == 'object' && option)
	      var action  = typeof option == 'string' ? option : options.slide
	
	      if (!data) $this.data('bs.carousel', (data = new Carousel(this, options)))
	      if (typeof option == 'number') data.to(option)
	      else if (action) data[action]()
	      else if (options.interval) data.pause().cycle()
	    })
	  }
	
	  var old = $.fn.carousel
	
	  $.fn.carousel             = Plugin
	  $.fn.carousel.Constructor = Carousel
	
	
	  // CAROUSEL NO CONFLICT
	  // ====================
	
	  $.fn.carousel.noConflict = function () {
	    $.fn.carousel = old
	    return this
	  }
	
	
	  // CAROUSEL DATA-API
	  // =================
	
	  var clickHandler = function (e) {
	    var href
	    var $this   = $(this)
	    var $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) // strip for ie7
	    if (!$target.hasClass('carousel')) return
	    var options = $.extend({}, $target.data(), $this.data())
	    var slideIndex = $this.attr('data-slide-to')
	    if (slideIndex) options.interval = false
	
	    Plugin.call($target, options)
	
	    if (slideIndex) {
	      $target.data('bs.carousel').to(slideIndex)
	    }
	
	    e.preventDefault()
	  }
	
	  $(document)
	    .on('click.bs.carousel.data-api', '[data-slide]', clickHandler)
	    .on('click.bs.carousel.data-api', '[data-slide-to]', clickHandler)
	
	  $(window).on('load', function () {
	    $('[data-ride="carousel"]').each(function () {
	      var $carousel = $(this)
	      Plugin.call($carousel, $carousel.data())
	    })
	  })
	
	}(jQuery);
	
	/* ========================================================================
	 * Bootstrap: collapse.js v3.3.7
	 * http://getbootstrap.com/javascript/#collapse
	 * ========================================================================
	 * Copyright 2011-2016 Twitter, Inc.
	 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
	 * ======================================================================== */
	
	/* jshint latedef: false */
	
	+function ($) {
	  'use strict';
	
	  // COLLAPSE PUBLIC CLASS DEFINITION
	  // ================================
	
	  var Collapse = function (element, options) {
	    this.$element      = $(element)
	    this.options       = $.extend({}, Collapse.DEFAULTS, options)
	    this.$trigger      = $('[data-toggle="collapse"][href="#' + element.id + '"],' +
	                           '[data-toggle="collapse"][data-target="#' + element.id + '"]')
	    this.transitioning = null
	
	    if (this.options.parent) {
	      this.$parent = this.getParent()
	    } else {
	      this.addAriaAndCollapsedClass(this.$element, this.$trigger)
	    }
	
	    if (this.options.toggle) this.toggle()
	  }
	
	  Collapse.VERSION  = '3.3.7'
	
	  Collapse.TRANSITION_DURATION = 350
	
	  Collapse.DEFAULTS = {
	    toggle: true
	  }
	
	  Collapse.prototype.dimension = function () {
	    var hasWidth = this.$element.hasClass('width')
	    return hasWidth ? 'width' : 'height'
	  }
	
	  Collapse.prototype.show = function () {
	    if (this.transitioning || this.$element.hasClass('in')) return
	
	    var activesData
	    var actives = this.$parent && this.$parent.children('.panel').children('.in, .collapsing')
	
	    if (actives && actives.length) {
	      activesData = actives.data('bs.collapse')
	      if (activesData && activesData.transitioning) return
	    }
	
	    var startEvent = $.Event('show.bs.collapse')
	    this.$element.trigger(startEvent)
	    if (startEvent.isDefaultPrevented()) return
	
	    if (actives && actives.length) {
	      Plugin.call(actives, 'hide')
	      activesData || actives.data('bs.collapse', null)
	    }
	
	    var dimension = this.dimension()
	
	    this.$element
	      .removeClass('collapse')
	      .addClass('collapsing')[dimension](0)
	      .attr('aria-expanded', true)
	
	    this.$trigger
	      .removeClass('collapsed')
	      .attr('aria-expanded', true)
	
	    this.transitioning = 1
	
	    var complete = function () {
	      this.$element
	        .removeClass('collapsing')
	        .addClass('collapse in')[dimension]('')
	      this.transitioning = 0
	      this.$element
	        .trigger('shown.bs.collapse')
	    }
	
	    if (!$.support.transition) return complete.call(this)
	
	    var scrollSize = $.camelCase(['scroll', dimension].join('-'))
	
	    this.$element
	      .one('bsTransitionEnd', $.proxy(complete, this))
	      .emulateTransitionEnd(Collapse.TRANSITION_DURATION)[dimension](this.$element[0][scrollSize])
	  }
	
	  Collapse.prototype.hide = function () {
	    if (this.transitioning || !this.$element.hasClass('in')) return
	
	    var startEvent = $.Event('hide.bs.collapse')
	    this.$element.trigger(startEvent)
	    if (startEvent.isDefaultPrevented()) return
	
	    var dimension = this.dimension()
	
	    this.$element[dimension](this.$element[dimension]())[0].offsetHeight
	
	    this.$element
	      .addClass('collapsing')
	      .removeClass('collapse in')
	      .attr('aria-expanded', false)
	
	    this.$trigger
	      .addClass('collapsed')
	      .attr('aria-expanded', false)
	
	    this.transitioning = 1
	
	    var complete = function () {
	      this.transitioning = 0
	      this.$element
	        .removeClass('collapsing')
	        .addClass('collapse')
	        .trigger('hidden.bs.collapse')
	    }
	
	    if (!$.support.transition) return complete.call(this)
	
	    this.$element
	      [dimension](0)
	      .one('bsTransitionEnd', $.proxy(complete, this))
	      .emulateTransitionEnd(Collapse.TRANSITION_DURATION)
	  }
	
	  Collapse.prototype.toggle = function () {
	    this[this.$element.hasClass('in') ? 'hide' : 'show']()
	  }
	
	  Collapse.prototype.getParent = function () {
	    return $(this.options.parent)
	      .find('[data-toggle="collapse"][data-parent="' + this.options.parent + '"]')
	      .each($.proxy(function (i, element) {
	        var $element = $(element)
	        this.addAriaAndCollapsedClass(getTargetFromTrigger($element), $element)
	      }, this))
	      .end()
	  }
	
	  Collapse.prototype.addAriaAndCollapsedClass = function ($element, $trigger) {
	    var isOpen = $element.hasClass('in')
	
	    $element.attr('aria-expanded', isOpen)
	    $trigger
	      .toggleClass('collapsed', !isOpen)
	      .attr('aria-expanded', isOpen)
	  }
	
	  function getTargetFromTrigger($trigger) {
	    var href
	    var target = $trigger.attr('data-target')
	      || (href = $trigger.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') // strip for ie7
	
	    return $(target)
	  }
	
	
	  // COLLAPSE PLUGIN DEFINITION
	  // ==========================
	
	  function Plugin(option) {
	    return this.each(function () {
	      var $this   = $(this)
	      var data    = $this.data('bs.collapse')
	      var options = $.extend({}, Collapse.DEFAULTS, $this.data(), typeof option == 'object' && option)
	
	      if (!data && options.toggle && /show|hide/.test(option)) options.toggle = false
	      if (!data) $this.data('bs.collapse', (data = new Collapse(this, options)))
	      if (typeof option == 'string') data[option]()
	    })
	  }
	
	  var old = $.fn.collapse
	
	  $.fn.collapse             = Plugin
	  $.fn.collapse.Constructor = Collapse
	
	
	  // COLLAPSE NO CONFLICT
	  // ====================
	
	  $.fn.collapse.noConflict = function () {
	    $.fn.collapse = old
	    return this
	  }
	
	
	  // COLLAPSE DATA-API
	  // =================
	
	  $(document).on('click.bs.collapse.data-api', '[data-toggle="collapse"]', function (e) {
	    var $this   = $(this)
	
	    if (!$this.attr('data-target')) e.preventDefault()
	
	    var $target = getTargetFromTrigger($this)
	    var data    = $target.data('bs.collapse')
	    var option  = data ? 'toggle' : $this.data()
	
	    Plugin.call($target, option)
	  })
	
	}(jQuery);
	
	/* ========================================================================
	 * Bootstrap: dropdown.js v3.3.7
	 * http://getbootstrap.com/javascript/#dropdowns
	 * ========================================================================
	 * Copyright 2011-2016 Twitter, Inc.
	 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
	 * ======================================================================== */
	
	
	+function ($) {
	  'use strict';
	
	  // DROPDOWN CLASS DEFINITION
	  // =========================
	
	  var backdrop = '.dropdown-backdrop'
	  var toggle   = '[data-toggle="dropdown"]'
	  var Dropdown = function (element) {
	    $(element).on('click.bs.dropdown', this.toggle)
	  }
	
	  Dropdown.VERSION = '3.3.7'
	
	  function getParent($this) {
	    var selector = $this.attr('data-target')
	
	    if (!selector) {
	      selector = $this.attr('href')
	      selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
	    }
	
	    var $parent = selector && $(selector)
	
	    return $parent && $parent.length ? $parent : $this.parent()
	  }
	
	  function clearMenus(e) {
	    if (e && e.which === 3) return
	    $(backdrop).remove()
	    $(toggle).each(function () {
	      var $this         = $(this)
	      var $parent       = getParent($this)
	      var relatedTarget = { relatedTarget: this }
	
	      if (!$parent.hasClass('open')) return
	
	      if (e && e.type == 'click' && /input|textarea/i.test(e.target.tagName) && $.contains($parent[0], e.target)) return
	
	      $parent.trigger(e = $.Event('hide.bs.dropdown', relatedTarget))
	
	      if (e.isDefaultPrevented()) return
	
	      $this.attr('aria-expanded', 'false')
	      $parent.removeClass('open').trigger($.Event('hidden.bs.dropdown', relatedTarget))
	    })
	  }
	
	  Dropdown.prototype.toggle = function (e) {
	    var $this = $(this)
	
	    if ($this.is('.disabled, :disabled')) return
	
	    var $parent  = getParent($this)
	    var isActive = $parent.hasClass('open')
	
	    clearMenus()
	
	    if (!isActive) {
	      if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
	        // if mobile we use a backdrop because click events don't delegate
	        $(document.createElement('div'))
	          .addClass('dropdown-backdrop')
	          .insertAfter($(this))
	          .on('click', clearMenus)
	      }
	
	      var relatedTarget = { relatedTarget: this }
	      $parent.trigger(e = $.Event('show.bs.dropdown', relatedTarget))
	
	      if (e.isDefaultPrevented()) return
	
	      $this
	        .trigger('focus')
	        .attr('aria-expanded', 'true')
	
	      $parent
	        .toggleClass('open')
	        .trigger($.Event('shown.bs.dropdown', relatedTarget))
	    }
	
	    return false
	  }
	
	  Dropdown.prototype.keydown = function (e) {
	    if (!/(38|40|27|32)/.test(e.which) || /input|textarea/i.test(e.target.tagName)) return
	
	    var $this = $(this)
	
	    e.preventDefault()
	    e.stopPropagation()
	
	    if ($this.is('.disabled, :disabled')) return
	
	    var $parent  = getParent($this)
	    var isActive = $parent.hasClass('open')
	
	    if (!isActive && e.which != 27 || isActive && e.which == 27) {
	      if (e.which == 27) $parent.find(toggle).trigger('focus')
	      return $this.trigger('click')
	    }
	
	    var desc = ' li:not(.disabled):visible a'
	    var $items = $parent.find('.dropdown-menu' + desc)
	
	    if (!$items.length) return
	
	    var index = $items.index(e.target)
	
	    if (e.which == 38 && index > 0)                 index--         // up
	    if (e.which == 40 && index < $items.length - 1) index++         // down
	    if (!~index)                                    index = 0
	
	    $items.eq(index).trigger('focus')
	  }
	
	
	  // DROPDOWN PLUGIN DEFINITION
	  // ==========================
	
	  function Plugin(option) {
	    return this.each(function () {
	      var $this = $(this)
	      var data  = $this.data('bs.dropdown')
	
	      if (!data) $this.data('bs.dropdown', (data = new Dropdown(this)))
	      if (typeof option == 'string') data[option].call($this)
	    })
	  }
	
	  var old = $.fn.dropdown
	
	  $.fn.dropdown             = Plugin
	  $.fn.dropdown.Constructor = Dropdown
	
	
	  // DROPDOWN NO CONFLICT
	  // ====================
	
	  $.fn.dropdown.noConflict = function () {
	    $.fn.dropdown = old
	    return this
	  }
	
	
	  // APPLY TO STANDARD DROPDOWN ELEMENTS
	  // ===================================
	
	  $(document)
	    .on('click.bs.dropdown.data-api', clearMenus)
	    .on('click.bs.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() })
	    .on('click.bs.dropdown.data-api', toggle, Dropdown.prototype.toggle)
	    .on('keydown.bs.dropdown.data-api', toggle, Dropdown.prototype.keydown)
	    .on('keydown.bs.dropdown.data-api', '.dropdown-menu', Dropdown.prototype.keydown)
	
	}(jQuery);
	
	/* ========================================================================
	 * Bootstrap: modal.js v3.3.7
	 * http://getbootstrap.com/javascript/#modals
	 * ========================================================================
	 * Copyright 2011-2016 Twitter, Inc.
	 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
	 * ======================================================================== */
	
	
	+function ($) {
	  'use strict';
	
	  // MODAL CLASS DEFINITION
	  // ======================
	
	  var Modal = function (element, options) {
	    this.options             = options
	    this.$body               = $(document.body)
	    this.$element            = $(element)
	    this.$dialog             = this.$element.find('.modal-dialog')
	    this.$backdrop           = null
	    this.isShown             = null
	    this.originalBodyPad     = null
	    this.scrollbarWidth      = 0
	    this.ignoreBackdropClick = false
	
	    if (this.options.remote) {
	      this.$element
	        .find('.modal-content')
	        .load(this.options.remote, $.proxy(function () {
	          this.$element.trigger('loaded.bs.modal')
	        }, this))
	    }
	  }
	
	  Modal.VERSION  = '3.3.7'
	
	  Modal.TRANSITION_DURATION = 300
	  Modal.BACKDROP_TRANSITION_DURATION = 150
	
	  Modal.DEFAULTS = {
	    backdrop: true,
	    keyboard: true,
	    show: true
	  }
	
	  Modal.prototype.toggle = function (_relatedTarget) {
	    return this.isShown ? this.hide() : this.show(_relatedTarget)
	  }
	
	  Modal.prototype.show = function (_relatedTarget) {
	    var that = this
	    var e    = $.Event('show.bs.modal', { relatedTarget: _relatedTarget })
	
	    this.$element.trigger(e)
	
	    if (this.isShown || e.isDefaultPrevented()) return
	
	    this.isShown = true
	
	    this.checkScrollbar()
	    this.setScrollbar()
	    this.$body.addClass('modal-open')
	
	    this.escape()
	    this.resize()
	
	    this.$element.on('click.dismiss.bs.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this))
	
	    this.$dialog.on('mousedown.dismiss.bs.modal', function () {
	      that.$element.one('mouseup.dismiss.bs.modal', function (e) {
	        if ($(e.target).is(that.$element)) that.ignoreBackdropClick = true
	      })
	    })
	
	    this.backdrop(function () {
	      var transition = $.support.transition && that.$element.hasClass('fade')
	
	      if (!that.$element.parent().length) {
	        that.$element.appendTo(that.$body) // don't move modals dom position
	      }
	
	      that.$element
	        .show()
	        .scrollTop(0)
	
	      that.adjustDialog()
	
	      if (transition) {
	        that.$element[0].offsetWidth // force reflow
	      }
	
	      that.$element.addClass('in')
	
	      that.enforceFocus()
	
	      var e = $.Event('shown.bs.modal', { relatedTarget: _relatedTarget })
	
	      transition ?
	        that.$dialog // wait for modal to slide in
	          .one('bsTransitionEnd', function () {
	            that.$element.trigger('focus').trigger(e)
	          })
	          .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
	        that.$element.trigger('focus').trigger(e)
	    })
	  }
	
	  Modal.prototype.hide = function (e) {
	    if (e) e.preventDefault()
	
	    e = $.Event('hide.bs.modal')
	
	    this.$element.trigger(e)
	
	    if (!this.isShown || e.isDefaultPrevented()) return
	
	    this.isShown = false
	
	    this.escape()
	    this.resize()
	
	    $(document).off('focusin.bs.modal')
	
	    this.$element
	      .removeClass('in')
	      .off('click.dismiss.bs.modal')
	      .off('mouseup.dismiss.bs.modal')
	
	    this.$dialog.off('mousedown.dismiss.bs.modal')
	
	    $.support.transition && this.$element.hasClass('fade') ?
	      this.$element
	        .one('bsTransitionEnd', $.proxy(this.hideModal, this))
	        .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
	      this.hideModal()
	  }
	
	  Modal.prototype.enforceFocus = function () {
	    $(document)
	      .off('focusin.bs.modal') // guard against infinite focus loop
	      .on('focusin.bs.modal', $.proxy(function (e) {
	        if (document !== e.target &&
	            this.$element[0] !== e.target &&
	            !this.$element.has(e.target).length) {
	          this.$element.trigger('focus')
	        }
	      }, this))
	  }
	
	  Modal.prototype.escape = function () {
	    if (this.isShown && this.options.keyboard) {
	      this.$element.on('keydown.dismiss.bs.modal', $.proxy(function (e) {
	        e.which == 27 && this.hide()
	      }, this))
	    } else if (!this.isShown) {
	      this.$element.off('keydown.dismiss.bs.modal')
	    }
	  }
	
	  Modal.prototype.resize = function () {
	    if (this.isShown) {
	      $(window).on('resize.bs.modal', $.proxy(this.handleUpdate, this))
	    } else {
	      $(window).off('resize.bs.modal')
	    }
	  }
	
	  Modal.prototype.hideModal = function () {
	    var that = this
	    this.$element.hide()
	    this.backdrop(function () {
	      that.$body.removeClass('modal-open')
	      that.resetAdjustments()
	      that.resetScrollbar()
	      that.$element.trigger('hidden.bs.modal')
	    })
	  }
	
	  Modal.prototype.removeBackdrop = function () {
	    this.$backdrop && this.$backdrop.remove()
	    this.$backdrop = null
	  }
	
	  Modal.prototype.backdrop = function (callback) {
	    var that = this
	    var animate = this.$element.hasClass('fade') ? 'fade' : ''
	
	    if (this.isShown && this.options.backdrop) {
	      var doAnimate = $.support.transition && animate
	
	      this.$backdrop = $(document.createElement('div'))
	        .addClass('modal-backdrop ' + animate)
	        .appendTo(this.$body)
	
	      this.$element.on('click.dismiss.bs.modal', $.proxy(function (e) {
	        if (this.ignoreBackdropClick) {
	          this.ignoreBackdropClick = false
	          return
	        }
	        if (e.target !== e.currentTarget) return
	        this.options.backdrop == 'static'
	          ? this.$element[0].focus()
	          : this.hide()
	      }, this))
	
	      if (doAnimate) this.$backdrop[0].offsetWidth // force reflow
	
	      this.$backdrop.addClass('in')
	
	      if (!callback) return
	
	      doAnimate ?
	        this.$backdrop
	          .one('bsTransitionEnd', callback)
	          .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
	        callback()
	
	    } else if (!this.isShown && this.$backdrop) {
	      this.$backdrop.removeClass('in')
	
	      var callbackRemove = function () {
	        that.removeBackdrop()
	        callback && callback()
	      }
	      $.support.transition && this.$element.hasClass('fade') ?
	        this.$backdrop
	          .one('bsTransitionEnd', callbackRemove)
	          .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
	        callbackRemove()
	
	    } else if (callback) {
	      callback()
	    }
	  }
	
	  // these following methods are used to handle overflowing modals
	
	  Modal.prototype.handleUpdate = function () {
	    this.adjustDialog()
	  }
	
	  Modal.prototype.adjustDialog = function () {
	    var modalIsOverflowing = this.$element[0].scrollHeight > document.documentElement.clientHeight
	
	    this.$element.css({
	      paddingLeft:  !this.bodyIsOverflowing && modalIsOverflowing ? this.scrollbarWidth : '',
	      paddingRight: this.bodyIsOverflowing && !modalIsOverflowing ? this.scrollbarWidth : ''
	    })
	  }
	
	  Modal.prototype.resetAdjustments = function () {
	    this.$element.css({
	      paddingLeft: '',
	      paddingRight: ''
	    })
	  }
	
	  Modal.prototype.checkScrollbar = function () {
	    var fullWindowWidth = window.innerWidth
	    if (!fullWindowWidth) { // workaround for missing window.innerWidth in IE8
	      var documentElementRect = document.documentElement.getBoundingClientRect()
	      fullWindowWidth = documentElementRect.right - Math.abs(documentElementRect.left)
	    }
	    this.bodyIsOverflowing = document.body.clientWidth < fullWindowWidth
	    this.scrollbarWidth = this.measureScrollbar()
	  }
	
	  Modal.prototype.setScrollbar = function () {
	    var bodyPad = parseInt((this.$body.css('padding-right') || 0), 10)
	    this.originalBodyPad = document.body.style.paddingRight || ''
	    if (this.bodyIsOverflowing) this.$body.css('padding-right', bodyPad + this.scrollbarWidth)
	  }
	
	  Modal.prototype.resetScrollbar = function () {
	    this.$body.css('padding-right', this.originalBodyPad)
	  }
	
	  Modal.prototype.measureScrollbar = function () { // thx walsh
	    var scrollDiv = document.createElement('div')
	    scrollDiv.className = 'modal-scrollbar-measure'
	    this.$body.append(scrollDiv)
	    var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth
	    this.$body[0].removeChild(scrollDiv)
	    return scrollbarWidth
	  }
	
	
	  // MODAL PLUGIN DEFINITION
	  // =======================
	
	  function Plugin(option, _relatedTarget) {
	    return this.each(function () {
	      var $this   = $(this)
	      var data    = $this.data('bs.modal')
	      var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option)
	
	      if (!data) $this.data('bs.modal', (data = new Modal(this, options)))
	      if (typeof option == 'string') data[option](_relatedTarget)
	      else if (options.show) data.show(_relatedTarget)
	    })
	  }
	
	  var old = $.fn.modal
	
	  $.fn.modal             = Plugin
	  $.fn.modal.Constructor = Modal
	
	
	  // MODAL NO CONFLICT
	  // =================
	
	  $.fn.modal.noConflict = function () {
	    $.fn.modal = old
	    return this
	  }
	
	
	  // MODAL DATA-API
	  // ==============
	
	  $(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function (e) {
	    var $this   = $(this)
	    var href    = $this.attr('href')
	    var $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))) // strip for ie7
	    var option  = $target.data('bs.modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data())
	
	    if ($this.is('a')) e.preventDefault()
	
	    $target.one('show.bs.modal', function (showEvent) {
	      if (showEvent.isDefaultPrevented()) return // only register focus restorer if modal will actually get shown
	      $target.one('hidden.bs.modal', function () {
	        $this.is(':visible') && $this.trigger('focus')
	      })
	    })
	    Plugin.call($target, option, this)
	  })
	
	}(jQuery);
	
	/* ========================================================================
	 * Bootstrap: tooltip.js v3.3.7
	 * http://getbootstrap.com/javascript/#tooltip
	 * Inspired by the original jQuery.tipsy by Jason Frame
	 * ========================================================================
	 * Copyright 2011-2016 Twitter, Inc.
	 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
	 * ======================================================================== */
	
	
	+function ($) {
	  'use strict';
	
	  // TOOLTIP PUBLIC CLASS DEFINITION
	  // ===============================
	
	  var Tooltip = function (element, options) {
	    this.type       = null
	    this.options    = null
	    this.enabled    = null
	    this.timeout    = null
	    this.hoverState = null
	    this.$element   = null
	    this.inState    = null
	
	    this.init('tooltip', element, options)
	  }
	
	  Tooltip.VERSION  = '3.3.7'
	
	  Tooltip.TRANSITION_DURATION = 150
	
	  Tooltip.DEFAULTS = {
	    animation: true,
	    placement: 'top',
	    selector: false,
	    template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
	    trigger: 'hover focus',
	    title: '',
	    delay: 0,
	    html: false,
	    container: false,
	    viewport: {
	      selector: 'body',
	      padding: 0
	    }
	  }
	
	  Tooltip.prototype.init = function (type, element, options) {
	    this.enabled   = true
	    this.type      = type
	    this.$element  = $(element)
	    this.options   = this.getOptions(options)
	    this.$viewport = this.options.viewport && $($.isFunction(this.options.viewport) ? this.options.viewport.call(this, this.$element) : (this.options.viewport.selector || this.options.viewport))
	    this.inState   = { click: false, hover: false, focus: false }
	
	    if (this.$element[0] instanceof document.constructor && !this.options.selector) {
	      throw new Error('`selector` option must be specified when initializing ' + this.type + ' on the window.document object!')
	    }
	
	    var triggers = this.options.trigger.split(' ')
	
	    for (var i = triggers.length; i--;) {
	      var trigger = triggers[i]
	
	      if (trigger == 'click') {
	        this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this))
	      } else if (trigger != 'manual') {
	        var eventIn  = trigger == 'hover' ? 'mouseenter' : 'focusin'
	        var eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout'
	
	        this.$element.on(eventIn  + '.' + this.type, this.options.selector, $.proxy(this.enter, this))
	        this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this))
	      }
	    }
	
	    this.options.selector ?
	      (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' })) :
	      this.fixTitle()
	  }
	
	  Tooltip.prototype.getDefaults = function () {
	    return Tooltip.DEFAULTS
	  }
	
	  Tooltip.prototype.getOptions = function (options) {
	    options = $.extend({}, this.getDefaults(), this.$element.data(), options)
	
	    if (options.delay && typeof options.delay == 'number') {
	      options.delay = {
	        show: options.delay,
	        hide: options.delay
	      }
	    }
	
	    return options
	  }
	
	  Tooltip.prototype.getDelegateOptions = function () {
	    var options  = {}
	    var defaults = this.getDefaults()
	
	    this._options && $.each(this._options, function (key, value) {
	      if (defaults[key] != value) options[key] = value
	    })
	
	    return options
	  }
	
	  Tooltip.prototype.enter = function (obj) {
	    var self = obj instanceof this.constructor ?
	      obj : $(obj.currentTarget).data('bs.' + this.type)
	
	    if (!self) {
	      self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
	      $(obj.currentTarget).data('bs.' + this.type, self)
	    }
	
	    if (obj instanceof $.Event) {
	      self.inState[obj.type == 'focusin' ? 'focus' : 'hover'] = true
	    }
	
	    if (self.tip().hasClass('in') || self.hoverState == 'in') {
	      self.hoverState = 'in'
	      return
	    }
	
	    clearTimeout(self.timeout)
	
	    self.hoverState = 'in'
	
	    if (!self.options.delay || !self.options.delay.show) return self.show()
	
	    self.timeout = setTimeout(function () {
	      if (self.hoverState == 'in') self.show()
	    }, self.options.delay.show)
	  }
	
	  Tooltip.prototype.isInStateTrue = function () {
	    for (var key in this.inState) {
	      if (this.inState[key]) return true
	    }
	
	    return false
	  }
	
	  Tooltip.prototype.leave = function (obj) {
	    var self = obj instanceof this.constructor ?
	      obj : $(obj.currentTarget).data('bs.' + this.type)
	
	    if (!self) {
	      self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
	      $(obj.currentTarget).data('bs.' + this.type, self)
	    }
	
	    if (obj instanceof $.Event) {
	      self.inState[obj.type == 'focusout' ? 'focus' : 'hover'] = false
	    }
	
	    if (self.isInStateTrue()) return
	
	    clearTimeout(self.timeout)
	
	    self.hoverState = 'out'
	
	    if (!self.options.delay || !self.options.delay.hide) return self.hide()
	
	    self.timeout = setTimeout(function () {
	      if (self.hoverState == 'out') self.hide()
	    }, self.options.delay.hide)
	  }
	
	  Tooltip.prototype.show = function () {
	    var e = $.Event('show.bs.' + this.type)
	
	    if (this.hasContent() && this.enabled) {
	      this.$element.trigger(e)
	
	      var inDom = $.contains(this.$element[0].ownerDocument.documentElement, this.$element[0])
	      if (e.isDefaultPrevented() || !inDom) return
	      var that = this
	
	      var $tip = this.tip()
	
	      var tipId = this.getUID(this.type)
	
	      this.setContent()
	      $tip.attr('id', tipId)
	      this.$element.attr('aria-describedby', tipId)
	
	      if (this.options.animation) $tip.addClass('fade')
	
	      var placement = typeof this.options.placement == 'function' ?
	        this.options.placement.call(this, $tip[0], this.$element[0]) :
	        this.options.placement
	
	      var autoToken = /\s?auto?\s?/i
	      var autoPlace = autoToken.test(placement)
	      if (autoPlace) placement = placement.replace(autoToken, '') || 'top'
	
	      $tip
	        .detach()
	        .css({ top: 0, left: 0, display: 'block' })
	        .addClass(placement)
	        .data('bs.' + this.type, this)
	
	      this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element)
	      this.$element.trigger('inserted.bs.' + this.type)
	
	      var pos          = this.getPosition()
	      var actualWidth  = $tip[0].offsetWidth
	      var actualHeight = $tip[0].offsetHeight
	
	      if (autoPlace) {
	        var orgPlacement = placement
	        var viewportDim = this.getPosition(this.$viewport)
	
	        placement = placement == 'bottom' && pos.bottom + actualHeight > viewportDim.bottom ? 'top'    :
	                    placement == 'top'    && pos.top    - actualHeight < viewportDim.top    ? 'bottom' :
	                    placement == 'right'  && pos.right  + actualWidth  > viewportDim.width  ? 'left'   :
	                    placement == 'left'   && pos.left   - actualWidth  < viewportDim.left   ? 'right'  :
	                    placement
	
	        $tip
	          .removeClass(orgPlacement)
	          .addClass(placement)
	      }
	
	      var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight)
	
	      this.applyPlacement(calculatedOffset, placement)
	
	      var complete = function () {
	        var prevHoverState = that.hoverState
	        that.$element.trigger('shown.bs.' + that.type)
	        that.hoverState = null
	
	        if (prevHoverState == 'out') that.leave(that)
	      }
	
	      $.support.transition && this.$tip.hasClass('fade') ?
	        $tip
	          .one('bsTransitionEnd', complete)
	          .emulateTransitionEnd(Tooltip.TRANSITION_DURATION) :
	        complete()
	    }
	  }
	
	  Tooltip.prototype.applyPlacement = function (offset, placement) {
	    var $tip   = this.tip()
	    var width  = $tip[0].offsetWidth
	    var height = $tip[0].offsetHeight
	
	    // manually read margins because getBoundingClientRect includes difference
	    var marginTop = parseInt($tip.css('margin-top'), 10)
	    var marginLeft = parseInt($tip.css('margin-left'), 10)
	
	    // we must check for NaN for ie 8/9
	    if (isNaN(marginTop))  marginTop  = 0
	    if (isNaN(marginLeft)) marginLeft = 0
	
	    offset.top  += marginTop
	    offset.left += marginLeft
	
	    // $.fn.offset doesn't round pixel values
	    // so we use setOffset directly with our own function B-0
	    $.offset.setOffset($tip[0], $.extend({
	      using: function (props) {
	        $tip.css({
	          top: Math.round(props.top),
	          left: Math.round(props.left)
	        })
	      }
	    }, offset), 0)
	
	    $tip.addClass('in')
	
	    // check to see if placing tip in new offset caused the tip to resize itself
	    var actualWidth  = $tip[0].offsetWidth
	    var actualHeight = $tip[0].offsetHeight
	
	    if (placement == 'top' && actualHeight != height) {
	      offset.top = offset.top + height - actualHeight
	    }
	
	    var delta = this.getViewportAdjustedDelta(placement, offset, actualWidth, actualHeight)
	
	    if (delta.left) offset.left += delta.left
	    else offset.top += delta.top
	
	    var isVertical          = /top|bottom/.test(placement)
	    var arrowDelta          = isVertical ? delta.left * 2 - width + actualWidth : delta.top * 2 - height + actualHeight
	    var arrowOffsetPosition = isVertical ? 'offsetWidth' : 'offsetHeight'
	
	    $tip.offset(offset)
	    this.replaceArrow(arrowDelta, $tip[0][arrowOffsetPosition], isVertical)
	  }
	
	  Tooltip.prototype.replaceArrow = function (delta, dimension, isVertical) {
	    this.arrow()
	      .css(isVertical ? 'left' : 'top', 50 * (1 - delta / dimension) + '%')
	      .css(isVertical ? 'top' : 'left', '')
	  }
	
	  Tooltip.prototype.setContent = function () {
	    var $tip  = this.tip()
	    var title = this.getTitle()
	
	    $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title)
	    $tip.removeClass('fade in top bottom left right')
	  }
	
	  Tooltip.prototype.hide = function (callback) {
	    var that = this
	    var $tip = $(this.$tip)
	    var e    = $.Event('hide.bs.' + this.type)
	
	    function complete() {
	      if (that.hoverState != 'in') $tip.detach()
	      if (that.$element) { // TODO: Check whether guarding this code with this `if` is really necessary.
	        that.$element
	          .removeAttr('aria-describedby')
	          .trigger('hidden.bs.' + that.type)
	      }
	      callback && callback()
	    }
	
	    this.$element.trigger(e)
	
	    if (e.isDefaultPrevented()) return
	
	    $tip.removeClass('in')
	
	    $.support.transition && $tip.hasClass('fade') ?
	      $tip
	        .one('bsTransitionEnd', complete)
	        .emulateTransitionEnd(Tooltip.TRANSITION_DURATION) :
	      complete()
	
	    this.hoverState = null
	
	    return this
	  }
	
	  Tooltip.prototype.fixTitle = function () {
	    var $e = this.$element
	    if ($e.attr('title') || typeof $e.attr('data-original-title') != 'string') {
	      $e.attr('data-original-title', $e.attr('title') || '').attr('title', '')
	    }
	  }
	
	  Tooltip.prototype.hasContent = function () {
	    return this.getTitle()
	  }
	
	  Tooltip.prototype.getPosition = function ($element) {
	    $element   = $element || this.$element
	
	    var el     = $element[0]
	    var isBody = el.tagName == 'BODY'
	
	    var elRect    = el.getBoundingClientRect()
	    if (elRect.width == null) {
	      // width and height are missing in IE8, so compute them manually; see https://github.com/twbs/bootstrap/issues/14093
	      elRect = $.extend({}, elRect, { width: elRect.right - elRect.left, height: elRect.bottom - elRect.top })
	    }
	    var isSvg = window.SVGElement && el instanceof window.SVGElement
	    // Avoid using $.offset() on SVGs since it gives incorrect results in jQuery 3.
	    // See https://github.com/twbs/bootstrap/issues/20280
	    var elOffset  = isBody ? { top: 0, left: 0 } : (isSvg ? null : $element.offset())
	    var scroll    = { scroll: isBody ? document.documentElement.scrollTop || document.body.scrollTop : $element.scrollTop() }
	    var outerDims = isBody ? { width: $(window).width(), height: $(window).height() } : null
	
	    return $.extend({}, elRect, scroll, outerDims, elOffset)
	  }
	
	  Tooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
	    return placement == 'bottom' ? { top: pos.top + pos.height,   left: pos.left + pos.width / 2 - actualWidth / 2 } :
	           placement == 'top'    ? { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2 } :
	           placement == 'left'   ? { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth } :
	        /* placement == 'right' */ { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width }
	
	  }
	
	  Tooltip.prototype.getViewportAdjustedDelta = function (placement, pos, actualWidth, actualHeight) {
	    var delta = { top: 0, left: 0 }
	    if (!this.$viewport) return delta
	
	    var viewportPadding = this.options.viewport && this.options.viewport.padding || 0
	    var viewportDimensions = this.getPosition(this.$viewport)
	
	    if (/right|left/.test(placement)) {
	      var topEdgeOffset    = pos.top - viewportPadding - viewportDimensions.scroll
	      var bottomEdgeOffset = pos.top + viewportPadding - viewportDimensions.scroll + actualHeight
	      if (topEdgeOffset < viewportDimensions.top) { // top overflow
	        delta.top = viewportDimensions.top - topEdgeOffset
	      } else if (bottomEdgeOffset > viewportDimensions.top + viewportDimensions.height) { // bottom overflow
	        delta.top = viewportDimensions.top + viewportDimensions.height - bottomEdgeOffset
	      }
	    } else {
	      var leftEdgeOffset  = pos.left - viewportPadding
	      var rightEdgeOffset = pos.left + viewportPadding + actualWidth
	      if (leftEdgeOffset < viewportDimensions.left) { // left overflow
	        delta.left = viewportDimensions.left - leftEdgeOffset
	      } else if (rightEdgeOffset > viewportDimensions.right) { // right overflow
	        delta.left = viewportDimensions.left + viewportDimensions.width - rightEdgeOffset
	      }
	    }
	
	    return delta
	  }
	
	  Tooltip.prototype.getTitle = function () {
	    var title
	    var $e = this.$element
	    var o  = this.options
	
	    title = $e.attr('data-original-title')
	      || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title)
	
	    return title
	  }
	
	  Tooltip.prototype.getUID = function (prefix) {
	    do prefix += ~~(Math.random() * 1000000)
	    while (document.getElementById(prefix))
	    return prefix
	  }
	
	  Tooltip.prototype.tip = function () {
	    if (!this.$tip) {
	      this.$tip = $(this.options.template)
	      if (this.$tip.length != 1) {
	        throw new Error(this.type + ' `template` option must consist of exactly 1 top-level element!')
	      }
	    }
	    return this.$tip
	  }
	
	  Tooltip.prototype.arrow = function () {
	    return (this.$arrow = this.$arrow || this.tip().find('.tooltip-arrow'))
	  }
	
	  Tooltip.prototype.enable = function () {
	    this.enabled = true
	  }
	
	  Tooltip.prototype.disable = function () {
	    this.enabled = false
	  }
	
	  Tooltip.prototype.toggleEnabled = function () {
	    this.enabled = !this.enabled
	  }
	
	  Tooltip.prototype.toggle = function (e) {
	    var self = this
	    if (e) {
	      self = $(e.currentTarget).data('bs.' + this.type)
	      if (!self) {
	        self = new this.constructor(e.currentTarget, this.getDelegateOptions())
	        $(e.currentTarget).data('bs.' + this.type, self)
	      }
	    }
	
	    if (e) {
	      self.inState.click = !self.inState.click
	      if (self.isInStateTrue()) self.enter(self)
	      else self.leave(self)
	    } else {
	      self.tip().hasClass('in') ? self.leave(self) : self.enter(self)
	    }
	  }
	
	  Tooltip.prototype.destroy = function () {
	    var that = this
	    clearTimeout(this.timeout)
	    this.hide(function () {
	      that.$element.off('.' + that.type).removeData('bs.' + that.type)
	      if (that.$tip) {
	        that.$tip.detach()
	      }
	      that.$tip = null
	      that.$arrow = null
	      that.$viewport = null
	      that.$element = null
	    })
	  }
	
	
	  // TOOLTIP PLUGIN DEFINITION
	  // =========================
	
	  function Plugin(option) {
	    return this.each(function () {
	      var $this   = $(this)
	      var data    = $this.data('bs.tooltip')
	      var options = typeof option == 'object' && option
	
	      if (!data && /destroy|hide/.test(option)) return
	      if (!data) $this.data('bs.tooltip', (data = new Tooltip(this, options)))
	      if (typeof option == 'string') data[option]()
	    })
	  }
	
	  var old = $.fn.tooltip
	
	  $.fn.tooltip             = Plugin
	  $.fn.tooltip.Constructor = Tooltip
	
	
	  // TOOLTIP NO CONFLICT
	  // ===================
	
	  $.fn.tooltip.noConflict = function () {
	    $.fn.tooltip = old
	    return this
	  }
	
	}(jQuery);
	
	/* ========================================================================
	 * Bootstrap: popover.js v3.3.7
	 * http://getbootstrap.com/javascript/#popovers
	 * ========================================================================
	 * Copyright 2011-2016 Twitter, Inc.
	 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
	 * ======================================================================== */
	
	
	+function ($) {
	  'use strict';
	
	  // POPOVER PUBLIC CLASS DEFINITION
	  // ===============================
	
	  var Popover = function (element, options) {
	    this.init('popover', element, options)
	  }
	
	  if (!$.fn.tooltip) throw new Error('Popover requires tooltip.js')
	
	  Popover.VERSION  = '3.3.7'
	
	  Popover.DEFAULTS = $.extend({}, $.fn.tooltip.Constructor.DEFAULTS, {
	    placement: 'right',
	    trigger: 'click',
	    content: '',
	    template: '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
	  })
	
	
	  // NOTE: POPOVER EXTENDS tooltip.js
	  // ================================
	
	  Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype)
	
	  Popover.prototype.constructor = Popover
	
	  Popover.prototype.getDefaults = function () {
	    return Popover.DEFAULTS
	  }
	
	  Popover.prototype.setContent = function () {
	    var $tip    = this.tip()
	    var title   = this.getTitle()
	    var content = this.getContent()
	
	    $tip.find('.popover-title')[this.options.html ? 'html' : 'text'](title)
	    $tip.find('.popover-content').children().detach().end()[ // we use append for html objects to maintain js events
	      this.options.html ? (typeof content == 'string' ? 'html' : 'append') : 'text'
	    ](content)
	
	    $tip.removeClass('fade top bottom left right in')
	
	    // IE8 doesn't accept hiding via the `:empty` pseudo selector, we have to do
	    // this manually by checking the contents.
	    if (!$tip.find('.popover-title').html()) $tip.find('.popover-title').hide()
	  }
	
	  Popover.prototype.hasContent = function () {
	    return this.getTitle() || this.getContent()
	  }
	
	  Popover.prototype.getContent = function () {
	    var $e = this.$element
	    var o  = this.options
	
	    return $e.attr('data-content')
	      || (typeof o.content == 'function' ?
	            o.content.call($e[0]) :
	            o.content)
	  }
	
	  Popover.prototype.arrow = function () {
	    return (this.$arrow = this.$arrow || this.tip().find('.arrow'))
	  }
	
	
	  // POPOVER PLUGIN DEFINITION
	  // =========================
	
	  function Plugin(option) {
	    return this.each(function () {
	      var $this   = $(this)
	      var data    = $this.data('bs.popover')
	      var options = typeof option == 'object' && option
	
	      if (!data && /destroy|hide/.test(option)) return
	      if (!data) $this.data('bs.popover', (data = new Popover(this, options)))
	      if (typeof option == 'string') data[option]()
	    })
	  }
	
	  var old = $.fn.popover
	
	  $.fn.popover             = Plugin
	  $.fn.popover.Constructor = Popover
	
	
	  // POPOVER NO CONFLICT
	  // ===================
	
	  $.fn.popover.noConflict = function () {
	    $.fn.popover = old
	    return this
	  }
	
	}(jQuery);
	
	/* ========================================================================
	 * Bootstrap: scrollspy.js v3.3.7
	 * http://getbootstrap.com/javascript/#scrollspy
	 * ========================================================================
	 * Copyright 2011-2016 Twitter, Inc.
	 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
	 * ======================================================================== */
	
	
	+function ($) {
	  'use strict';
	
	  // SCROLLSPY CLASS DEFINITION
	  // ==========================
	
	  function ScrollSpy(element, options) {
	    this.$body          = $(document.body)
	    this.$scrollElement = $(element).is(document.body) ? $(window) : $(element)
	    this.options        = $.extend({}, ScrollSpy.DEFAULTS, options)
	    this.selector       = (this.options.target || '') + ' .nav li > a'
	    this.offsets        = []
	    this.targets        = []
	    this.activeTarget   = null
	    this.scrollHeight   = 0
	
	    this.$scrollElement.on('scroll.bs.scrollspy', $.proxy(this.process, this))
	    this.refresh()
	    this.process()
	  }
	
	  ScrollSpy.VERSION  = '3.3.7'
	
	  ScrollSpy.DEFAULTS = {
	    offset: 10
	  }
	
	  ScrollSpy.prototype.getScrollHeight = function () {
	    return this.$scrollElement[0].scrollHeight || Math.max(this.$body[0].scrollHeight, document.documentElement.scrollHeight)
	  }
	
	  ScrollSpy.prototype.refresh = function () {
	    var that          = this
	    var offsetMethod  = 'offset'
	    var offsetBase    = 0
	
	    this.offsets      = []
	    this.targets      = []
	    this.scrollHeight = this.getScrollHeight()
	
	    if (!$.isWindow(this.$scrollElement[0])) {
	      offsetMethod = 'position'
	      offsetBase   = this.$scrollElement.scrollTop()
	    }
	
	    this.$body
	      .find(this.selector)
	      .map(function () {
	        var $el   = $(this)
	        var href  = $el.data('target') || $el.attr('href')
	        var $href = /^#./.test(href) && $(href)
	
	        return ($href
	          && $href.length
	          && $href.is(':visible')
	          && [[$href[offsetMethod]().top + offsetBase, href]]) || null
	      })
	      .sort(function (a, b) { return a[0] - b[0] })
	      .each(function () {
	        that.offsets.push(this[0])
	        that.targets.push(this[1])
	      })
	  }
	
	  ScrollSpy.prototype.process = function () {
	    var scrollTop    = this.$scrollElement.scrollTop() + this.options.offset
	    var scrollHeight = this.getScrollHeight()
	    var maxScroll    = this.options.offset + scrollHeight - this.$scrollElement.height()
	    var offsets      = this.offsets
	    var targets      = this.targets
	    var activeTarget = this.activeTarget
	    var i
	
	    if (this.scrollHeight != scrollHeight) {
	      this.refresh()
	    }
	
	    if (scrollTop >= maxScroll) {
	      return activeTarget != (i = targets[targets.length - 1]) && this.activate(i)
	    }
	
	    if (activeTarget && scrollTop < offsets[0]) {
	      this.activeTarget = null
	      return this.clear()
	    }
	
	    for (i = offsets.length; i--;) {
	      activeTarget != targets[i]
	        && scrollTop >= offsets[i]
	        && (offsets[i + 1] === undefined || scrollTop < offsets[i + 1])
	        && this.activate(targets[i])
	    }
	  }
	
	  ScrollSpy.prototype.activate = function (target) {
	    this.activeTarget = target
	
	    this.clear()
	
	    var selector = this.selector +
	      '[data-target="' + target + '"],' +
	      this.selector + '[href="' + target + '"]'
	
	    var active = $(selector)
	      .parents('li')
	      .addClass('active')
	
	    if (active.parent('.dropdown-menu').length) {
	      active = active
	        .closest('li.dropdown')
	        .addClass('active')
	    }
	
	    active.trigger('activate.bs.scrollspy')
	  }
	
	  ScrollSpy.prototype.clear = function () {
	    $(this.selector)
	      .parentsUntil(this.options.target, '.active')
	      .removeClass('active')
	  }
	
	
	  // SCROLLSPY PLUGIN DEFINITION
	  // ===========================
	
	  function Plugin(option) {
	    return this.each(function () {
	      var $this   = $(this)
	      var data    = $this.data('bs.scrollspy')
	      var options = typeof option == 'object' && option
	
	      if (!data) $this.data('bs.scrollspy', (data = new ScrollSpy(this, options)))
	      if (typeof option == 'string') data[option]()
	    })
	  }
	
	  var old = $.fn.scrollspy
	
	  $.fn.scrollspy             = Plugin
	  $.fn.scrollspy.Constructor = ScrollSpy
	
	
	  // SCROLLSPY NO CONFLICT
	  // =====================
	
	  $.fn.scrollspy.noConflict = function () {
	    $.fn.scrollspy = old
	    return this
	  }
	
	
	  // SCROLLSPY DATA-API
	  // ==================
	
	  $(window).on('load.bs.scrollspy.data-api', function () {
	    $('[data-spy="scroll"]').each(function () {
	      var $spy = $(this)
	      Plugin.call($spy, $spy.data())
	    })
	  })
	
	}(jQuery);
	
	/* ========================================================================
	 * Bootstrap: tab.js v3.3.7
	 * http://getbootstrap.com/javascript/#tabs
	 * ========================================================================
	 * Copyright 2011-2016 Twitter, Inc.
	 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
	 * ======================================================================== */
	
	
	+function ($) {
	  'use strict';
	
	  // TAB CLASS DEFINITION
	  // ====================
	
	  var Tab = function (element) {
	    // jscs:disable requireDollarBeforejQueryAssignment
	    this.element = $(element)
	    // jscs:enable requireDollarBeforejQueryAssignment
	  }
	
	  Tab.VERSION = '3.3.7'
	
	  Tab.TRANSITION_DURATION = 150
	
	  Tab.prototype.show = function () {
	    var $this    = this.element
	    var $ul      = $this.closest('ul:not(.dropdown-menu)')
	    var selector = $this.data('target')
	
	    if (!selector) {
	      selector = $this.attr('href')
	      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
	    }
	
	    if ($this.parent('li').hasClass('active')) return
	
	    var $previous = $ul.find('.active:last a')
	    var hideEvent = $.Event('hide.bs.tab', {
	      relatedTarget: $this[0]
	    })
	    var showEvent = $.Event('show.bs.tab', {
	      relatedTarget: $previous[0]
	    })
	
	    $previous.trigger(hideEvent)
	    $this.trigger(showEvent)
	
	    if (showEvent.isDefaultPrevented() || hideEvent.isDefaultPrevented()) return
	
	    var $target = $(selector)
	
	    this.activate($this.closest('li'), $ul)
	    this.activate($target, $target.parent(), function () {
	      $previous.trigger({
	        type: 'hidden.bs.tab',
	        relatedTarget: $this[0]
	      })
	      $this.trigger({
	        type: 'shown.bs.tab',
	        relatedTarget: $previous[0]
	      })
	    })
	  }
	
	  Tab.prototype.activate = function (element, container, callback) {
	    var $active    = container.find('> .active')
	    var transition = callback
	      && $.support.transition
	      && ($active.length && $active.hasClass('fade') || !!container.find('> .fade').length)
	
	    function next() {
	      $active
	        .removeClass('active')
	        .find('> .dropdown-menu > .active')
	          .removeClass('active')
	        .end()
	        .find('[data-toggle="tab"]')
	          .attr('aria-expanded', false)
	
	      element
	        .addClass('active')
	        .find('[data-toggle="tab"]')
	          .attr('aria-expanded', true)
	
	      if (transition) {
	        element[0].offsetWidth // reflow for transition
	        element.addClass('in')
	      } else {
	        element.removeClass('fade')
	      }
	
	      if (element.parent('.dropdown-menu').length) {
	        element
	          .closest('li.dropdown')
	            .addClass('active')
	          .end()
	          .find('[data-toggle="tab"]')
	            .attr('aria-expanded', true)
	      }
	
	      callback && callback()
	    }
	
	    $active.length && transition ?
	      $active
	        .one('bsTransitionEnd', next)
	        .emulateTransitionEnd(Tab.TRANSITION_DURATION) :
	      next()
	
	    $active.removeClass('in')
	  }
	
	
	  // TAB PLUGIN DEFINITION
	  // =====================
	
	  function Plugin(option) {
	    return this.each(function () {
	      var $this = $(this)
	      var data  = $this.data('bs.tab')
	
	      if (!data) $this.data('bs.tab', (data = new Tab(this)))
	      if (typeof option == 'string') data[option]()
	    })
	  }
	
	  var old = $.fn.tab
	
	  $.fn.tab             = Plugin
	  $.fn.tab.Constructor = Tab
	
	
	  // TAB NO CONFLICT
	  // ===============
	
	  $.fn.tab.noConflict = function () {
	    $.fn.tab = old
	    return this
	  }
	
	
	  // TAB DATA-API
	  // ============
	
	  var clickHandler = function (e) {
	    e.preventDefault()
	    Plugin.call($(this), 'show')
	  }
	
	  $(document)
	    .on('click.bs.tab.data-api', '[data-toggle="tab"]', clickHandler)
	    .on('click.bs.tab.data-api', '[data-toggle="pill"]', clickHandler)
	
	}(jQuery);
	
	/* ========================================================================
	 * Bootstrap: affix.js v3.3.7
	 * http://getbootstrap.com/javascript/#affix
	 * ========================================================================
	 * Copyright 2011-2016 Twitter, Inc.
	 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
	 * ======================================================================== */
	
	
	+function ($) {
	  'use strict';
	
	  // AFFIX CLASS DEFINITION
	  // ======================
	
	  var Affix = function (element, options) {
	    this.options = $.extend({}, Affix.DEFAULTS, options)
	
	    this.$target = $(this.options.target)
	      .on('scroll.bs.affix.data-api', $.proxy(this.checkPosition, this))
	      .on('click.bs.affix.data-api',  $.proxy(this.checkPositionWithEventLoop, this))
	
	    this.$element     = $(element)
	    this.affixed      = null
	    this.unpin        = null
	    this.pinnedOffset = null
	
	    this.checkPosition()
	  }
	
	  Affix.VERSION  = '3.3.7'
	
	  Affix.RESET    = 'affix affix-top affix-bottom'
	
	  Affix.DEFAULTS = {
	    offset: 0,
	    target: window
	  }
	
	  Affix.prototype.getState = function (scrollHeight, height, offsetTop, offsetBottom) {
	    var scrollTop    = this.$target.scrollTop()
	    var position     = this.$element.offset()
	    var targetHeight = this.$target.height()
	
	    if (offsetTop != null && this.affixed == 'top') return scrollTop < offsetTop ? 'top' : false
	
	    if (this.affixed == 'bottom') {
	      if (offsetTop != null) return (scrollTop + this.unpin <= position.top) ? false : 'bottom'
	      return (scrollTop + targetHeight <= scrollHeight - offsetBottom) ? false : 'bottom'
	    }
	
	    var initializing   = this.affixed == null
	    var colliderTop    = initializing ? scrollTop : position.top
	    var colliderHeight = initializing ? targetHeight : height
	
	    if (offsetTop != null && scrollTop <= offsetTop) return 'top'
	    if (offsetBottom != null && (colliderTop + colliderHeight >= scrollHeight - offsetBottom)) return 'bottom'
	
	    return false
	  }
	
	  Affix.prototype.getPinnedOffset = function () {
	    if (this.pinnedOffset) return this.pinnedOffset
	    this.$element.removeClass(Affix.RESET).addClass('affix')
	    var scrollTop = this.$target.scrollTop()
	    var position  = this.$element.offset()
	    return (this.pinnedOffset = position.top - scrollTop)
	  }
	
	  Affix.prototype.checkPositionWithEventLoop = function () {
	    setTimeout($.proxy(this.checkPosition, this), 1)
	  }
	
	  Affix.prototype.checkPosition = function () {
	    if (!this.$element.is(':visible')) return
	
	    var height       = this.$element.height()
	    var offset       = this.options.offset
	    var offsetTop    = offset.top
	    var offsetBottom = offset.bottom
	    var scrollHeight = Math.max($(document).height(), $(document.body).height())
	
	    if (typeof offset != 'object')         offsetBottom = offsetTop = offset
	    if (typeof offsetTop == 'function')    offsetTop    = offset.top(this.$element)
	    if (typeof offsetBottom == 'function') offsetBottom = offset.bottom(this.$element)
	
	    var affix = this.getState(scrollHeight, height, offsetTop, offsetBottom)
	
	    if (this.affixed != affix) {
	      if (this.unpin != null) this.$element.css('top', '')
	
	      var affixType = 'affix' + (affix ? '-' + affix : '')
	      var e         = $.Event(affixType + '.bs.affix')
	
	      this.$element.trigger(e)
	
	      if (e.isDefaultPrevented()) return
	
	      this.affixed = affix
	      this.unpin = affix == 'bottom' ? this.getPinnedOffset() : null
	
	      this.$element
	        .removeClass(Affix.RESET)
	        .addClass(affixType)
	        .trigger(affixType.replace('affix', 'affixed') + '.bs.affix')
	    }
	
	    if (affix == 'bottom') {
	      this.$element.offset({
	        top: scrollHeight - height - offsetBottom
	      })
	    }
	  }
	
	
	  // AFFIX PLUGIN DEFINITION
	  // =======================
	
	  function Plugin(option) {
	    return this.each(function () {
	      var $this   = $(this)
	      var data    = $this.data('bs.affix')
	      var options = typeof option == 'object' && option
	
	      if (!data) $this.data('bs.affix', (data = new Affix(this, options)))
	      if (typeof option == 'string') data[option]()
	    })
	  }
	
	  var old = $.fn.affix
	
	  $.fn.affix             = Plugin
	  $.fn.affix.Constructor = Affix
	
	
	  // AFFIX NO CONFLICT
	  // =================
	
	  $.fn.affix.noConflict = function () {
	    $.fn.affix = old
	    return this
	  }
	
	
	  // AFFIX DATA-API
	  // ==============
	
	  $(window).on('load', function () {
	    $('[data-spy="affix"]').each(function () {
	      var $spy = $(this)
	      var data = $spy.data()
	
	      data.offset = data.offset || {}
	
	      if (data.offsetBottom != null) data.offset.bottom = data.offsetBottom
	      if (data.offsetTop    != null) data.offset.top    = data.offsetTop
	
	      Plugin.call($spy, data)
	    })
	  })
	
	}(jQuery);


/***/ }),
/* 15 */
/***/ (function(module, exports) {

	'use strict';
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	// Generated by CoffeeScript 1.6.1
	
	/*!
	  # Responsive Celendar widget script
	  # by w3widgets
	  #
	  # Author: Lukasz Kokoszkiewicz
	  #
	  # Copyright © w3widgets 2013 All Rights Reserved
	*/
	
	(function () {
	
	  (function ($) {
	    "use strict";
	
	    var Calendar, opts, spy;
	    Calendar = function Calendar(element, options) {
	      var time;
	      this.$element = element;
	      this.options = options;
	      this.weekDays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
	      this.time = new Date();
	      this.currentYear = this.time.getFullYear();
	      this.currentMonth = this.time.getMonth();
	      if (this.options.time) {
	        time = this.splitDateString(this.options.time);
	        this.currentYear = time.year;
	        this.currentMonth = time.month;
	      }
	      this.initialDraw();
	      return null;
	    };
	    Calendar.prototype = {
	      addLeadingZero: function addLeadingZero(num) {
	        if (num < 10) {
	          return "0" + num;
	        } else {
	          return "" + num;
	        }
	      },
	      applyTransition: function applyTransition($el, transition) {
	        $el.css('transition', transition);
	        $el.css('-ms-transition', '-ms-' + transition);
	        $el.css('-moz-transition', '-moz-' + transition);
	        return $el.css('-webkit-transition', '-webkit-' + transition);
	      },
	      applyBackfaceVisibility: function applyBackfaceVisibility($el) {
	        $el.css('backface-visibility', 'hidden');
	        $el.css('-ms-backface-visibility', 'hidden');
	        $el.css('-moz-backface-visibility', 'hidden');
	        return $el.css('-webkit-backface-visibility', 'hidden');
	      },
	      applyTransform: function applyTransform($el, transform) {
	        $el.css('transform', transform);
	        $el.css('-ms-transform', transform);
	        $el.css('-moz-transform', transform);
	        return $el.css('-webkit-transform', transform);
	      },
	      splitDateString: function splitDateString(dateString) {
	        var day, month, time, year;
	        time = dateString.split('-');
	        year = parseInt(time[0]);
	        month = parseInt(time[1] - 1);
	        day = parseInt(time[2]);
	        return time = {
	          year: year,
	          month: month,
	          day: day
	        };
	      },
	      initialDraw: function initialDraw() {
	        return this.drawDays(this.currentYear, this.currentMonth);
	      },
	      editDays: function editDays(events) {
	        var dateString, day, dayEvents, time, _results;
	        _results = [];
	        for (dateString in events) {
	          dayEvents = events[dateString];
	          this.options.events[dateString] = events[dateString];
	          time = this.splitDateString(dateString);
	          day = this.$element.find('[data-year="' + time.year + '"][data-month="' + (time.month + 1) + '"][data-day="' + time.day + '"]').parent('.day');
	          day.removeClass('active');
	          day.find('.badge').remove();
	          day.find('a').removeAttr('href');
	          if (this.currentMonth === time.month || this.options.activateNonCurrentMonths) {
	            _results.push(this.makeActive(day, dayEvents));
	          } else {
	            _results.push(void 0);
	          }
	        }
	        return _results;
	      },
	      clearDays: function clearDays(days) {
	        var dateString, day, time, _i, _len, _results;
	        _results = [];
	        for (_i = 0, _len = days.length; _i < _len; _i++) {
	          dateString = days[_i];
	          delete this.options.events[dateString];
	          time = this.splitDateString(dateString);
	          day = this.$element.find('[data-year="' + time.year + '"][data-month="' + (time.month + 1) + '"][data-day="' + time.day + '"]').parent('.day');
	          day.removeClass('active');
	          day.find('.badge').remove();
	          _results.push(day.find('a').removeAttr('href'));
	        }
	        return _results;
	      },
	      clearAll: function clearAll() {
	        var day, days, i, _i, _len, _results;
	        this.options.events = {};
	        days = this.$element.find('[data-group="days"] .day');
	        _results = [];
	        for (i = _i = 0, _len = days.length; _i < _len; i = ++_i) {
	          day = days[i];
	          $(day).removeClass('active');
	          $(day).find('.badge').remove();
	          _results.push($(day).find('a').removeAttr('href'));
	        }
	        return _results;
	      },
	      setMonthYear: function setMonthYear(dateString) {
	        var time;
	        time = this.splitDateString(dateString);
	        this.currentMonth = this.drawDays(time.year, time.month);
	        return this.currentYear = time.year;
	      },
	      prev: function prev() {
	        if (this.currentMonth - 1 < 0) {
	          this.currentYear = this.currentYear - 1;
	          this.currentMonth = 11;
	        } else {
	          this.currentMonth = this.currentMonth - 1;
	        }
	        this.drawDays(this.currentYear, this.currentMonth);
	        if (this.options.onMonthChange) {
	          this.options.onMonthChange.call(this);
	        }
	        return null;
	      },
	      next: function next() {
	        if (this.currentMonth + 1 > 11) {
	          this.currentYear = this.currentYear + 1;
	          this.currentMonth = 0;
	        } else {
	          this.currentMonth = this.currentMonth + 1;
	        }
	        this.drawDays(this.currentYear, this.currentMonth);
	        if (this.options.onMonthChange) {
	          this.options.onMonthChange.call(this);
	        }
	        return null;
	      },
	      curr: function curr() {
	        this.currentYear = this.time.getFullYear();
	        this.currentMonth = this.time.getMonth();
	        this.drawDays(this.currentYear, this.currentMonth);
	        if (this.options.onMonthChange) {
	          this.options.onMonthChange.call(this);
	        }
	        return null;
	      },
	      addOthers: function addOthers(day, dayEvents) {
	        var badge;
	        if ((typeof dayEvents === 'undefined' ? 'undefined' : _typeof(dayEvents)) === "object") {
	          if (dayEvents.number != null) {
	            badge = $("<span></span>").html(dayEvents.number).addClass("badge");
	            if (dayEvents.badgeClass != null) {
	              badge.addClass(dayEvents.badgeClass);
	            }
	            day.append(badge);
	          }
	          if (dayEvents.url) {
	            day.find("a").attr("href", dayEvents.url);
	          }
	        }
	        return day;
	      },
	      makeActive: function makeActive(day, dayEvents) {
	        var classes, eventClass, i, _i, _len;
	        if (dayEvents) {
	          if (dayEvents["class"]) {
	            classes = dayEvents["class"].split(" ");
	            for (i = _i = 0, _len = classes.length; _i < _len; i = ++_i) {
	              eventClass = classes[i];
	              day.addClass(eventClass);
	            }
	          } else {
	            day.addClass("active");
	          }
	          day = this.addOthers(day, dayEvents);
	        }
	        return day;
	      },
	      getDaysInMonth: function getDaysInMonth(year, month) {
	        return new Date(year, month + 1, 0).getDate();
	      },
	      drawDay: function drawDay(lastDayOfMonth, yearNum, monthNum, dayNum, i) {
	        var calcDate, dateNow, dateString, day, dayDate, pastFutureClass;
	        day = $("<div></div>").addClass("day");
	        dateNow = new Date();
	        dateNow.setHours(0, 0, 0, 0);
	        dayDate = new Date(yearNum, monthNum - 1, dayNum);
	        if (dayDate.getTime() < dateNow.getTime()) {
	          pastFutureClass = "past";
	        } else if (dayDate.getTime() === dateNow.getTime()) {
	          pastFutureClass = "today";
	        } else {
	          pastFutureClass = "future";
	        }
	        day.addClass(this.weekDays[i % 7]);
	        day.addClass(pastFutureClass);
	        dateString = yearNum + "-" + this.addLeadingZero(monthNum) + "-" + this.addLeadingZero(dayNum);
	        if (dayNum <= 0 || dayNum > lastDayOfMonth) {
	          calcDate = new Date(yearNum, monthNum - 1, dayNum);
	          dayNum = calcDate.getDate();
	          monthNum = calcDate.getMonth() + 1;
	          yearNum = calcDate.getFullYear();
	          day.addClass("not-current").addClass(pastFutureClass);
	          if (this.options.activateNonCurrentMonths) {
	            dateString = yearNum + "-" + this.addLeadingZero(monthNum) + "-" + this.addLeadingZero(dayNum);
	          }
	        }
	        day.append($("<a>" + dayNum + "</a>").attr("data-day", dayNum).attr("data-month", monthNum).attr("data-year", yearNum));
	        if (this.options.monthChangeAnimation) {
	          this.applyTransform(day, 'rotateY(180deg)');
	          this.applyBackfaceVisibility(day);
	        }
	        day = this.makeActive(day, this.options.events[dateString]);
	        return this.$element.find('[data-group="days"]').append(day);
	      },
	      drawDays: function drawDays(year, month) {
	        var currentMonth, day, dayBase, days, delay, draw, firstDayOfMonth, i, lastDayOfMonth, loopBase, monthNum, multiplier, thisRef, time, timeout, yearNum, _i, _len;
	        thisRef = this;
	        time = new Date(year, month);
	        currentMonth = time.getMonth();
	        monthNum = time.getMonth() + 1;
	        yearNum = time.getFullYear();
	        time.setDate(1);
	        firstDayOfMonth = this.options.startFromSunday ? time.getDay() + 1 : time.getDay() || 7;
	        lastDayOfMonth = this.getDaysInMonth(year, month);
	        timeout = 0;
	        if (this.options.monthChangeAnimation) {
	          days = this.$element.find('[data-group="days"] .day');
	          for (i = _i = 0, _len = days.length; _i < _len; i = ++_i) {
	            day = days[i];
	            delay = i * 0.01;
	            this.applyTransition($(day), 'transform .5s ease ' + delay + 's');
	            this.applyTransform($(day), 'rotateY(180deg)');
	            this.applyBackfaceVisibility($(day));
	            timeout = (delay + 0.1) * 1000;
	          }
	        }
	        dayBase = 2;
	        if (this.options.allRows) {
	          loopBase = 42;
	        } else {
	          multiplier = Math.ceil((firstDayOfMonth - (dayBase - 1) + lastDayOfMonth) / 7);
	          loopBase = multiplier * 7;
	        }
	        this.$element.find("[data-head-year]").html(time.getFullYear());
	        this.$element.find("[data-head-month]").html(this.options.translateMonths[time.getMonth()]);
	        draw = function draw() {
	          var dayNum, setEvents;
	          thisRef.$element.find('[data-group="days"]').empty();
	          dayNum = dayBase - firstDayOfMonth;
	          i = thisRef.options.startFromSunday ? 0 : 1;
	          while (dayNum < loopBase - firstDayOfMonth + dayBase) {
	            thisRef.drawDay(lastDayOfMonth, yearNum, monthNum, dayNum, i);
	            dayNum = dayNum + 1;
	            i = i + 1;
	          }
	          setEvents = function setEvents() {
	            var _j, _len1;
	            days = thisRef.$element.find('[data-group="days"] .day');
	            for (i = _j = 0, _len1 = days.length; _j < _len1; i = ++_j) {
	              day = days[i];
	              thisRef.applyTransition($(day), 'transform .5s ease ' + i * 0.01 + 's');
	              thisRef.applyTransform($(day), 'rotateY(0deg)');
	            }
	            if (thisRef.options.onDayClick) {
	              thisRef.$element.find('[data-group="days"] .day a').click(function () {
	                return thisRef.options.onDayClick.call(this, thisRef.options.events);
	              });
	            }
	            if (thisRef.options.onDayHover) {
	              thisRef.$element.find('[data-group="days"] .day a').hover(function () {
	                return thisRef.options.onDayHover.call(this, thisRef.options.events);
	              });
	            }
	            if (thisRef.options.onActiveDayClick) {
	              thisRef.$element.find('[data-group="days"] .day.active a').click(function () {
	                return thisRef.options.onActiveDayClick.call(this, thisRef.options.events);
	              });
	            }
	            if (thisRef.options.onActiveDayHover) {
	              return thisRef.$element.find('[data-group="days"] .day.active a').hover(function () {
	                return thisRef.options.onActiveDayHover.call(this, thisRef.options.events);
	              });
	            }
	          };
	          return setTimeout(setEvents, 0);
	        };
	        setTimeout(draw, timeout);
	        return currentMonth;
	      }
	    };
	    $.fn.responsiveCalendar = function (option, params) {
	      var init, options, publicFunc;
	      options = $.extend({}, $.fn.responsiveCalendar.defaults, (typeof option === 'undefined' ? 'undefined' : _typeof(option)) === 'object' && option);
	      publicFunc = {
	        next: 'next',
	        prev: 'prev',
	        edit: 'editDays',
	        clear: 'clearDays',
	        clearAll: 'clearAll',
	        getYearMonth: 'getYearMonth',
	        jump: 'jump',
	        curr: 'curr'
	      };
	      init = function init($this) {
	        var data;
	        options = $.metadata ? $.extend({}, options, $this.metadata()) : options;
	        $this.data('calendar', data = new Calendar($this, options));
	        if (options.onInit) {
	          options.onInit.call(data);
	        }
	        return $this.find("[data-go]").click(function () {
	          if ($(this).data("go") === "prev") {
	            data.prev();
	          }
	          if ($(this).data("go") === "next") {
	            return data.next();
	          }
	        });
	      };
	      return this.each(function () {
	        var $this, data;
	        $this = $(this);
	        data = $this.data('calendar');
	        if (!data) {
	          init($this);
	        } else if (typeof option === 'string') {
	          if (publicFunc[option] != null) {
	            data[publicFunc[option]](params);
	          } else {
	            data.setMonthYear(option);
	          }
	        } else if (typeof option === 'number') {
	          data.jump(Math.abs(option) + 1);
	        }
	        return null;
	      });
	    };
	    $.fn.responsiveCalendar.defaults = {
	      translateMonths: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
	      events: {},
	      time: void 0,
	      allRows: true,
	      startFromSunday: false,
	      activateNonCurrentMonths: false,
	      monthChangeAnimation: true,
	      onInit: void 0,
	      onDayClick: void 0,
	      onDayHover: void 0,
	      onActiveDayClick: void 0,
	      onActiveDayHover: void 0,
	      onMonthChange: void 0
	    };
	    spy = $('[data-spy="responsive-calendar"]');
	    if (spy.length) {
	      opts = {};
	      if (spy.data('translate-months') != null) {
	        opts.translateMonths = spy.data('translate-months').split(',');
	      }
	      if (spy.data('time') != null) {
	        opts.time = spy.data('time');
	      }
	      if (spy.data('all-rows') != null) {
	        opts.allRows = spy.data('all-rows');
	      }
	      if (spy.data('start-from-sunday') != null) {
	        opts.startFromSunday = spy.data('start-from-sunday');
	      }
	      if (spy.data('activate-non-current-months') != null) {
	        opts.activateNonCurrentMonths = spy.data('activate-non-current-months');
	      }
	      if (spy.data('month-change-animation') != null) {
	        opts.monthChangeAnimation = spy.data('month-change-animation');
	      }
	      return spy.responsiveCalendar(opts);
	    }
	  })(jQuery);
	}).call(undefined);

/***/ })
/******/ ]);
//# sourceMappingURL=main.js.map