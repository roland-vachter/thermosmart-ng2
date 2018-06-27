import { Component, OnInit } from '@angular/core';
import { ServerApiService } from './services/server-api.service';
import { ServerUpdateService } from '../shared/server-update.service';

@Component({
	selector: 'security',
	templateUrl: './security.component.html',
	styleUrls: ['./security.component.scss']
})
export class SecurityComponent implements OnInit {

	status;
	lastActivity;
	lastArmedAt;
	alarmTriggered = 0;

	constructor
		(
			private serverUpdateService: ServerUpdateService,
			private serverApiService: ServerApiService
		) {

	}

	toggleArming () {
		this.serverApiService.toggleArm();
	}


	handleServerData (data) {
		if (data.security) {
			if (data.security.status) {
				this.status = data.security.status;

				if (this.status === 'arming') {
					this.lastArmedAt = new Date();
				}

				if (this.status === 'disarmed') {
					this.alarmTriggered = 0;
				}
			}

			if (data.security.movement) {
				this.lastActivity = new Date();
			}

			if (data.security.lastActivity) {
				this.lastActivity = new Date(data.security.lastActivity);
			}

			if (data.security.alarm) {
				this.alarmTriggered++;
			}

			if (data.security.lastArmedAt) {
				this.lastArmedAt = data.security.lastArmedAt;
			}

			if (data.security.alarmTriggered) {
				this.alarmTriggered = data.security.alarmTriggered;
			}
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
