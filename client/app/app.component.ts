import { Component, ViewChild } from '@angular/core';
import { ThermoComponent }  from './thermo/thermo.component';
import { SecurityComponent } from './security/security.component';
import { LoginStatusService } from './shared/login-status.service';
import { ThermoDataStoreService } from './thermo/services/thermo-data-store.service';
import { ThermoActionsService } from './thermo/services/thermo-actions.service';
import { ThermoModalsService } from './thermo/services/thermo-modals.service';

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

	@ViewChild(SecurityComponent)
	public securityComponent: SecurityComponent;


	constructor(
		private loginStatusService: LoginStatusService,
		private thermoDataStore: ThermoDataStoreService
	) {
	}

	updateFreshnessStatus () {
		this.currentDate = new Date().getTime();

		if (this.currentDate - this.thermoDataStore.lastUpdate < 5 * 60 * 1000) {
			this.updateStatus = 'fresh';
		} else if (this.currentDate - this.thermoDataStore.lastUpdate >= 5 * 60 * 1000 &&
				this.currentDate - this.thermoDataStore.lastUpdate < 10 * 60 * 1000) {
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
					window.location.href = '';
				}
			);
		}
	}

	refresh (onDemand = false) {
		this.checkLoginStatus(onDemand);
		this.thermoDataStore.init();
		this.securityComponent.refresh();

		this.refreshInProgress = true;
		setTimeout(() => {
			this.updateFreshnessStatus();
			this.refreshInProgress = false;
		}, 2000);
	}

	reload() {
		document.location.reload();
	}

	ngOnInit () {
		setTimeout(this.updateFreshnessStatus.bind(this), 60000);
		setTimeout(this.checkLoginStatus, 60 * 60 * 1000);

		document.addEventListener("visibilitychange", (() => {
			if (document.visibilityState === 'visible') {
				this.checkLoginStatus();
				this.updateFreshnessStatus();
				
				if ((this.updateStatus === 'outdated' || new Date().getTime() - this.lastVisible.getTime() > 10 * 60 * 1000)) {
					this.reload();
				}

				this.lastVisible = new Date();
			}
		}).bind(this));
	}
}
