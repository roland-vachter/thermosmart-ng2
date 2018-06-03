import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { ServerApiService } from '../../services/server-api.service';

@Component({
	selector: 'thermo-config-modal',
	templateUrl: './thermo-config-modal.component.html',
	styleUrls: ['./thermo-config-modal.component.scss']
})
export class ThermoConfigModalComponent implements OnInit {

	@Input() temps = [];
	@Input() heatingDefaultPlans = [];
	@Input() switchThresholdBelow = {
		name: '',
		value: NaN
	};
	@Input() switchThresholdAbove = {
		name: '',
		value: NaN
	};
	@Output() onChangePlan: EventEmitter<any> = new EventEmitter();

	constructor(
			public bsModalRef: BsModalRef,
			private serverApiService: ServerApiService) { }

	ngOnInit() {
	}

	tempAdjust (temp, diff) {
		this.serverApiService.tempAdjust(temp._id, temp.value + diff);
	}

	changePlan (dayOfWeek) {
		this.onChangePlan.emit(dayOfWeek);
	}

	switchAdjust (switchConfig, diff) {
		this.serverApiService.changeConfig(switchConfig.name, switchConfig.value + diff);
	}

}
