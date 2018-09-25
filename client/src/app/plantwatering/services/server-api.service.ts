import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map';

@Injectable()
export class ServerApiService {

	constructor(private http: HttpClient) { }

	init (force = false) {
		return this.http.get('/api/plantwatering/init')
			.map((res: any) => {
				if (res.status === 'ok') {
					return res.data;
				} else {
					return {};
				}
			});
	}

}
