import { Component, OnInit } from '@angular/core';
import { ThermoDataStoreService } from '../../services/thermo-data-store.service';

@Component({
  selector: 'thermo-solar-system-heating-status',
  templateUrl: './solar-system-heating-status.component.html',
  styleUrls: ['./solar-system-heating-status.component.scss']
})
export class SolarSystemHeatingStatusComponent implements OnInit {
  radiators: { isOn: boolean }[] = [];

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
		});
	}
}
