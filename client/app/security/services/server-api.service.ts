import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ApiResult, Camera, Controller } from '../../types/types';
import { LocationService } from '../../services/location.service';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ServerApiService {

	constructor(
		private http: HttpClient,
		private locationService: LocationService
	) { }

	init (force = false) {
		if (this.locationService.getSelectedLocationId()) {
			return this.http.get('/api/security/init?location=' + this.locationService.getSelectedLocationId())
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

	toggleArm () {
		return this.http.post('/api/security/togglearm', {
			location: this.locationService.getSelectedLocationId()
		});
	}

	getSecurityCameras() {
		return this.http.get<Camera[]>('/api/security/camera/list?location=' + this.locationService.getSelectedLocationId())
			.pipe(
				map((res: any) => {
					return res || [];
				})
			)
	}

	addSecurityCamera(ip: string) {
		return this.http.post<ApiResult>('/api/security/camera/add', {
			ip,
			location: this.locationService.getSelectedLocationId()
		});
	}

	removeSecurityCamera(ip: string) {
		return this.http.post<ApiResult>('/api/security/camera/remove', {
			ip,
			location: this.locationService.getSelectedLocationId()
		});
	}


	getSecurityControllers() {
		return this.http.get<Controller[]>('/api/security/controller/list?location=' + this.locationService.getSelectedLocationId())
			.pipe(
				map((res: any) => {
					return res || [];
				})
			)
	}

	addSecurityController(id: string) {
		return this.http.post<ApiResult>('/api/security/controller/add', {
			id,
			location: this.locationService.getSelectedLocationId()
		});
	}

	removeSecurityController(id: string) {
		return this.http.post<ApiResult>('/api/security/controller/remove', {
			id
		});
	}
}
