import { Component, OnInit } from '@angular/core';
import { ThermoDataStoreService } from '../../services/thermo-data-store.service';
import { ThermoModalsService } from '../../services/thermo-modals.service';

@Component({
	selector: 'thermo-heating-current-plan',
	templateUrl: './heating-current-plan.component.html',
	styleUrls: ['./heating-current-plan.component.scss']
})
export class HeatingCurrentPlanComponent implements OnInit {

	constructor(
		public dataStore: ThermoDataStoreService,
		private modalService: ThermoModalsService
	) { }

	ngOnInit() {
	}

	changePlan () {
		this.modalService.showChangePlanModal(new Date().getDay());
	}

}
