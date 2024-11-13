import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { InsideComponent } from './components/inside/inside.component';
import { OutsideComponent } from './components/outside/outside.component';
import { HeatingPlanComponent } from './components/heating-plan/heating-plan.component';
import { ThermoComponent } from './thermo.component';
import { SensorComponent } from './components/sensor/sensor.component';
import { ChangeHeatingPlanModalComponent } from './components/change-heating-plan-modal/change-heating-plan-modal.component';
import { ChangeSensorSettingsModalComponent } from './components/change-sensor-settings-modal/change-sensor-settings-modal.component';
import { StatisticsModalComponent } from './components/statistics-modal/statistics-modal.component';
import { FormsModule } from '@angular/forms';
import { HeatingCurrentPlanComponent } from './components/heating-current-plan/heating-current-plan.component';
import { ThermoConfigModalComponent } from './components/thermo-config-modal/thermo-config-modal.component';
import { ThermoDataStoreService } from './services/thermo-data-store.service';
import { HeatingStatusComponent } from './components/heating-status/heating-status.component';
import { SensorListComponent } from './components/sensor-list/sensor-list.component';
import { TemperatureComponent } from './components/temperature/temperature.component';
import { HumidityComponent } from './components/humidity/humidity.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { RefreshEventService } from '../services/refresh-event.service';
import { LocationService } from '../services/location.service';
import { SolarSystemHeatingStatusComponent } from './components/solar-system-heating-status/solar-system-heating-status.component';

@NgModule({
	imports: [
		CommonModule,
		SharedModule,
		FormsModule,
		BsDropdownModule.forRoot(),
		BsDatepickerModule.forRoot()
	],
	declarations: [
		InsideComponent,
		OutsideComponent,
		HeatingPlanComponent,
		ThermoComponent,
		HeatingStatusComponent,
		SensorComponent,
		ChangeHeatingPlanModalComponent,
		ChangeSensorSettingsModalComponent,
		StatisticsModalComponent,
		HeatingCurrentPlanComponent,
		ThermoConfigModalComponent,
		SensorListComponent,
		TemperatureComponent,
		HumidityComponent,
		SolarSystemHeatingStatusComponent
	],
	exports: [
		HeatingStatusComponent,
		ChangeHeatingPlanModalComponent,
		ChangeSensorSettingsModalComponent,
		StatisticsModalComponent,
		ThermoComponent,
		SensorListComponent,
		HeatingCurrentPlanComponent,
		SolarSystemHeatingStatusComponent
	],
	providers: [
	]
})
export class ThermoModule {
	constructor(
		private thermoDataStore: ThermoDataStoreService,
		private refreshService: RefreshEventService,
		private locationService: LocationService
	) {
		this.refreshService.subscribe(() => {
			this.thermoDataStore.init();
		});

		this.locationService.subscribe(() => {
			this.thermoDataStore.init();
		});
	}
}
