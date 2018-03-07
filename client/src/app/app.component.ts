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
	lastVisible = new Date();
	lastLoginStatusCheck = new Date();

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

	checkLoginStatus (onDemand = false) {
		if (onDemand || !this.lastLoginStatusCheck || new Date().getTime() - this.lastLoginStatusCheck.getTime() > 10 * 60 * 1000) {
			this.lastLoginStatusCheck = new Date();

			this.loginStatusService.check().subscribe(
				res => {
					if (res.status !== 200) {
						window.location.href = '';
					}
				},
				err => {
					if (res.status !== 200) {
						window.location.href = '';
					}	
				}
			);
		}
	}

	refresh (onDemand = false) {
		this.checkLoginStatus(onDemand);
		this.thermoComponent.refresh();

		this.refreshInProgress = true;
		setTimeout(() => {
			this.updateFreshnessStatus();
			this.refreshInProgress = false;
		}, 2000);
	}

	ngOnInit () {
		setTimeout(this.updateFreshnessStatus.bind(this), 60000);
		setTimeout(this.checkLoginStatus, 60 * 60 * 1000);

		document.addEventListener("visibilitychange", (() => {
			if (document.visibilityState === 'visible') {
				this.checkLoginStatus();
				this.updateFreshnessStatus();
				
				if ((this.updateStatus === 'outdated' || new Date().getTime() - this.lastVisible.getTime() > 60 * 60 * 1000)) {
					this.refresh();
				}

				this.lastVisible = new Date();
			}
		}).bind(this));
	}
}
