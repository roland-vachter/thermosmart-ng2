import { Component } from '@angular/core';
import { ServerApiService } from '../../services/server-api.service';
import { BsModalService } from 'ngx-bootstrap/modal';

@Component({
	selector: 'thermostat',
	templateUrl: './thermostat.component.html',
	styleUrls: ['./thermostat.component.scss']
})
export class ThermostatComponent {

   currentTemperature: number;
   currentHumidity: number;
   targetTemperature;
   heatingStatus: boolean = false;
   todaysPlan;

	constructor(
      private serverApiService: ServerApiService
   ) {
      this.serverApiService.evt.subscribe(() => {
         this.currentTemperature = serverApiService.insideConditions.temperature;
         this.currentHumidity = serverApiService.insideConditions.humidity;
         this.targetTemperature = serverApiService.targetTemp.ref;
         this.heatingStatus = serverApiService.heatingStatus;
         this.todaysPlan = serverApiService.todaysPlan.plan.ref;

         console.log(this.todaysPlan);
      });
   }


}
