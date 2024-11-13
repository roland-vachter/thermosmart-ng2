import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiResult, RESPONSE_STATUS } from '../../types/types';
import { HeatingConditionsResponse, SensorResponse, SensorSetting, Statistics, ThermoInitUpdateData } from "../types/types";
import { HeatingPowerResponse } from "../types/types";
import { LocationService } from '../../services/location.service';
import { of, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Moment } from 'moment';

@Injectable({
  providedIn: 'root'
})
export class ThermoServerApiService {

	constructor(
		private http: HttpClient,
		private locationService: LocationService
	) { }

	init () {
		if (this.locationService.getSelectedLocationId()) {
			return this.http.get('/api/heating/init?location=' + this.locationService.getSelectedLocationId())
				.pipe(
					map((res: ApiResult<ThermoInitUpdateData>) => {
						if (res.status === RESPONSE_STATUS.OK) {
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

	ignoreHoldConditions(): Observable<ApiResult<HeatingConditionsResponse>> {
		return this.http.post<ApiResult<HeatingConditionsResponse>>('/api/ignoreholdconditions', { location: this.locationService.getSelectedLocationId() });
	}

	endIgnoringHoldConditions(): Observable<ApiResult<HeatingConditionsResponse>> {
		return this.http.post<ApiResult<HeatingConditionsResponse>>('/api/endignoringholdconditions', { location: this.locationService.getSelectedLocationId() });
	}

	toggleSensorStatus (id: number) {
		return this.http.post<ApiResult<SensorResponse>>('/api/togglesensorstatus', {
			id,
			location: this.locationService.getSelectedLocationId()
		});
	}

	disableSensorWindowOpen (id: number) {
		return this.http.post<ApiResult<SensorResponse>>('/api/disablesensorwindowopen', {
			id,
			location: this.locationService.getSelectedLocationId()
		})
	}

	changeSensorSettings (id: number, options: SensorSetting) {
		return this.http.post<ApiResult<SensorResponse>>('/api/changesensorsettings', {
			id,
			label: options.label,
			tempadjust: options.tempAdjust,
			humidityadjust: options.humidityAdjust
		});
	}

	tempAdjust (id: number, value: number) {
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
		return this.http.get<ApiResult<Statistics>>('/api/statistics?location=' + this.locationService.getSelectedLocationId());
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
