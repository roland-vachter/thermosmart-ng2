import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map';

interface ApiResult {
	status: 'ok' | 'error';
	reason?: string
}

@Injectable()
export class SharedServerApiService {

	constructor(private http: HttpClient) { }

	changeConfig (name: string, value: string | number) {
		return this.http.post<ApiResult>('/api/changeconfig', {
			name,
			value
		});
	}

    getConfig(name: string) {
        return this.http.get<string | number>('/api/getconfig', {
            params: {
                name
            }
        });
    }

}
