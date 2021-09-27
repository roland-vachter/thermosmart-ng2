import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ServerApiService } from '../../services/server-api.service';

@Component({
	selector: 'security-settings-modal',
	templateUrl: './security-settings-modal.component.html',
	styleUrls: ['./security-settings-modal.component.scss']
})
export class SecuritySettingsModalComponent implements OnInit {

	@Input() dayOfWeek = 0;
	@Input() planSelected = {};
	@Input() heatingPlans = [];
	@Output() onResult: EventEmitter<any> = new EventEmitter();

	cameras = [];
	newCameraIp = '';
	cameraReason;

	controllers = [];
	newControllerId = '';
	controllerReason;

	constructor(
		public bsModalRef: BsModalRef,
		private serverApiService: ServerApiService
	) { }

	ngOnInit() {
		this.getCameras();
		this.getControllers();
	}

	getCameras() {
		this.serverApiService.getSecurityCameras().subscribe(cameras => {
			this.cameras = cameras;
		});
	}

	removeCameraIp(ip: string) {
		this.serverApiService.removeSecurityCamera(ip).subscribe(() => {
			this.getCameras();
		});
	}

	addCameraIp() {
		this.serverApiService.addSecurityCamera(this.newCameraIp).subscribe((result) => {
			if (result.status === 'error') {
				this.cameraReason = result.reason;
			} else {
				this.newCameraIp = '';
				this.cameraReason = null;
				this.getCameras();
			}
		})
	}


	getControllers() {
		this.serverApiService.getSecurityControllers().subscribe(controllers => {
			this.controllers = controllers;
		});
	}

	removeControllerId(id: string) {
		this.serverApiService.removeSecurityController(id).subscribe(() => {
			this.getControllers();
		});
	}

	addControllerId() {
		this.serverApiService.addSecurityController(this.newControllerId).subscribe((result) => {
			if (result.status === 'error') {
				this.controllerReason = result.reason;
			} else {
				this.newControllerId = '';
				this.controllerReason = null;
				this.getControllers();
			}
		})
	}

}
