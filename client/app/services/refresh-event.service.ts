import { Injectable } from '@angular/core';

import { Subject ,  PartialObserver } from 'rxjs';

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
