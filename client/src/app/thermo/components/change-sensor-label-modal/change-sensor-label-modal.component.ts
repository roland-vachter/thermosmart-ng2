import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

@Component({
	selector: 'thermo-change-sensor-label-modal',
	templateUrl: './change-sensor-label-modal.component.html',
	styleUrls: ['./change-sensor-label-modal.component.scss']
})
export class ChangeSensorLabelModalComponent implements OnInit {

	@Input() label = '';
	@Output() onResult: EventEmitter<any> = new EventEmitter();

	constructor(public bsModalRef: BsModalRef) { }

	ngOnInit() {
	}

	onSubmit () {
		this.onResult.emit(this.label);
		this.bsModalRef.hide();
	}

}
