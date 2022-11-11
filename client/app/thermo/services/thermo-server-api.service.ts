import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Moment } from 'moment';
import { ApiResult } from '../../types/types';
import { LocationService } from '../../services/location.service';
import { of } from 'rxjs';

@Injectable()
export class ThermoServerApiService {

	constructor(
		private http: HttpClient,
		private locationService: LocationService
	) { }

	init (force = false) {
		if (this.locationService.getSelectedLocationId()) {
			return this.http.get('/api/heating/init?location=' + this.locationService.getSelectedLocationId())
				.map((res: any) => {
					if (res.status === 'ok') {
						return res.data;
					} else {
						return {};
					}
				});
		} else {
			return of();
		}
	}

	toggleHeatingPower () {
		const obs = this.http.post('/api/toggleheatingpower', { location: this.locationService.getSelectedLocationId() });
		obs.subscribe();
		return obs;
	}

	toggleSensorStatus (id) {
		const obs = this.http.post('/api/togglesensorstatus', {
			id,
			location: this.locationService.getSelectedLocationId()
		});

		obs.subscribe();
		return obs;
	}

	changeSensorSettings (id, options) {
		const obs = this.http.post('/api/changesensorsettings', {
			id,
			label: options.label,
			tempadjust: options.tempAdjust,
			humidityadjust: options.humidityAdjust
		});

		obs.subscribe();
		return obs;
	}

	tempAdjust (id, value) {
		const obs = this.http.post('/api/tempadjust', {
			id,
			value,
			location: this.locationService.getSelectedLocationId()
		});

		obs.subscribe();
		return obs;
	}

	restartSensor () {
		const obs = this.http.post('/api/restartSensor', {});

		obs.subscribe();
		return obs;
	}

	changeDefaultPlan (dayOfWeek: number, planId: number) {
		const obs = this.http.post('/api/changedefaultplan', {
			dayOfWeek,
			planId,
			location: this.locationService.getSelectedLocationId()
		});

		obs.subscribe();
		return obs;
	}

	statistics () {
		return this.http.get('/api/statistics?location=' + this.locationService.getSelectedLocationId());
	}

	listPlanOverrides() {
		return this.http.get<ApiResult>('/api/heating/planoverride/list?location=' + this.locationService.getSelectedLocationId());
	}

	addPlanOverride(date: Date, planId: number) {
		return this.http.post<ApiResult>('/api/heating/planoverride/add', {
			date: date.valueOf(),
			planId,
			location: this.locationService.getSelectedLocationId()
		});
	}

	removePlanOverride(date: Date) {
		return this.http.post<ApiResult>('/api/heating/planoverride/remove', {
			date: date.valueOf(),
			location: this.locationService.getSelectedLocationId()
		})
	}
}
