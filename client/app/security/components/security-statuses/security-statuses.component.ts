import { Component, OnInit } from '@angular/core';
import { ServerUpdateService } from '../../../shared/server-update.service';
import { RefreshEventService } from '../../../services/refresh-event.service';
import { LocationService } from '../../../services/location.service';

enum HEALTH {
	OK = 'OK',
	PARTIAL = 'PARTIAL',
	FAIL = 'FAIL'
}

@Component({
	selector: 'security-statuses',
	templateUrl: './security-statuses.component.html',
	styleUrls: ['./security-statuses.component.scss']
})
export class SecurityStatusesComponent implements OnInit {
  HEALTH = HEALTH;

  cameraHealth: HEALTH = HEALTH.FAIL;
	controllerHealth: HEALTH = HEALTH.FAIL;
	keypadHealth: HEALTH = HEALTH.FAIL;
	motionSensorHealth: HEALTH = HEALTH.FAIL;

  constructor (
    private serverUpdateService: ServerUpdateService,
    private refreshEventService: RefreshEventService,
    private locationService: LocationService
  ) {	}

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

  handleServerData (data) {
    if (data.security) {
      if (data.security.cameraHealth) {
        this.cameraHealth = data.security.cameraHealth;
      }

      if (data.security.controllerHealth) {
        this.controllerHealth = data.security.controllerHealth;
      }

      if (data.security.keypadHealth) {
        this.keypadHealth = data.security.keypadHealth;
      }

      if (data.security.motionSensorHealth) {
        this.motionSensorHealth = data.security.motionSensorHealth;
      }
    }
  }

  init () {
		this.cameraHealth = HEALTH.FAIL;
		this.controllerHealth = HEALTH.FAIL;
		this.keypadHealth = HEALTH.FAIL;
		this.motionSensorHealth = HEALTH.FAIL;
  }
}
