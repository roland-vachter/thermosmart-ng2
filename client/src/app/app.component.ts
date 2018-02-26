import { Component, ViewChild } from '@angular/core';
import { ThermoComponent }  from './thermo/thermo.component';
import { LoginStatusService } from './shared/login-status.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent {
	title = 'app';
	refreshInProgress = false;
	currentDate: any = new Date().getTime();
	updateStatus = 'fresh';

	@ViewChild(ThermoComponent)
	public thermoComponent: ThermoComponent;


	constructor(
			private loginStatusService: LoginStatusService) {
	}


	thermoStatisticsAction () {
		this.thermoComponent.showHeatingStatisticsModal();
	}

	thermoConfigAction () {
		this.thermoComponent.showHeatingConfigModal();
	}

	thermoRestartSensors () {
		this.thermoComponent.restartSensors();
	}

	updateFreshnessStatus () {
		this.currentDate = new Date().getTime();

		if (this.currentDate - this.thermoComponent.lastUpdate < 5 * 60 * 1000) {
			this.updateStatus = 'fresh';
		} else if (this.currentDate - this.thermoComponent.lastUpdate >= 5 * 60 * 1000 &&
				this.currentDate - this.thermoComponent.lastUpdate < 10 * 60 * 1000) {
			this.updateStatus = 'idle';
		} else {
			this.updateStatus = 'outdated';
		}
	}

	refresh () {
		this.thermoComponent.refresh();

		this.refreshInProgress = true;
		setTimeout(() => {
			this.updateFreshnessStatus();
			this.refreshInProgress = false;
		}, 2000);
	}

	ngOnInit () {
		setTimeout(this.updateFreshnessStatus.bind(this), 60000);

		document.addEventListener("visibilitychange", function() {
			if (document.visibilityState === 'visible' && this.updateStatus === 'outdated') {
				this.refresh();

				this.loginStatusService.check().subscribe(res => {
					if (res.status !== 200) {
						window.location.href = '';
					}
				});
			}
		});
	}
}
