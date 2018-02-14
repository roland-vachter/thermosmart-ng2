import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'thermo-heating-duration',
  templateUrl: './heating-duration.component.html',
  styleUrls: ['./heating-duration.component.scss']
})
export class HeatingDurationComponent implements OnInit {

	@Input() heatingDuration;

	constructor() { }

	ngOnInit() {
	}

}
