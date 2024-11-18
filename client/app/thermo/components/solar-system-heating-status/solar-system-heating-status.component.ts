import { Component, OnInit } from '@angular/core';
import { ThermoDataStoreService } from '../../services/thermo-data-store.service';
import { isNumber } from '../../../shared/utils';

@Component({
  selector: 'thermo-solar-system-heating-status',
  templateUrl: './solar-system-heating-status.component.html',
  styleUrls: ['./solar-system-heating-status.component.scss']
})
export class SolarSystemHeatingStatusComponent implements OnInit {
  radiators: { isOn: boolean }[] = [];
  consumption: number | string = 0;

  constructor(
    public dataStore: ThermoDataStoreService
  ) {
    this.radiators = [];
    for (let i = 0; i < this.dataStore.solarHeatingStatus?.numberOfRadiators; i++) {
      this.radiators.push({
        isOn: i < this.dataStore?.solarHeatingStatus?.numberOfRunningRadiators
      });
    }
  }

  ngOnInit() {
		this.dataStore.evt.subscribe(() => {
      this.radiators = [];
      for (let i = 0; i < this.dataStore.solarHeatingStatus?.numberOfRadiators; i++) {
        this.radiators.push({
          isOn: i < this.dataStore?.solarHeatingStatus?.numberOfRunningRadiators
        });
      }

      this.calculateConsumption();
		});

    this.calculateConsumption();
	}

  calculateConsumption() {
    if (isNumber(this.dataStore.solarHeatingStatus?.gridInjection) && isNumber(this.dataStore.solarHeatingStatus?.solarProduction)) {
      this.consumption = this.dataStore.solarHeatingStatus.solarProduction - this.dataStore.solarHeatingStatus.gridInjection;
    }
  }
}
