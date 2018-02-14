import { Component, ViewChild } from '@angular/core';
import { ThermoComponent }  from './thermo/thermo.component';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent {
	title = 'app';
	refreshInProgress = false;
	currentDate = new Date();

	@ViewChild(ThermoComponent)
	public thermoComponent: ThermoComponent;

	thermoStatisticsAction () {
		this.thermoComponent.showHeatingStatisticsModal();
	}

	thermoConfigAction () {
		this.thermoComponent.showHeatingConfigModal();
	}

	thermoRestartSensors () {
		this.thermoComponent.restartSensors();
	}

	refresh () {
		this.thermoComponent.refresh();

		this.refreshInProgress = true;
		setTimeout(() => {
			this.refreshInProgress = false;
		}, 2000);
	}

	ngOnInit () {
		setTimeout(() => {
			this.currentDate = new Date();
		}, 60000);
	}
}
