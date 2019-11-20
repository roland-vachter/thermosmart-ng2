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
import { ServerApiService } from './services/server-api.service';
import { SensorComponent } from './components/sensor/sensor.component';
import { ChangeHeatingPlanModalComponent } from './components/change-heating-plan-modal/change-heating-plan-modal.component';
import { ChangeSensorSettingsModalComponent } from './components/change-sensor-settings-modal/change-sensor-settings-modal.component';
import { StatisticsModalComponent } from './components/statistics-modal/statistics-modal.component';
import { FormsModule } from '@angular/forms';
import { HeatingCurrentPlanComponent } from './components/heating-current-plan/heating-current-plan.component';
import { ThermoConfigModalComponent } from './components/thermo-config-modal/thermo-config-modal.component';
import { HeatingPowerComponent } from './components/heating-power/heating-power.component';
import { ThermostatComponent } from './components/thermostat/thermostat.component';
import { RouterModule, Routes } from '@angular/router';

const ROUTES: Routes = [
	{
		path: '',
		children: [
			{
				path: '',
				redirectTo: 'thermostat',
				pathMatch: 'full'
			},
			{
				path: 'thermostat',
				component: ThermostatComponent
			}
		]
	}
];

@NgModule({
	imports: [
		CommonModule,
		SharedModule,
		FormsModule,
		RouterModule.forChild(ROUTES)
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
		ChangeSensorSettingsModalComponent,
		StatisticsModalComponent,
		HeatingCurrentPlanComponent,
		ThermoConfigModalComponent,
		HeatingPowerComponent,
		ThermostatComponent
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
		ChangeSensorSettingsModalComponent,
		StatisticsModalComponent,
		ThermoConfigModalComponent
	]
})
export class ThermoModule { }
