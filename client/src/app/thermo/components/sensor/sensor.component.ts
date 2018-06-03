import { Component, OnInit, Input } from '@angular/core';
import { ServerApiService } from '../../services/server-api.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ChangeSensorLabelModalComponent } from '../change-sensor-label-modal/change-sensor-label-modal.component';

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
	@Input() restartSensorInProgress;

	toggleSensorStatus () {
		this.serverApiService.toggleSensorStatus(this.id);
	}

	changeLabel () {
		const initialState = {
			label: ''
		};
		if (this.label) {
			initialState.label = this.label;
		}

		const modalRef = this.modalService.show(ChangeSensorLabelModalComponent, {
			initialState
		});

		modalRef.content.onResult.subscribe(result => {
			if (result) {
				this.serverApiService.changeSensorLabel(this.id, result);
			}
		});
	}

	constructor(
			private serverApiService: ServerApiService,
			private modalService: BsModalService) {
	}

	ngOnInit() {
	}

}
