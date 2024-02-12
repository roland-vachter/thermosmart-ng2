import { Component } from '@angular/core';
import { ResponsivityService } from '../../../shared/reponsivity.service';
import { ThermoDataStoreService } from '../../services/thermo-data-store.service';

@Component({
	selector: 'thermo-sensor-list',
	templateUrl: './sensor-list.component.html',
	styleUrls: ['./sensor-list.component.scss']
})
export class SensorListComponent {

	constructor(
		public dataStore: ThermoDataStoreService,
		protected responsivityService: ResponsivityService
	) {	}

}
