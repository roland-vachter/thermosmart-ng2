import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LoginStatusService {

	constructor(private http: HttpClient) {}

	check () {
		return this.http.get('/api/checkloginstatus', {
			observe: 'response',
			responseType: 'text'
		});
	}

}
