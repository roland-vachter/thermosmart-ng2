import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { InsideComponent } from './components/inside/inside.component';
import { OutsideComponent } from './components/outside/outside.component';
import { HeatingPlanComponent } from './components/heating-plan/heating-plan.component';
import { ThermoComponent } from './thermo.component';
import { ServerUpdateService } from '../shared/server-update.service';
import { ThermoServerApiService } from './services/thermo-server-api.service';
import { SensorComponent } from './components/sensor/sensor.component';
import { ChangeHeatingPlanModalComponent } from './components/change-heating-plan-modal/change-heating-plan-modal.component';
import { ChangeSensorSettingsModalComponent } from './components/change-sensor-settings-modal/change-sensor-settings-modal.component';
import { StatisticsModalComponent } from './components/statistics-modal/statistics-modal.component';
import { FormsModule } from '@angular/forms';
import { HeatingCurrentPlanComponent } from './components/heating-current-plan/heating-current-plan.component';
import { ThermoConfigModalComponent } from './components/thermo-config-modal/thermo-config-modal.component';
import { ThermoDataStoreService } from './services/thermo-data-store.service';
import { HeatingStatusComponent } from './components/heating-status/heating-status.component';
import { ThermoActionsService } from './services/thermo-actions.service';
import { ThermoModalsService } from './services/thermo-modals.service';

@NgModule({
	imports: [
		CommonModule,
		SharedModule,
		FormsModule
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
		ThermoConfigModalComponent
	],
	exports: [
		HeatingStatusComponent,
		ChangeHeatingPlanModalComponent,
		ChangeSensorSettingsModalComponent,
		StatisticsModalComponent,
		ThermoComponent
	],
	providers: [
		ThermoServerApiService,
		ThermoDataStoreService,
		ThermoActionsService,
		ThermoModalsService
	],
	entryComponents: [
		ChangeHeatingPlanModalComponent,
		ChangeSensorSettingsModalComponent,
		StatisticsModalComponent,
		ThermoConfigModalComponent
	]
})
export class ThermoModule { }
