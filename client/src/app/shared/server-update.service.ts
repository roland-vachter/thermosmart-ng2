import { Injectable } from '@angular/core';
import { Socket } from 'ng-socket-io';
import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';

@Injectable()
export class ServerUpdateService {

	private observer: Subscriber<any>;
	private observable: Observable<any> = new Observable(observer => {
		this.observer = observer;
	});

	constructor(private socket: Socket) {
		this.socket
			.fromEvent('update')
			.subscribe((data: any) => {
				this.observer.next(data);
			});
	}
	
	onUpdate () {
		return this.observable;
	}

	createUpdate (data) {
		if (this.observer) {
			this.observer.next(data);
		}
	}

}
