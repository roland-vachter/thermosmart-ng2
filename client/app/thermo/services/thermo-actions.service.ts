import { Injectable } from '@angular/core';
import { ThermoDataStoreService } from './thermo-data-store.service';
import { ThermoServerApiService } from './thermo-server-api.service';

@Injectable({
  providedIn: 'root'
})
export class ThermoActionsService {
    constructor(
        private serverApiService: ThermoServerApiService,
		private dataStore: ThermoDataStoreService
    ) {}

    restartSensors () {
		this.serverApiService.restartSensor();
		this.dataStore.initiateSensorRestart();

		setTimeout(() => {
			this.dataStore.stopSensorRestart();
		}, 60000);
	}
}
