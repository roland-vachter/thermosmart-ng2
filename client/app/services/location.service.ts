import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { Moment } from 'moment';
import { ApiResult, Location } from '../types/types';
import { BehaviorSubject, Subject } from 'rxjs';
import { PartialObserver } from 'rxjs/Observer';

@Injectable()
export class LocationService {

    private selectedLocation: BehaviorSubject<Location> = new BehaviorSubject(null);

	constructor() { }

	updateLocation (location: Location) {
		this.selectedLocation.next(location);
	}

    getSelectedLocation () {
        return this.selectedLocation.value;
    }

    getSelectedLocationId() {
        return this.selectedLocation.value && this.selectedLocation.value._id;
    }

    subscribe(observer?: (s: Location) => void | PartialObserver<Location>) {
        return this.selectedLocation.subscribe(observer);
    }
}
