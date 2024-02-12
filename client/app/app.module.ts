import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ThermoModule } from './thermo/thermo.module';
import { SecurityModule } from './security/security.module';
import { PlantWateringModule } from './plantwatering/plant-watering.module';
import { SharedModule } from './shared/shared.module';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AppComponent } from './app.component';
import { LoginStatusService } from './shared/login-status.service';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { UserService } from './services/user.service';
import { RefreshEventService } from './services/refresh-event.service';
import { LocationService } from './services/location.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
	declarations: [
		AppComponent
	],
	imports: [
		BrowserModule,
		BrowserAnimationsModule,
		ModalModule.forRoot(),
		BsDropdownModule.forRoot(),
		FormsModule,
		SharedModule,
		ThermoModule,
		SecurityModule,
		PlantWateringModule
	],
	providers: [
		LoginStatusService,
		UserService,
		RefreshEventService,
		LocationService
	],
	bootstrap: [AppComponent],
	exports: [
		FormsModule
	]
})
export class AppModule { }
