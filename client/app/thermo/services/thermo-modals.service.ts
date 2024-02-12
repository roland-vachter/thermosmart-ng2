import { Injectable } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ChangeHeatingPlanModalComponent } from '../components/change-heating-plan-modal/change-heating-plan-modal.component';
import { StatisticsModalComponent } from '../components/statistics-modal/statistics-modal.component';
import { HeatingPlan } from '../types/types';
import { ThermoDataStoreService } from './thermo-data-store.service';

@Injectable()
export class ThermoModalsService {
    constructor(
        private modalService: BsModalService,
        private dataStore: ThermoDataStoreService
    ) {

    }

    showHeatingStatisticsModal () {
		this.modalService.show(StatisticsModalComponent, {
			class: 'modal-xl'
		});
	}

	selectPlanModal(planSelected?: HeatingPlan) {
		const modalRef = this.modalService.show(ChangeHeatingPlanModalComponent, {
			initialState: {
				planSelected,
				heatingPlans: this.dataStore.heatingPlans
			},
			class: 'modal-lg'
		});

		return modalRef.content.result;
	}
}
