import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlantwateringComponent } from './plantwatering.component';
import { ServerApiService } from './services/server-api.service';
import { ServerUpdateService } from '../shared/server-update.service';

@NgModule({
	imports: [
		CommonModule
	],
	exports: [
		PlantwateringComponent
	],
	declarations: [
		PlantwateringComponent
	],
	providers: [
		ServerApiService,
		ServerUpdateService
	]
})
export class PlantwateringModule { }
