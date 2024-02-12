import { Component, Input } from '@angular/core';
import { ThermoServerApiService } from '../../services/thermo-server-api.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ChangeSensorSettingsModalComponent } from '../change-sensor-settings-modal/change-sensor-settings-modal.component';
import { Sensor } from "../../types/types";
import { ThermoDataStoreService } from '../../services/thermo-data-store.service';

@Component({
	selector: 'thermo-sensor',
	templateUrl: './sensor.component.html',
	styleUrls: ['./sensor.component.scss']
})
export class SensorComponent {

	@Input() restartSensorInProgress;
	@Input() sensor: Sensor;


	constructor(
		private serverApiService: ThermoServerApiService,
		private modalService: BsModalService,
		private dataStore: ThermoDataStoreService
	) {	}

	toggleSensorStatus () {
		this.serverApiService.toggleSensorStatus(this.sensor.id).subscribe(res => {
			this.dataStore.handleServerData(res.data);
		});
	}

	disableSensorWindowOpen () {
		this.serverApiService.disableSensorWindowOpen(this.sensor.id).subscribe(res => {
			this.dataStore.handleServerData(res.data);
		});
	}

	changeLabel () {
		const initialState = {
			label: this.sensor.label || '',
			tempAdjust: this.sensor.tempAdjust || 0,
			humidityAdjust: this.sensor.humidityAdjust || 0
		};

		const modalRef = this.modalService.show(ChangeSensorSettingsModalComponent, {
			initialState
		});

		modalRef.content.result.subscribe(result => {
			if (result) {
				this.serverApiService.changeSensorSettings(this.sensor.id, result).subscribe(res => {
					this.dataStore.handleServerData(res.data);
				});
			}
		});
	}

}
