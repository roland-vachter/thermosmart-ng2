import { Component, Input } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { SharedServerApiService } from '../../../shared/shared-server-api.service';
import { ALERT_TYPE, Location, LOCATION_FEATURE, RESPONSE_STATUS } from '../../../types/types';
import { ThermoDataStoreService } from '../../services/thermo-data-store.service';
import { ThermoModalsService } from '../../services/thermo-modals.service';
import { ThermoServerApiService } from '../../services/thermo-server-api.service';
import { SharedModalsService } from '../../../shared/shared-modals.service';
import * as moment from 'moment-timezone';
import { HeatingPlan, HeatingPlanOverride, Temperature } from '../../types/types';
import { TimezoneService } from '../../../shared/services/timezone.service';
import { LocationService } from '../../../services/location.service';

interface OverrideToAdd {
	plan: HeatingPlan;
	date: Date;
}

@Component({
	selector: 'thermo-config-modal',
	templateUrl: './thermo-config-modal.component.html',
	styleUrls: ['./thermo-config-modal.component.scss']
})
export class ThermoConfigModalComponent {
	@Input() switchThresholdBelow = {
		name: '',
		value: NaN
	};
	@Input() switchThresholdAbove = {
		name: '',
		value: NaN
	};
	@Input() temperatureTrendsFeature: boolean;
	@Input() weatherForecastFeature: boolean;

	location: Location = this.locationService.getSelectedLocation();
	hasSolarSystemHeatingFeature = this.locationService.hasFeature(this.location, LOCATION_FEATURE.SOLAR_SYSTEM_HEATING);
	timezone: string = this.locationService.getSelectedLocationTimezone();
	currentDayOfWeek: number = moment().tz(this.timezone).day();
	overrideToAdd: OverrideToAdd = {
		date: this.timezoneService.toSameDateInCurrentTimezone(moment(), this.timezone).toDate()
	} as OverrideToAdd;

	solarSystemHeatingTemperature: number;
	solarSystemInverterType: string;
	solarSystemApiUrl: string;
	solarSystemUsername: string;
	solarSystemPassword: string = '';
	solarSystemPasswordSet = false;
	solarSystemStationCode: string;
	solarSystemGridPowerAllowance: number;

	constructor(
		public bsModalRef: BsModalRef,
		private serverApiService: ThermoServerApiService,
		private sharedApiService: SharedServerApiService,
		public dataStore: ThermoDataStoreService,
		private modalService: ThermoModalsService,
		private sharedModalsService: SharedModalsService,
		private timezoneService: TimezoneService,
		private locationService: LocationService
	) {
		if (this.dataStore?.config) {
			this.solarSystemHeatingTemperature = this.dataStore.config.solarSystemHeatingTemperature?.value as number || 24;
			this.solarSystemInverterType = this.dataStore.config.solarSystemInverterType?.value as string;
			this.solarSystemApiUrl = this.dataStore.config.solarSystemApiUrl?.value as string;
			this.solarSystemUsername = this.dataStore.config.solarSystemUsername?.value as string;
			this.solarSystemPasswordSet = this.dataStore.config.solarSystemPassword?.value as string === 'PRIVATE';
			this.solarSystemStationCode = this.dataStore.config.solarSystemStationCode?.value as string;
			this.solarSystemGridPowerAllowance = this.dataStore.config.solarSystemGridPowerAllowance?.value as number;
		}
	}

	tempAdjust(temp: Temperature, diff: number) {
		const expected = temp.value + diff;
		this.serverApiService.tempAdjust(temp._id, expected).subscribe(res => {
			if (res.status === RESPONSE_STATUS.OK) {
				temp.value = expected;
			}
		});
	}

	changePlan(dayOfWeek: number) {
		this.modalService.selectPlanModal(this.dataStore.defaultHeatingPlans[dayOfWeek].plan)
			.subscribe(planId => {
				if (typeof planId === 'number') {
					this.serverApiService.changeDefaultPlan(dayOfWeek, planId).subscribe(() => {
						this.dataStore.defaultHeatingPlans[dayOfWeek].plan = this.dataStore.heatingPlans[planId];
						this.dataStore.defaultHeatingPlans = [...this.dataStore.defaultHeatingPlans];
						this.dataStore.updateTodaysPlan();
					});
				}
			});
	}

	switchAdjust(switchConfig, diff: number) {
		const previousValue = switchConfig.value;
		switchConfig.value = Math.round((switchConfig.value + diff) * 10) / 10;
		this.sharedApiService.changeConfig(switchConfig.name, switchConfig.value).subscribe({
			next: () => {},
			error: () => {
				switchConfig.value = previousValue;
			}
		});
	}

	selectPlan() {
		this.modalService.selectPlanModal()
			.subscribe(planId => {
				if (typeof planId === 'number') {
					this.overrideToAdd.plan = this.dataStore.heatingPlans[planId];
				}
			})
	}

	clearOverrideToAdd() {
		this.overrideToAdd = {
			date: this.timezoneService.toSameDateInCurrentTimezone(new Date(), this.timezone).toDate()
		} as OverrideToAdd;
	}

