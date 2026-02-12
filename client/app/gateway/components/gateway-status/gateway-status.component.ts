import { Component, OnInit } from '@angular/core';
import { ServerUpdateService } from '../../../shared/server-update.service';
import { RefreshEventService } from '../../../services/refresh-event.service';
import { LocationService } from '../../../services/location.service';
import { GATEWAY_STATUS } from '../../types/types';
import { ServerApiService } from '../../services/server-api.service';

@Component({
  selector: 'gateway-status',
  templateUrl: './gateway-status.component.html',
  styleUrls: ['./gateway-status.component.scss']
})
export class GatewayStatusComponent implements OnInit {
  GATEWAY_STATUS = GATEWAY_STATUS;

  status: GATEWAY_STATUS;
  resetInProgress: boolean;
  resetInitiated: boolean;
  lastResetAt: Date;

  constructor
    (
      private serverUpdateService: ServerUpdateService,
      private serverApiService: ServerApiService,
      private refreshEventService: RefreshEventService,
      private locationService: LocationService
    ) {	}

  initiateReset () {
    this.serverApiService.initiateReset().subscribe(res => {
      this.handleServerData(res.data);
    });
  }

  reset() {
    this.status = null;
    this.lastResetAt = null;
    this.resetInProgress = false;
  }


  handleServerData (data) {
    if (data.gateway) {
      if (typeof data.gateway.resetInitiated === 'boolean') {
        this.resetInitiated = data.gateway.resetInitiated;
      }

      if (typeof data.gateway.resetInProgress === 'boolean') {
        this.resetInProgress = data.gateway.resetInProgress;
      }

      if (data.gateway.status) {
        this.status = data.gateway.status;
      }

      if (data.gateway.lastResetAt) {
        this.lastResetAt = new Date(data.gateway.lastResetAt);
      }
    }
  }

  init () {
    this.reset();
    this.serverApiService.init()
      .subscribe(this.handleServerData.bind(this));
  }

  ngOnInit() {
    this.refreshEventService.subscribe(() => {
      this.init();
    });

    this.locationService.subscribe(() => {
      this.init();
    });

    this.serverUpdateService.onUpdate()
      .subscribe(this.handleServerData.bind(this));
  }

}
