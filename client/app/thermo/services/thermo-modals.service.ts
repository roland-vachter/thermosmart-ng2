import { Injectable } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ChangeHeatingPlanModalComponent } from '../components/change-heating-plan-modal/change-heating-plan-modal.component';
import { StatisticsModalComponent } from '../components/statistics-modal/statistics-modal.component';
import { ThermoConfigModalComponent } from '../components/thermo-config-modal/thermo-config-modal.component';
import { ThermoDataStoreService } from './thermo-data-store.service';
import { ThermoServerApiService } from './thermo-server-api.service';

@Injectable()
export class ThermoModalsService {
    constructor(
        private modalService: BsModalService,
        private dataStore: ThermoDataStoreService,
        private serverApiService: ThermoServerApiService
    ) {

    }

    showHeatingStatisticsModal () {
		this.modalService.show(StatisticsModalComponent, {
			class: 'modal-xl'
		});
	}

	showHeatingConfigModal () {
		this.dataStore.config['switchThresholdBelow'] = this.dataStore.config['switchThresholdBelow'] || {
			name: 'switchThresholdBelow',
			value: 0.2
		};

		this.dataStore.config['switchThresholdAbove'] = this.dataStore.config['switchThresholdAbove'] || {
			name: 'switchThresholdAbove',
			value: 0.2
		};

		const modalRef = this.modalService.show(ThermoConfigModalComponent, {
			initialState: {
				temps: this.dataStore.temperatureList,
				heatingDefaultPlans: this.dataStore.defaultHeatingPlans,
				switchThresholdBelow: this.dataStore.config['switchThresholdBelow'],
				switchThresholdAbove: this.dataStore.config['switchThresholdAbove']
			},
			class: 'modal-lg'
		});

		modalRef.content.onChangePlan.subscribe(this.showChangePlanModal.bind(this));
	}

    showChangePlanModal (dayOfWeek) {
		const modalRef = this.modalService.show(ChangeHeatingPlanModalComponent, {
			initialState: {
				dayOfWeek,
				planSelected: this.dataStore.defaultHeatingPlans[dayOfWeek].plan.ref,
				heatingPlans: this.dataStore.heatingPlanList
			},
			class: 'modal-lg'
		});

		modalRef.content.onResult.subscribe(planId => {
			if (typeof planId === 'number') {
				this.serverApiService.changeDefaultPlan(dayOfWeek, planId);
			}
		});
	}
}