	addOverride() {
		const overrideDate = this.timezoneService.toSameDateInTimezone(this.overrideToAdd.date, this.timezone).startOf('day');
		this.serverApiService.addPlanOverride(
			overrideDate, this.overrideToAdd.plan._id
		).subscribe(result => {
				if (result.status === RESPONSE_STATUS.OK) {
					const foundOverrideForTheDate = this.dataStore.heatingPlanOverrides
						.find(o => o.date.isSame(overrideDate));
					if (foundOverrideForTheDate) {
						foundOverrideForTheDate.plan = this.overrideToAdd.plan;
					} else {
						this.dataStore.heatingPlanOverrides.push({
							date: overrideDate,
							plan: this.overrideToAdd.plan
						});
					}
					this.clearOverrideToAdd();
					this.dataStore.updateTodaysPlan();
				} else {
					this.sharedModalsService.alert(result.reason, ALERT_TYPE.ERROR);
				}
			});
	}

	removeOverride(planOverride: HeatingPlanOverride) {
		this.serverApiService.removePlanOverride(planOverride.date)
			.subscribe(result => {
				if (result.status === RESPONSE_STATUS.OK) {
					this.dataStore.heatingPlanOverrides.splice(this.dataStore.heatingPlanOverrides.indexOf(planOverride), 1);
					this.dataStore.updateTodaysPlan();
				} else {
					this.sharedModalsService.alert(result.reason, ALERT_TYPE.ERROR);
				}
			});
	}

	toggleTemperatureTrendsFeature(evt: InputEvent) {
		this.temperatureTrendsFeature = (evt.target as HTMLInputElement).checked;

		this.sharedApiService.changeConfig('temperatureTrendsFeature', (evt.target as HTMLInputElement).checked).subscribe({
			next: () => {},
			error: () => {
				setTimeout(() => this.temperatureTrendsFeature = !(evt.target as HTMLInputElement).checked);
			}
		});
	}

	toggleWeatherForecastFeature(evt: InputEvent) {
		this.weatherForecastFeature = (evt.target as HTMLInputElement).checked;

		this.sharedApiService.changeConfig('weatherForecastFeature', (evt.target as HTMLInputElement).checked).subscribe({
			next: () => {},
			error: () => {
				setTimeout(() => this.weatherForecastFeature = !(evt.target as HTMLInputElement).checked);
			}
		});
	}

	saveSolarSystemHeatingTemperature() {
		this.sharedApiService.changeConfig('solarSystemHeatingTemperature', this.solarSystemHeatingTemperature).subscribe({
			next: () => {
				this.dataStore.config.solarSystemHeatingTemperature = {
					name: 'solarSystemHeatingTemperature',
					value: this.solarSystemHeatingTemperature
				};
			},
			error: () => {
				this.solarSystemHeatingTemperature = this.dataStore?.config?.solarSystemHeatingTemperature?.value as number;
			}
		})
	}

	saveSolarSystemInverterType() {
		this.sharedApiService.changeConfig('solarSystemInverterType', this.solarSystemInverterType).subscribe({
			next: () => {
				this.dataStore.config.solarSystemInverterType = {
					name: 'solarSystemInverterType',
					value: this.solarSystemInverterType
				};
			},
			error: () => {
				this.solarSystemInverterType = this.dataStore?.config?.solarSystemInverterType?.value as string;
			}
		})
	}

	saveSolarSystemApiUrl() {
		this.sharedApiService.changeConfig('solarSystemApiUrl', this.solarSystemApiUrl).subscribe({
			next: () => {
				this.dataStore.config.solarSystemApiUrl = {
					name: 'solarSystemApiUrl',
					value: this.solarSystemApiUrl
				};
			},
			error: () => {
				this.solarSystemApiUrl = this.dataStore?.config?.solarSystemApiUrl?.value as string;
			}
		})
	}

	saveSolarSystemUsername() {
		this.sharedApiService.changeConfig('solarSystemUsername', this.solarSystemUsername).subscribe({
			next: () => {
				this.dataStore.config.solarSystemUsername = {
					name: 'solarSystemUsername',
					value: this.solarSystemUsername
				};
			},
			error: () => {
				this.solarSystemUsername = this.dataStore?.config?.solarSystemUsername?.value as string;
			}
		})
	}

	saveSolarSystemPassword() {
		if (this.solarSystemPassword) {
			this.sharedApiService.changeConfig('solarSystemPassword', this.solarSystemPassword, {
				encrypted: true,
				private: true
			}).subscribe({
				next: () => {
					this.dataStore.config.solarSystemPassword = {
						name: 'solarSystemPassword',
						value: 'PRIVATE'
					};
				},
				error: () => {
					this.solarSystemPassword = this.dataStore?.config?.solarSystemPassword?.value as string;
				}
			});
		}
	}

	saveGridPowerAllowance() {
		this.sharedApiService.changeConfig('solarSystemGridPowerAllowance', this.solarSystemGridPowerAllowance).subscribe({
			next: () => {
				this.dataStore.config.solarSystemGridPowerAllowance = {
					name: 'solarSystemGridPowerAllowance',
					value: this.solarSystemGridPowerAllowance
				};
			},
			error: () => {
				this.solarSystemGridPowerAllowance = this.dataStore?.config?.solarSystemGridPowerAllowance?.value as number;
			}
		})
	}

	saveSolarSystemStationCode() {
		this.sharedApiService.changeConfig('solarSystemStationCode', this.solarSystemStationCode).subscribe({
			next: () => {
				this.dataStore.config.solarSystemStationCode = {
					name: 'solarSystemStationCode',
					value: this.solarSystemStationCode
				};
			},
			error: () => {
				this.solarSystemStationCode = this.dataStore?.config?.solarSystemStationCode?.value as string;
			}
		})
	}

}
