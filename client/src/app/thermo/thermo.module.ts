import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { InsideComponent } from './components/inside/inside.component';
import { OutsideComponent } from './components/outside/outside.component';
import { HeatingDurationComponent } from './components/heating-duration/heating-duration.component';
import { HeatingStatusComponent } from './components/heating-status/heating-status.component';
import { HeatingTargetComponent } from './components/heating-target/heating-target.component';
import { HeatingPlanComponent } from './components/heating-plan/heating-plan.component';
import { ThermoComponent } from './thermo.component';
import { ServerUpdateService } from '../shared/server-update.service';
import { ServerApiService } from '../shared/server-api.service';
import { SensorComponent } from './components/sensor/sensor.component';
import { ChangeHeatingPlanModalComponent } from './components/change-heating-plan-modal/change-heating-plan-modal.component';
import { ChangeSensorLabelModalComponent } from './components/change-sensor-label-modal/change-sensor-label-modal.component';
import { StatisticsModalComponent } from './components/statistics-modal/statistics-modal.component';
import { FormsModule } from '@angular/forms';
import { HeatingCurrentPlanComponent } from './components/heating-current-plan/heating-current-plan.component';
import { ThermoConfigModalComponent } from './components/thermo-config-modal/thermo-config-modal.component';

@NgModule({
	imports: [
		CommonModule,
		SharedModule,
		FormsModule
	],
	declarations: [
		InsideComponent,
		OutsideComponent,
		HeatingDurationComponent,
		HeatingStatusComponent,
		HeatingTargetComponent,
		HeatingPlanComponent,
		ThermoComponent,
		SensorComponent,
		ChangeHeatingPlanModalComponent,
		ChangeSensorLabelModalComponent,
		StatisticsModalComponent,
		HeatingCurrentPlanComponent,
		ThermoConfigModalComponent
	],
	exports: [
		ThermoComponent
	],
	providers: [
		ServerUpdateService,
		ServerApiService
	],
	entryComponents: [
		ChangeHeatingPlanModalComponent,
		ChangeSensorLabelModalComponent,
		StatisticsModalComponent,
		ThermoConfigModalComponent
	]
})
export class ThermoModule { }
