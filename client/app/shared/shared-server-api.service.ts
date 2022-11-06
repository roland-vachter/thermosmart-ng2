import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { LocationService } from '../services/location.service';

interface ApiResult {
	status: 'ok' | 'error';
	reason?: string
}

@Injectable()
export class SharedServerApiService {

	constructor(
		private http: HttpClient,
		private locationService: LocationService
	) { }

	changeConfig (name: string, value: string | number) {
		return this.http.post<ApiResult>('/api/changeconfig', {
			name,
			value,
			location: this.locationService.getSelectedLocationId()
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
