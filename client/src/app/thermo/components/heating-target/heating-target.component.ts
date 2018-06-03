import { Component, OnInit, Input } from '@angular/core';
import { ServerApiService } from '../../services/server-api.service';

@Component({
  selector: 'thermo-heating-target',
  templateUrl: './heating-target.component.html',
  styleUrls: ['./heating-target.component.scss']
})
export class HeatingTargetComponent implements OnInit {

	@Input() targetTemp;

	tempAdjust (diff) {
		this.serverApiService.tempAdjust(this.targetTemp.ref._id, this.targetTemp.ref.value + diff);
	}

	constructor(private serverApiService: ServerApiService) { }

	ngOnInit() {
	}

}
