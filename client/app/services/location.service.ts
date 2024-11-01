import { Injectable } from '@angular/core';

import { Location } from '../types/types';
import { BehaviorSubject, PartialObserver } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  private selectedLocation: BehaviorSubject<Location> = new BehaviorSubject(null);

	constructor() { }

	updateLocation (location: Location) {    
    localStorage.setItem('selectedLocation', location._id.toString());
		this.selectedLocation.next(location);
	}

  getSelectedLocationTimezone() {
    return this.selectedLocation.value.timezone;
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
