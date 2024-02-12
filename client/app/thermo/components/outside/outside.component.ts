import { Component, Input } from '@angular/core';

@Component({
	selector: 'thermo-outside',
	templateUrl: './outside.component.html',
	styleUrls: ['./outside.component.scss']
})
export class OutsideComponent {

	@Input() temperature: number;
	@Input() humidity: number;
	@Input() weatherIconClass: string;

	constructor() { }

}
