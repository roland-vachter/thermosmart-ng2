import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { Moment } from 'moment';
import { ApiResult } from '../types/types';

@Injectable()
export class ServerApiService {

	constructor(private http: HttpClient) { }

	init () {
		return this.http.get('/api/init')
			.map((res: any) => {
				if (res.status === 'ok') {
					return res.data;
				} else {
					return {};
				}
			});
	}
}
