import { Component, OnInit, Input } from '@angular/core';
import { ServerApiService } from '../../services/server-api.service';

@Component({
	selector: 'thermo-heating-power',
	templateUrl: './heating-power.component.html',
	styleUrls: ['./heating-power.component.scss']
})
export class HeatingPowerComponent implements OnInit {

	@Input() status;
	@Input() until;
	timerString;
	interval;

	constructor(private serverApiService: ServerApiService) { }

	toggleStatus () {
		this.serverApiService.toggleHeatingPower();
	}

	ngOnInit() {
	}

	ngOnChanges(changes) {
		let statusChanged = false;
		for (let propName in changes) {
			if (propName === 'status') {
				statusChanged = true;
			}
		}

		if (statusChanged) {
			clearInterval(this.interval);
			this.timerString = '';
			
			if (this.status === false) {	
				this.interval = setInterval(() => {
					const nowTime = new Date().getTime();
					const untilTime = this.until.getTime();

					if (untilTime < nowTime) {
						this.timerString = '';
						return;
					}

					const hours = Math.floor((untilTime - nowTime) / (60 * 60 * 1000) % 24);
					const hoursPad2 = ('0' + hours).slice(-2);

					const minutes = Math.floor((untilTime - nowTime) / (60 * 1000) % 60);
					const minutesPad2 = ('0' + minutes).slice(-2);

					const seconds = Math.floor((untilTime - nowTime) / 1000 % 60);
					const secondsPad2 = ('0' + seconds).slice(-2);

					this.timerString = `${hours ? hoursPad2 + ':' : ''}${seconds || minutes || hours ? minutesPad2 + ':' : ''}${seconds || minutes || hours ? secondsPad2 : ''}`;
				}, 1000);
			}
		}
	}

}
