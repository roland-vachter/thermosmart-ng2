import { Component, OnInit } from '@angular/core';
import { ServerApiService } from './services/server-api.service';
import { ServerUpdateService } from '../shared/server-update.service';
import { SecuritySettingsModalComponent } from './components/security-settings-modal/security-settings-modal.component';
import { BsModalService } from 'ngx-bootstrap/modal';

enum HEALTH {
	OK = 'OK',
	PARTIAL = 'PARTIAL',
	FAIL = 'FAIL'
}

@Component({
	selector: 'security',
	templateUrl: './security.component.html',
	styleUrls: ['./security.component.scss']
})
export class SecurityComponent implements OnInit {

	HEALTH = HEALTH;

	status;
	lastActivity;
	lastArmedAt;
	alarmTriggeredCount = 0;

	cameraHealth: HEALTH = HEALTH.FAIL;
	controllerHealth: HEALTH = HEALTH.FAIL;
	keypadHealth: HEALTH = HEALTH.FAIL;
	motionSensorHealth: HEALTH = HEALTH.FAIL;

	constructor
		(
			private serverUpdateService: ServerUpdateService,
			private serverApiService: ServerApiService,
			private modalService: BsModalService
		) {	}

	toggleArming () {
		this.serverApiService.toggleArm().subscribe();
	}


	handleServerData (data) {
		if (data.security) {
			if (data.security.status) {
				this.status = data.security.status;

				if (this.status === 'arming') {
					this.lastArmedAt = new Date();
				}

				if (this.status === 'disarmed') {
					this.alarmTriggeredCount = 0;
				}
			}

			if (data.security.movement) {
				this.lastActivity = new Date();
			}

			if (data.security.lastActivity) {
				this.lastActivity = new Date(data.security.lastActivity);
			}

			if (data.security.lastArmedAt) {
				this.lastArmedAt = data.security.lastArmedAt;
			}

			if (data.security.alarmTriggeredCount) {
				this.alarmTriggeredCount = data.security.alarmTriggeredCount;
			}

			if (data.security.cameraHealth) {
				this.cameraHealth = data.security.cameraHealth;
			}

			if (data.security.controllerHealth) {
				this.controllerHealth = data.security.controllerHealth;
			}

			if (data.security.keypadHealth) {
				this.keypadHealth = data.security.keypadHealth;
			}

			if (data.security.motionSensorHealth) {
				this.motionSensorHealth = data.security.motionSensorHealth;
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

	showSettingsModal() {
		this.modalService.show(SecuritySettingsModalComponent, {
			class: 'modal-lg'
		});
	}

}
