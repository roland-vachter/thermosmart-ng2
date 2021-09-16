import { Component, OnInit, Input } from '@angular/core';
import { ThermoServerApiService } from '../../services/thermo-server-api.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ChangeSensorSettingsModalComponent } from '../change-sensor-settings-modal/change-sensor-settings-modal.component';

@Component({
	selector: 'thermo-sensor',
	templateUrl: './sensor.component.html',
	styleUrls: ['./sensor.component.scss']
})
export class SensorComponent implements OnInit {

	@Input() id;
	@Input() temperature;
	@Input() humidity;
	@Input() active;
	@Input() enabled;
	@Input() label;
	@Input() tempAdjust;
	@Input() humidityAdjust;
	@Input() restartSensorInProgress;


	constructor(
		private serverApiService: ThermoServerApiService,
		private modalService: BsModalService
	) {	}

	ngOnInit() {
	}

	toggleSensorStatus () {
		this.serverApiService.toggleSensorStatus(this.id);
	}

	changeLabel () {
		const initialState = {
			label: this.label || '',
			tempAdjust: this.tempAdjust || 0,
			humidityAdjust: this.humidityAdjust || 0
		};

		const modalRef = this.modalService.show(ChangeSensorSettingsModalComponent, {
			initialState
		});

		modalRef.content.onResult.subscribe(result => {
			if (result) {
				this.serverApiService.changeSensorSettings(this.id, result);
			}
		});
	}

}
