import { Component, Input } from '@angular/core';

@Component({
	selector: 'thermo-inside',
	templateUrl: './inside.component.html',
	styleUrls: ['./inside.component.scss']
})
export class InsideComponent {

	@Input() temperature: number;
	@Input() humidity: number;

	constructor() { }

}
