import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map';

@Injectable()
export class ServerApiService {

	constructor(private http: HttpClient) { }

	init (force = false) {
		return this.http.get('/api/init')
			.map((res: any) => {
				if (res.status === 'ok') {
					return res.data;
				} else {
					return {};
				}
			});
	}

	toggleSensorStatus (id) {
		const obs = this.http.post('/api/togglesensorstatus', {
			id
		});

		obs.subscribe();
		return obs;
	}

	changeSensorLabel (id, label) {
		const obs = this.http.post('/api/changesensorlabel', {
			id,
			label
		});

		obs.subscribe();
		return obs;
	}

	tempAdjust (id, value) {
		const obs = this.http.post('/api/tempadjust', {
			id,
			value
		});

		obs.subscribe();
		return obs;
	}

	restartSensor () {
		const obs = this.http.post('/api/restartSensor', {});

		obs.subscribe();
		return obs;
	}

	changeDefaultPlan (dayOfWeek, planId) {
		const obs = this.http.post('/api/changedefaultplan', {
			dayOfWeek,
			planId
		});

		obs.subscribe();
		return obs;
	}

	statistics () {
		return this.http.get('/api/statistics');
	}

	changeConfig (name, value) {
		const obs = this.http.post('/api/changeconfig', {
			name,
			value
		});

		obs.subscribe();
		return obs;
	}

}
