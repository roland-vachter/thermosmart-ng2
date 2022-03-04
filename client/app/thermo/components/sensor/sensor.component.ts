import { Component, OnInit, Input } from '@angular/core';
import { ThermoServerApiService } from '../../services/thermo-server-api.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ChangeSensorSettingsModalComponent } from '../change-sensor-settings-modal/change-sensor-settings-modal.component';
import { Sensor } from '../../../types/types';

@Component({
	selector: 'thermo-sensor',
	templateUrl: './sensor.component.html',
	styleUrls: ['./sensor.component.scss']
})
export class SensorComponent implements OnInit {

	@Input() restartSensorInProgress;
	@Input() sensor: Sensor;


	constructor(
		private serverApiService: ThermoServerApiService,
		private modalService: BsModalService
	) {	}

	ngOnInit() {
	}

	toggleSensorStatus () {
		this.serverApiService.toggleSensorStatus(this.sensor.id);
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

		modalRef.content.onResult.subscribe(result => {
			if (result) {
				this.serverApiService.changeSensorSettings(this.sensor.id, result);
			}
		});
	}

}
