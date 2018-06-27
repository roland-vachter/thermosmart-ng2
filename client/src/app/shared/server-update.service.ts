import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import * as io from 'socket.io-client';

@Injectable()
export class ServerUpdateService {
	private socket: SocketIOClient.Socket;

	private observers = [];
	private observable = Observable.create(function (observer) {
		this.observers.push(observer);
	}.bind(this));

	constructor() {
		this.socket = io('/frontend');

		this.socket.on('update', data => {
			this.observers.forEach(ob => ob.next(data));
		});
	}

	// EMITTER
	sendMessage(msg: string) {
		this.socket.emit('sendMessage', { message: msg });
	}

	// HANDLER
	onUpdate() {
		return this.observable;
	}

	createUpdate (data) {
		this.observers.forEach(ob => ob.next(data));
	}
}
