import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import * as io from 'socket.io-client';
import { LocationService } from '../services/location.service';
import { RefreshEventService } from '../services/refresh-event.service';

@Injectable()
export class ServerUpdateService {
	private socketGlobal: SocketIOClient.Socket;
	private socketLocation: SocketIOClient.Socket;

	private observers = [];
	private observable = Observable.create(function (observer) {
		this.observers.push(observer);
	}.bind(this));

	constructor(
		private locationService: LocationService,
		private refreshService: RefreshEventService
	) {
		this.initSocketGlobal();		

		this.locationService.subscribe(l => {
			if (l) {
				this.initSocketLocation(l._id);
			}
		});

		this.refreshService.subscribe(() => {
			this.initSocketGlobal();
			if (this.locationService.getSelectedLocationId()) {
				this.initSocketLocation(this.locationService.getSelectedLocationId());
			}
		});
	}

	private initSocketGlobal() {
		if (this.socketGlobal) {
			this.socketGlobal.disconnect();
		}
		this.socketGlobal = io('/frontend');
		this.socketGlobal.on('update', data => {
			this.observers.forEach(ob => ob.next(data));
		});
	}

	private initSocketLocation(location: number) {
		if (this.socketLocation) {
			this.socketLocation.disconnect();
		}

		this.socketLocation = io('/frontend/' + location);

		this.socketLocation.on('update', data => {
			this.observers.forEach(ob => ob.next(data));
		});
	}

	onUpdate() {
		return this.observable;
	}

	createUpdate (data) {
		this.observers.forEach(ob => ob.next(data));
	}
}
