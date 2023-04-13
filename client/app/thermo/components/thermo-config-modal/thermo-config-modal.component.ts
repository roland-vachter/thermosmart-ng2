import { Component, OnInit, Input } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { SharedServerApiService } from '../../../shared/shared-server-api.service';
import { ALERT_TYPE, RESPONSE_STATUS } from '../../../types/types';
import { ThermoDataStoreService } from '../../services/thermo-data-store.service';
import { ThermoModalsService } from '../../services/thermo-modals.service';
import { ThermoServerApiService } from '../../services/thermo-server-api.service';
import { HeatingPlan, HeatingPlanOverride } from '../../../types/types';
import { SharedModalsService } from '../../../shared/shared-modals.service';
import * as moment from 'moment-timezone';

interface OverrideToAdd {
	plan: HeatingPlan;
	date: Date;
}

@Component({
	selector: 'thermo-config-modal',
	templateUrl: './thermo-config-modal.component.html',
	styleUrls: ['./thermo-config-modal.component.scss']
})
export class ThermoConfigModalComponent implements OnInit {

	@Input() temps = [];
	@Input() switchThresholdBelow = {
		name: '',
		value: NaN
	};
	@Input() switchThresholdAbove = {
		name: '',
		value: NaN
	};
	currentDate = new Date().getDay();
	overrideToAdd: OverrideToAdd = {} as OverrideToAdd;

	constructor(
		public bsModalRef: BsModalRef,
		private serverApiService: ThermoServerApiService,
		private sharedApiService: SharedServerApiService,
		public dataStore: ThermoDataStoreService,
		private modalService: ThermoModalsService,
		private sharedModalsService: SharedModalsService
	) { }

	ngOnInit() {
	}

	tempAdjust(temp, diff) {
		const expected = temp.value + diff;
		this.serverApiService.tempAdjust(temp._id, temp.value + diff);
		temp.value = expected;
	}

	changePlan(dayOfWeek) {
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

	switchAdjust(switchConfig, diff) {
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
		this.overrideToAdd = {} as OverrideToAdd;
	}

	addOverride() {
		this.serverApiService.addPlanOverride(moment(this.overrideToAdd.date), this.overrideToAdd.plan._id)
			.subscribe(result => {
				if (result.status === RESPONSE_STATUS.OK) {
					this.dataStore.heatingPlanOverrides.push({
						date: moment(this.overrideToAdd.date).tz('Europe/Bucharest').startOf('day'),
						plan: this.overrideToAdd.plan
					});
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
