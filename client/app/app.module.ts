import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ThermoModule } from './thermo/thermo.module';
import { SecurityModule } from './security/security.module';
import { PlantwateringModule } from './plantwatering/plantwatering.module';
import { SharedModule } from './shared/shared.module';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AppComponent } from './app.component';
import { LoginStatusService } from './shared/login-status.service';
import { BsDropdownModule } from 'ngx-bootstrap';
import { ServerApiService } from './services/server-api.service';
import { RefreshEventService } from './services/refresh-event.service';
import { LocationService } from './services/location.service';


@NgModule({
	declarations: [
		AppComponent
	],
	imports: [
		BrowserModule,
		ModalModule.forRoot(),
		BsDropdownModule.forRoot(),
		FormsModule,
		SharedModule,
		ThermoModule,
		SecurityModule,
		PlantwateringModule
	],
	providers: [
		LoginStatusService,
		ServerApiService,
		RefreshEventService,
		LocationService
	],
	bootstrap: [AppComponent],
	exports: [
		FormsModule
	]
})
export class AppModule { }
