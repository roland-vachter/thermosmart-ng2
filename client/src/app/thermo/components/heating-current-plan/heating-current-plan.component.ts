import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ChangeHeatingPlanModalComponent } from '../change-heating-plan-modal/change-heating-plan-modal.component';

@Component({
	selector: 'thermo-heating-current-plan',
	templateUrl: './heating-current-plan.component.html',
	styleUrls: ['./heating-current-plan.component.scss']
})
export class HeatingCurrentPlanComponent implements OnInit {

	@Input() todaysPlan;
	@Input() targetTemp;
	@Input() currentTime;
	@Input() percentInDay;
	@Output() onChangePlan: EventEmitter<any> = new EventEmitter();

	constructor() { }

	ngOnInit() {
	}

	changePlan () {
		this.onChangePlan.emit(new Date().getDay());
	}

}
