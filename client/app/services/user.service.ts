import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { ApiResult, RESPONSE_STATUS } from '../types/types';
import { User } from '../types/types';

@Injectable()
export class UserService {

	private user: User;

	constructor(private http: HttpClient) { }

	getUser(): Observable<User> {
		if (this.user) {
			return of(this.user);
		}

		return this.http.get('/api/init')
			.pipe(
				map((res: ApiResult<{ user: User }>) => {
					if (res.status === RESPONSE_STATUS.OK) {
						this.user = res.data?.user;
						return res.data?.user;
					} else {
						return {} as User;
					}
				})
			);
	}
}
