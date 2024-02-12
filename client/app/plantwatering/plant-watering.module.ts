import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlantWateringComponent } from './plant-watering.component';
import { ServerApiService } from './services/server-api.service';
import { ServerUpdateService } from '../shared/server-update.service';

@NgModule({
	imports: [
		CommonModule
	],
	exports: [
		PlantWateringComponent
	],
	declarations: [
		PlantWateringComponent
	],
	providers: [
		ServerApiService,
		ServerUpdateService
	]
})
export class PlantWateringModule { }
