import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { LocationService } from '../services/location.service';

interface ApiResult {
	status: 'ok' | 'error';
	reason?: string
}

interface ConfigOptions {
	encrypted?: boolean;
	private?: boolean;
}

@Injectable()
export class SharedServerApiService {

	constructor(
		private http: HttpClient,
		private locationService: LocationService
	) { }

	changeConfig (name: string, value: string | number | boolean, flags?: ConfigOptions) {
		return this.http.post<ApiResult>('/api/changeconfig', {
			name,
			value,
			location: this.locationService.getSelectedLocationId(),
			...(flags || {})
		});
	}

    getConfig(name: string) {
        return this.http.get<string | number>('/api/getconfig?location=' + this.locationService.getSelectedLocationId(), {
            params: {
                name
            }
        });
    }

}
