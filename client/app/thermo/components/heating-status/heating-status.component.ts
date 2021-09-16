import { Component, OnInit, Input } from '@angular/core';
import { ThermoDataStoreService } from '../../services/thermo-data-store.service';
import { ThermoServerApiService } from '../../services/thermo-server-api.service';

@Component({
  selector: 'thermo-heating-status',
  templateUrl: './heating-status.component.html',
  styleUrls: ['./heating-status.component.scss']
})
export class HeatingStatusComponent implements OnInit {
	public timerString;
	private heatingPowerOffInterval;
	private lastHeatingPowerStatus = false;
	
	constructor(
		protected dataStore: ThermoDataStoreService,
		private serverApiService: ThermoServerApiService
	) { }

	ngOnInit() {
		this.dataStore.evt.subscribe(() => {
			if (this.lastHeatingPowerStatus !== this.dataStore.heatingPower.status) {
				this.updateHeatingPower();
			}
		});
	}

	toggleStatus() {
		this.serverApiService.toggleHeatingPower();
	}

	updateHeatingPower() {
		this.lastHeatingPowerStatus = this.dataStore.heatingPower.status;

		if (!this.dataStore.heatingPower.status) {			
			this.heatingPowerOffInterval = setInterval(() => {
				const nowTime = new Date().getTime();
				const untilTime = this.dataStore.heatingPower.until.getTime();

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
		} else {
			clearInterval(this.heatingPowerOffInterval);
			this.timerString = '';
		}
	}

	tempAdjust(diff) {
		const expected = this.dataStore.targetTemp.ref.value + diff;
		this.serverApiService.tempAdjust(this.dataStore.targetTemp.ref._id, this.dataStore.targetTemp.ref.value + diff);
		this.dataStore.targetTemp.ref.value = expected;
	}
}
