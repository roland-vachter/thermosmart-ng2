import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { SharedServerApiService } from '../../../shared/shared-server-api.service';
import { ThermoServerApiService } from '../../services/thermo-server-api.service';

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
	currentDate = new Date().getDay();

	constructor(
		public bsModalRef: BsModalRef,
		private serverApiService: ThermoServerApiService,
		private sharedApiService: SharedServerApiService
	) { }

	ngOnInit() {
	}

	tempAdjust (temp, diff) {
		const expected = temp.value + diff;
		this.serverApiService.tempAdjust(temp._id, temp.value + diff);
		temp.value = expected;
	}

	changePlan (dayOfWeek) {
		this.onChangePlan.emit(dayOfWeek);
	}

	switchAdjust (switchConfig, diff) {
		const expected = switchConfig.value + diff;
		this.sharedApiService.changeConfig(switchConfig.name, switchConfig.value + diff).subscribe();
		switchConfig.value = expected;
	}

}
