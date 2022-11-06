import { Component, ViewChild } from '@angular/core';
import { ThermoComponent }  from './thermo/thermo.component';
import { SecurityComponent } from './security/security.component';
import { LoginStatusService } from './shared/login-status.service';
import { ThermoDataStoreService } from './thermo/services/thermo-data-store.service';
import * as moment from 'moment';
import { Moment } from 'moment';
import { ServerApiService } from './services/server-api.service';
import { RefreshEventService } from './services/refresh-event.service';
import { LocationService } from './services/location.service';
import { Location } from './types/types';

interface User {
	email: string;
	locations: Location[];
}

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent {
	title = 'app';
	refreshInProgress = false;
	currentTimestamp: number = moment().valueOf();
	updateStatus = 'fresh';
	lastVisible = new Date();
	lastLoginStatusCheck = new Date();

	user: User;

	@ViewChild(ThermoComponent)
	public thermoComponent: ThermoComponent;

	@ViewChild(SecurityComponent)
	public securityComponent: SecurityComponent;


	constructor(
		private loginStatusService: LoginStatusService,
		private thermoDataStore: ThermoDataStoreService,
		private serverApiService: ServerApiService,
		private refreshEventService: RefreshEventService,
		public locationService: LocationService
	) {
	}

	updateFreshnessStatus () {
		this.currentTimestamp = moment().valueOf();

		if (this.currentTimestamp - this.thermoDataStore.lastUpdate.valueOf() < 5 * 60 * 1000) {
			this.updateStatus = 'fresh';
		} else if (this.currentTimestamp - this.thermoDataStore.lastUpdate.valueOf() >= 5 * 60 * 1000 &&
				this.currentTimestamp - this.thermoDataStore.lastUpdate.valueOf() < 10 * 60 * 1000) {
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
		this.refreshEventService.trigger();

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

		this.serverApiService.init().subscribe(data => {
			this.user = data.user;

			this.changeLocation(this.user.locations[0]);
		});
	}

	changeLocation (location: Location) {
		this.locationService.updateLocation(location);
	}

	hasFeature(featureName: string) {
		return this.locationService.getSelectedLocation().features.includes(featureName);
	}
}
