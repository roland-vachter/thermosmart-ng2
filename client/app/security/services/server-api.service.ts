import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ApiResult, RESPONSE_STATUS, StatusApiResult } from '../../types/types';
import { ArmingStatusResponse, Camera, Controller, SecurityInitResponse } from '../types/types';
import { LocationService } from '../../services/location.service';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ServerApiService {

	constructor(
		private http: HttpClient,
		private locationService: LocationService
	) { }

	init(): Observable<SecurityInitResponse> {
		if (this.locationService.getSelectedLocationId()) {
			return this.http.get('/api/security/init?location=' + this.locationService.getSelectedLocationId())
				.pipe(
					map((res: ApiResult<SecurityInitResponse>) => {
						if (res.status === RESPONSE_STATUS.OK) {
							return res.data;
						} else {
							return {} as SecurityInitResponse;
						}
					})
				);
		} else {
			return of();
		}
	}

	toggleArm () {
		return this.http.post<ApiResult<ArmingStatusResponse>>('/api/security/togglearm', {
			location: this.locationService.getSelectedLocationId()
		});
	}

	getSecurityCameras(): Observable<Camera[]> {
		return this.http.get<Camera[]>('/api/security/camera/list?location=' + this.locationService.getSelectedLocationId())
			.pipe(
				map((res) => {
					return res || [];
				})
			)
	}

	addSecurityCamera(ip: string) {
		return this.http.post<StatusApiResult>('/api/security/camera/add', {
			ip,
			location: this.locationService.getSelectedLocationId()
		});
	}

	removeSecurityCamera(ip: string) {
		return this.http.post<StatusApiResult>('/api/security/camera/remove', {
			ip,
			location: this.locationService.getSelectedLocationId()
		});
	}


	getSecurityControllers(): Observable<Controller[]> {
		return this.http.get<Controller[]>('/api/security/controller/list?location=' + this.locationService.getSelectedLocationId())
			.pipe(
				map(res => {
					return res || [];
				})
			)
	}

	addSecurityController(id: string) {
		return this.http.post<StatusApiResult>('/api/security/controller/add', {
			id,
			location: this.locationService.getSelectedLocationId()
		});
	}

	removeSecurityController(id: string) {
		return this.http.post<StatusApiResult>('/api/security/controller/remove', {
			id
		});
	}
}
