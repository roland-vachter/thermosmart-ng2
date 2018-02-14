import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'thermo-heating-status',
  templateUrl: './heating-status.component.html',
  styleUrls: ['./heating-status.component.scss']
})
export class HeatingStatusComponent implements OnInit {

	@Input() isHeatingOn;
	
	constructor() { }

	ngOnInit() {
	}

}
