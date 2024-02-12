import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ThermoDataStoreService } from '../../services/thermo-data-store.service';

@Component({
	selector: 'thermo-heating-current-plan',
	templateUrl: './heating-current-plan.component.html',
	styleUrls: ['./heating-current-plan.component.scss']
})
export class HeatingCurrentPlanComponent implements OnInit {

	constructor(
		public dataStore: ThermoDataStoreService,
		private cdRef: ChangeDetectorRef
	) { }

	ngOnInit() {
		this.dataStore.evt.subscribe(() => {
			this.cdRef.detectChanges();
		})
	}

}
