import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { HeatingPlan } from '../../types/types';

@Component({
	selector: 'thermo-change-heating-plan-modal',
	templateUrl: './change-heating-plan-modal.component.html',
	styleUrls: ['./change-heating-plan-modal.component.scss']
})
export class ChangeHeatingPlanModalComponent implements OnInit, OnChanges {

	@Input() planSelected: HeatingPlan;
	@Input() heatingPlans: Record<string, HeatingPlan>;
	@Output() result: EventEmitter<string> = new EventEmitter();

	heatingPlanList: HeatingPlan[];

	constructor(public bsModalRef: BsModalRef) { }

	ngOnInit() {
		this.updateHeatingPlanList();
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes.heatingPlans && changes.heatingPlans.currentValue) {
			this.updateHeatingPlanList();
		}
	}

	selectPlan(planId: string) {
		this.result.emit(planId);
		this.bsModalRef.hide();
	}

	private updateHeatingPlanList() {
		this.heatingPlanList = Object.values(this.heatingPlans).sort((a, b) => b.displayOrder - a.displayOrder);
	}

}
