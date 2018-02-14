import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

@Component({
	selector: 'thermo-change-heating-plan-modal',
	templateUrl: './change-heating-plan-modal.component.html',
	styleUrls: ['./change-heating-plan-modal.component.scss']
})
export class ChangeHeatingPlanModalComponent implements OnInit {

	@Input() dayOfWeek = 0;
	@Input() planSelected = {};
	@Input() heatingPlans = [];
	@Output() onResult: EventEmitter<any> = new EventEmitter();

	constructor(public bsModalRef: BsModalRef) { }

	ngOnInit() {
	}

	selectPlan (planId) {
		this.onResult.emit(planId);
		this.bsModalRef.hide();
	}

}
