import { Injectable } from '@angular/core';
import { Socket } from 'ng-socket-io';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ServerUpdateService {

	private observers = [];
	private observable = Observable.create(function (observer) {
		console.log('create observer');
		this.observers.push(observer);
	}.bind(this));

	constructor(private socket: Socket) {
		this.socket
			.fromEvent('update')
			.subscribe((data: any) => {
				this.observers.forEach(ob => ob.next(data));
			});
	}
	
	onUpdate () {
		return this.observable;
	}

	createUpdate (data) {
		this.observers.forEach(ob => ob.next(data));
	}

}
