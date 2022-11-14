import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable()
export class ServerApiService {

	constructor(private http: HttpClient) { }

	init () {
		return this.http.get('/api/init')
			.pipe(
				map((res: any) => {
					if (res.status === 'ok') {
						return res.data;
					} else {
						return {};
					}
				})
			);
	}
}
