import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
	selector: 'thermo-change-sensor-settings-modal',
	templateUrl: './change-sensor-settings-modal.component.html',
	styleUrls: ['./change-sensor-settings-modal.component.scss']
})
export class ChangeSensorSettingsModalComponent implements OnInit {

	@Input() label:string = '';
	@Input() tempAdjust:number = 0;
	@Input() humidityAdjust:number = 0;
	@Output() onResult: EventEmitter<any> = new EventEmitter();

	constructor(public bsModalRef: BsModalRef) { }

	ngOnInit() {
	}

	onSubmit () {
		this.onResult.emit({
			label: this.label,
			tempAdjust: this.tempAdjust,
			humidityAdjust: this.humidityAdjust
		});
		this.bsModalRef.hide();
	}

}
