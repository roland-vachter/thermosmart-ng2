import { Component, OnInit, ViewChild } from '@angular/core';
import { ThermoComponent }  from './thermo/thermo.component';
import { SecurityComponent } from './security/security.component';
import { LoginStatusService } from './shared/login-status.service';
import { ThermoDataStoreService } from './thermo/services/thermo-data-store.service';
import moment from 'moment';
import { UserService } from './services/user.service';
import { LOCATION_FEATURE, User } from './types/types';
import { RefreshEventService } from './services/refresh-event.service';
import { LocationService } from './services/location.service';
import { Location } from './types/types';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
	LOCATION_FEATURE = LOCATION_FEATURE;

	title = 'app';
	refreshInProgress = false;
	currentTimestamp: number = moment().valueOf();
	updateStatus = 'fresh';
	lastVisible = new Date();
	lastLoginStatusCheck = new Date();

	user: User;

	@ViewChild(ThermoComponent, { static: true })
	public thermoComponent: ThermoComponent;

	@ViewChild(SecurityComponent, { static: true })
	public securityComponent: SecurityComponent;


	constructor(
		private loginStatusService: LoginStatusService,
		private thermoDataStore: ThermoDataStoreService,
		private userService: UserService,
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
		if (onDemand || !this.lastLoginStatusCheck || new Date().getTime() - this.lastLoginStatusCheck.getTime() > 60 * 1000) {
			this.lastLoginStatusCheck = new Date();

			this.loginStatusService.check().subscribe({
				next: res => {
					if (res.status !== 200) {
						window.location.href = '';
					}
				},
				error: () => {
					window.location.href = '';
				}
			});
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
		setTimeout(this.checkLoginStatus.bind(this), 5 * 60 * 1000);

		document.addEventListener("visibilitychange", (() => {
			if (document.visibilityState === 'visible') {
				this.checkLoginStatus();
				this.updateFreshnessStatus();
				
				if ((this.updateStatus === 'outdated' || new Date().getTime() - this.lastVisible.getTime() > 10 * 60 * 1000)) {
					this.refresh();
				}

				this.lastVisible = new Date();
			}
		}).bind(this));

		this.userService.getUser().subscribe(user => {
			this.user = user;

			if (this.user?.locations) {
				this.changeLocation(typeof localStorage.getItem('selectedLocation') === 'string' ?
					this.user.locations.find(l => l._id === parseInt(localStorage.getItem('selectedLocation'), 10)) || this.user.locations[0] :
					this.user.locations[0]);
			} else {
				console.warn('User has no locations');
			}
		});
	}

	changeLocation (location: Location) {
		this.locationService.updateLocation(location);
	}

	hasFeature(featureName: LOCATION_FEATURE) {
		return this.locationService.hasFeature(this.locationService.getSelectedLocation(), featureName);
	}
}
