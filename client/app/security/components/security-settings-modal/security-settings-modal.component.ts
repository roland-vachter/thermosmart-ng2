import { Component, OnInit, Input } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { SharedServerApiService } from '../../../shared/shared-server-api.service';
import { Camera, Controller } from '../../types/types';
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

	cameras: Camera[] = [];
	newCameraIp = '';
	cameraReason: string;

	controllers: Controller[] = [];
	newControllerId = '';
	controllerReason: string;

	motionSensorCount = 0;
	motionSensorReason: string;

	motionSensorCountConfigName = 'motionSensorCount';

	constructor(
		public bsModalRef: BsModalRef,
		private serverApiService: ServerApiService,
		private sharedApiService: SharedServerApiService
	) { }

	ngOnInit() {
		this.getCameras();
		this.getControllers();
		this.getMotionSensorCount();
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

	getMotionSensorCount() {
		this.sharedApiService.getConfig(this.motionSensorCountConfigName).subscribe(result => {
			if (typeof result === 'number') {
				this.motionSensorCount = result;
			}
		})
	}

	changeMotionSensorCount() {
		if (typeof this.motionSensorCount !== 'number' || this.motionSensorCount <= 0) {
			this.motionSensorReason = 'Count should be a positive number.';
		} else {
			this.sharedApiService.changeConfig(this.motionSensorCountConfigName, this.motionSensorCount).subscribe(result => {
				if (result.status === 'error') {
					this.motionSensorReason = result.reason;
				} else {
					this.motionSensorReason = null;
				}
			});
		}
	}

}
