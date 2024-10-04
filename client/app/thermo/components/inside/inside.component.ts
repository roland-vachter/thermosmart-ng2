import { Component } from '@angular/core';
import { ThermoDataStoreService } from '../../services/thermo-data-store.service';

@Component({
	selector: 'thermo-inside',
	templateUrl: './inside.component.html',
	styleUrls: ['./inside.component.scss']
})
export class InsideComponent {

	constructor(
		public dataStore: ThermoDataStoreService
	) { }
}
