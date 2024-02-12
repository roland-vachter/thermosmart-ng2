import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { ApiResult, RESPONSE_STATUS } from '../../types/types';

@Injectable()
export class ServerApiService {

	constructor(private http: HttpClient) { }

	init () {
		return this.http.get('/api/plantwatering/init')
			.pipe(
				map((res: ApiResult<unknown>) => {
					if (res.status === RESPONSE_STATUS.OK) {
						return res.data;
					} else {
						return {};
					}
				})
			);
	}

}
