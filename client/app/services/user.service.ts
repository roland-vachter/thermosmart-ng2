import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Location } from '../types/types';

export interface User {
	email: string;
	locations: Location[];
	permissions: string[];
}

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
				map((res: any) => {
					if (res.status === 'ok') {
						this.user = res.data?.user;
						return res.data?.user;
					} else {
						return {};
					}
				})
			);
	}
}
