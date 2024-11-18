import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { RESPONSE_STATUS } from '../../../types/types';
import { ThermoActionsService } from '../../services/thermo-actions.service';
import { ThermoDataStoreService } from '../../services/thermo-data-store.service';
import { ThermoModalsService } from '../../services/thermo-modals.service';
import { ThermoServerApiService } from '../../services/thermo-server-api.service';
import { ThermoConfigModalComponent } from '../thermo-config-modal/thermo-config-modal.component';

@Component({
  selector: 'thermo-heating-status',
  templateUrl: './heating-status.component.html',
  styleUrls: ['./heating-status.component.scss']
})
export class HeatingStatusComponent implements OnInit {
	@ViewChild('powerSwitch') powerSwitchEl: ElementRef<HTMLInputElement>;

	public timerString: string;
	onHold: boolean = true;
	private heatingPowerOffInterval: number;
	private lastHeatingPowerStatus = false;
	
	constructor(
		public dataStore: ThermoDataStoreService,
		private serverApiService: ThermoServerApiService,
		private modalService: ThermoModalsService,
		private actionsService: ThermoActionsService,
		private bsModalService: BsModalService,
		private cdRef: ChangeDetectorRef
	) { }

	ngOnInit() {
		this.dataStore.evt.subscribe(() => {
			if (this.lastHeatingPowerStatus !== this.dataStore.heatingPower.status) {
				this.updateHeatingPower();
			}

			if (this.dataStore.heatingConditions.hasFavorableWeatherForecast ||
				this.dataStore.heatingConditions.hasIncreasingTrend ||
				this.dataStore.heatingConditions.hasWindowOpen) {
				this.onHold = true;
			} else {
				this.onHold = false;
			}
			this.cdRef.detectChanges();
		});
		this.updateHeatingPower();
	}

	toggleStatus() {
		if (!this.dataStore.heatingPower.status || !this.onHold) {
			this.serverApiService.toggleHeatingPower().subscribe(res => {
				this.dataStore.handleServerData(res?.data);

				if (this.powerSwitchEl?.nativeElement) {
					this.powerSwitchEl.nativeElement.checked = this.dataStore.heatingPower.status && !this.onHold;
				}
			});
		} else {
			this.serverApiService.ignoreHoldConditions().subscribe(res => {
				this.dataStore.handleServerData(res?.data);

				if (this.powerSwitchEl?.nativeElement) {
					this.powerSwitchEl.nativeElement.checked = this.dataStore.heatingPower.status && !this.onHold;
				}
			});
		}
	}

	showSettingsModal() {
		this.dataStore.config['switchThresholdBelow'] = this.dataStore.config['switchThresholdBelow'] || {
			name: 'switchThresholdBelow',
			value: 0.2
		};

		this.dataStore.config['switchThresholdAbove'] = this.dataStore.config['switchThresholdAbove'] || {
			name: 'switchThresholdAbove',
			value: 0.2
		};

		this.bsModalService.show(ThermoConfigModalComponent, {
			initialState: {
				switchThresholdBelow: this.dataStore.config['switchThresholdBelow'] as {name: string; value: number},
				switchThresholdAbove: this.dataStore.config['switchThresholdAbove'] as {name: string; value: number},
				temperatureTrendsFeature: this.dataStore.config['temperatureTrendsFeature']?.value as boolean,
				weatherForecastFeature: this.dataStore.config['weatherForecastFeature']?.value as boolean,
			},
			class: 'modal-lg'
		});
	}

	thermoStatisticsAction() {
		this.modalService.showHeatingStatisticsModal();
	}

	thermoRestartSensors() {
		this.actionsService.restartSensors();
	}

	updateHeatingPower() {
		this.lastHeatingPowerStatus = this.dataStore.heatingPower.status;

		if (!this.dataStore.heatingPower.status) {			
			this.heatingPowerOffInterval = setInterval(() => {
				const nowTime = new Date().getTime();
				const untilTime = this.dataStore.heatingPower.until.valueOf();

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

				this.timerString =
					`${hours ? hoursPad2 + ':' : ''}${seconds || minutes || hours ? minutesPad2 + ':' : ''}${seconds || minutes || hours ? secondsPad2 : ''}`;
			}, 1000);
		} else {
			clearInterval(this.heatingPowerOffInterval);
			this.timerString = '';
		}
	}

	tempAdjust(diff: number) {
		if (typeof this.dataStore.targetTempId === 'number' && !isNaN(this.dataStore.targetTempId)) {
			const expected = this.dataStore.temperatures[this.dataStore.targetTempId].value + diff;
			this.serverApiService.tempAdjust(this.dataStore.temperatures[this.dataStore.targetTempId]._id, expected).subscribe(res => {
				if (res.status === RESPONSE_STATUS.OK) {
					this.dataStore.temperatures[this.dataStore.targetTempId].value = expected;
				}
			});
		}
	}

	endIgnoringSmartFeatures() {
		this.serverApiService.endIgnoringHoldConditions().subscribe(res => {
			this.dataStore.handleServerData(res?.data);
		});
	}
}
