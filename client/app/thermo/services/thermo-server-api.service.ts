import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiResult, HeatingPowerResponse, SensorResponse } from '../../types/types';
import { LocationService } from '../../services/location.service';
import { of, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Moment } from 'moment';

@Injectable()
export class ThermoServerApiService {

	constructor(
		private http: HttpClient,
		private locationService: LocationService
	) { }

	init (force = false) {
		if (this.locationService.getSelectedLocationId()) {
			return this.http.get('/api/heating/init?location=' + this.locationService.getSelectedLocationId())
				.pipe(
					map((res: any) => {
						if (res.status === 'ok') {
							return res.data;
						} else {
							return {};
						}
					})
				);
		} else {
			return of();
		}
	}

	toggleHeatingPower (): Observable<ApiResult<HeatingPowerResponse>> {
		return this.http.post<ApiResult<HeatingPowerResponse>>('/api/toggleheatingpower', { location: this.locationService.getSelectedLocationId() });
	}

	toggleSensorStatus (id) {
		return this.http.post<ApiResult<SensorResponse>>('/api/togglesensorstatus', {
			id,
			location: this.locationService.getSelectedLocationId()
		});
	}

	disableSensorWindowOpen (id) {
		return this.http.post<ApiResult<SensorResponse>>('/api/disablesensorwindowopen', {
			id,
			location: this.locationService.getSelectedLocationId()
		})
	}

	changeSensorSettings (id, options) {
		return this.http.post<ApiResult<SensorResponse>>('/api/changesensorsettings', {
			id,
			label: options.label,
			tempadjust: options.tempAdjust,
			humidityadjust: options.humidityAdjust
		});
	}

	tempAdjust (id, value) {
		return this.http.post<ApiResult>('/api/tempadjust', {
			id,
			value,
			location: this.locationService.getSelectedLocationId()
		});
	}

	restartSensor () {
		const obs = this.http.post('/api/restartSensor', {});

		obs.subscribe();
		return obs;
	}

	changeDefaultPlan (dayOfWeek: number, planId: number) {
		return this.http.post('/api/changedefaultplan', {
			dayOfWeek,
			planId,
			location: this.locationService.getSelectedLocationId()
		});
	}

	statistics () {
		return this.http.get('/api/statistics?location=' + this.locationService.getSelectedLocationId());
	}

	listPlanOverrides() {
		return this.http.get<ApiResult>('/api/heating/planoverride/list?location=' + this.locationService.getSelectedLocationId());
	}

	addPlanOverride(date: Moment, planId: number) {
		return this.http.post<ApiResult>('/api/heating/planoverride/add', {
			date: date.valueOf(),
			planId,
			location: this.locationService.getSelectedLocationId()
		});
	}

	removePlanOverride(date: Moment) {
		return this.http.post<ApiResult>('/api/heating/planoverride/remove', {
			date: date.valueOf(),
			location: this.locationService.getSelectedLocationId()
		})
	}
}
