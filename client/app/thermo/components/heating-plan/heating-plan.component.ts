import { Component, Input } from '@angular/core';
import { HeatingPlan } from '../../types/types';

@Component({
	selector: 'thermo-heating-plan',
	templateUrl: './heating-plan.component.html',
	styleUrls: ['./heating-plan.component.scss']
})
export class HeatingPlanComponent {

	@Input() plan: HeatingPlan;

	constructor() { }

}
