import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { Subject } from 'rxjs';
import { PartialObserver } from 'rxjs/Observer';

@Injectable()
export class RefreshEventService {

    private source = new Subject<string>();
	private observable = this.source.asObservable();

	constructor() {}

	trigger() {
		this.source.next();
	}

    subscribe(observer?: (s: string) => void | PartialObserver<string>) {
        return this.observable.subscribe(observer);
    }
}
