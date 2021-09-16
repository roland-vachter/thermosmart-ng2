import { Component, OnInit, Input } from '@angular/core';

@Component({
	selector: 'thermo-outside',
	templateUrl: './outside.component.html',
	styleUrls: ['./outside.component.scss']
})
export class OutsideComponent implements OnInit {

	@Input() temperature = null;
	@Input() humidity = null;
	@Input() weatherIconClass = null;

	constructor() { }

	ngOnInit() {
		
	}

}
