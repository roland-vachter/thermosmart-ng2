import { Component, OnInit } from '@angular/core';
import { ServerApiService } from './services/server-api.service';
import { ServerUpdateService } from '../shared/server-update.service';

@Component({
	selector: 'plantwatering',
	templateUrl: './plantwatering.component.html',
	styleUrls: ['./plantwatering.component.scss']
})
export class PlantwateringComponent implements OnInit {

	status;

	constructor
		(
			private serverUpdateService: ServerUpdateService,
			private serverApiService: ServerApiService
		) {

	}

	handleServerData (data) {
		if (data.plantWatering) {
			this.status = data.plantWatering.status;

			console.log('status', this.status);
		}
	}

	init () {
		this.serverApiService.init()
			.subscribe(this.handleServerData.bind(this));
	}

	refresh () {
		this.init();
	}

	ngOnInit() {
		this.init();

		this.serverUpdateService.onUpdate()
			.subscribe(this.handleServerData.bind(this));
	}

}