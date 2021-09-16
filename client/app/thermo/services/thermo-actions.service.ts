import { Injectable } from '@angular/core';
import { ThermoServerApiService } from './thermo-server-api.service';

@Injectable()
export class ThermoActionsService {
    private restartSensorInProgress: boolean = false;

    constructor(
        private serverApiService: ThermoServerApiService
    ) {}

    restartSensors () {
		this.serverApiService.restartSensor();

		this.restartSensorInProgress = true;
		setTimeout(() => {
			this.restartSensorInProgress = false;
		}, 60000);
	}
}
