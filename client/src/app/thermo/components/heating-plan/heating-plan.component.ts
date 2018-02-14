import { Component, OnInit, Input } from '@angular/core';

@Component({
	selector: 'thermo-heating-plan',
	templateUrl: './heating-plan.component.html',
	styleUrls: ['./heating-plan.component.scss']
})
export class HeatingPlanComponent implements OnInit {

	@Input() plan;

	constructor() { }

	ngOnInit() {
	}

}
