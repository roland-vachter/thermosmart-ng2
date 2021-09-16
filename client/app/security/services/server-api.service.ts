import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map';

interface ApiResult {
	status: 'ok' | 'error';
	reason?: string
}

@Injectable()
export class ServerApiService {

	constructor(private http: HttpClient) { }

	init (force = false) {
		return this.http.get('/api/security/init')
			.map((res: any) => {
				if (res.status === 'ok') {
					return res.data;
				} else {
					return {};
				}
			});
	}

	toggleArm () {
		return this.http.post('/api/security/togglearm', {});
	}

	getSecurityCameras() {
		return this.http.get('/api/security/camera/list')
			.map((res: any) => {
				return res || [];
			})
	}

	addSecurityCamera(ip: string) {
		return this.http.post<ApiResult>('/api/security/camera/add', {
			ip
		});
	}

	removeSecurityCamera(ip: string) {
		return this.http.post<ApiResult>('/api/security/camera/remove', {
			ip
		});
	}


	getSecurityControllers() {
		return this.http.get('/api/security/controller/list')
			.map((res: any) => {
				return res || [];
			})
	}

	addSecurityController(id: string) {
		return this.http.post<ApiResult>('/api/security/controller/add', {
			id
		});
	}

	removeSecurityController(id: string) {
		return this.http.post<ApiResult>('/api/security/controller/remove', {
			id
		});
	}
}
