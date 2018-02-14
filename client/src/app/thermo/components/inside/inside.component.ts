import { Component, OnInit, Input } from '@angular/core';

@Component({
	selector: 'thermo-inside',
	templateUrl: './inside.component.html',
	styleUrls: ['./inside.component.scss']
})
export class InsideComponent implements OnInit {

	@Input() temperature = null;
	@Input() humidity = null;

	constructor() { }

	ngOnInit() {
	}

}
