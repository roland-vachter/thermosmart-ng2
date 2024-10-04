import { Component } from '@angular/core';
import { ThermoDataStoreService } from '../../services/thermo-data-store.service';

@Component({
	selector: 'thermo-outside',
	templateUrl: './outside.component.html',
	styleUrls: ['./outside.component.scss']
})
export class OutsideComponent {

	constructor(
		public dataStore: ThermoDataStoreService
	) { }

}
