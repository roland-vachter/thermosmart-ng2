import { Component, OnInit } from '@angular/core';
import { ThermoDataStoreService } from '../../services/thermo-data-store.service';
import { isNumber } from '../../../shared/utils';
import { SharedServerApiService } from '../../../shared/shared-server-api.service';

@Component({
  selector: 'thermo-solar-system-heating-status',
  templateUrl: './solar-system-heating-status.component.html',
  styleUrls: ['./solar-system-heating-status.component.scss']
})
export class SolarSystemHeatingStatusComponent implements OnInit {
  consumption: number = 0;

  constructor(
    public dataStore: ThermoDataStoreService,
    private serverApiService: SharedServerApiService
  ) {
  }

  ngOnInit() {
		this.dataStore.evt.subscribe(() => {
      this.calculateConsumption();
		});

    this.calculateConsumption();
	}

  calculateConsumption() {
    if (isNumber(this.dataStore.solarHeatingStatus?.gridInjection) && isNumber(this.dataStore.solarHeatingStatus?.solarProduction)) {
      this.consumption = this.dataStore.solarHeatingStatus.solarProduction - this.dataStore.solarHeatingStatus.gridInjection;
    }
  }

  toggleStatus() {
    this.serverApiService.changeConfig('solarHeatingDisabled', !this.dataStore.config.solarHeatingDisabled?.value).subscribe(() => {
      this.dataStore.config.solarHeatingDisabled.value = !!this.dataStore.config.solarHeatingDisabled?.value;
    });
  }
}
