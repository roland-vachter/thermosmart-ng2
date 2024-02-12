import { Component, Input } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { SharedServerApiService } from '../../../shared/shared-server-api.service';
import { ALERT_TYPE, RESPONSE_STATUS } from '../../../types/types';
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
	timezone: string = this.locationService.getSelectedLocationTimezone();
	currentDayOfWeek: number = moment().tz(this.timezone).day();
	overrideToAdd: OverrideToAdd = {
		date: this.timezoneService.toSameDateInCurrentTimezone(moment(), this.timezone).toDate()
	} as OverrideToAdd;;

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
		const expected = switchConfig.value + diff;
		this.sharedApiService.changeConfig(switchConfig.name, switchConfig.value + diff).subscribe();
		switchConfig.value = expected;
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
}
