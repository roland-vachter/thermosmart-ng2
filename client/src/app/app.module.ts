import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ThermoModule } from './thermo/thermo.module';
import { SharedModule } from './shared/shared.module';
import { MomentModule } from 'angular2-moment';
import { FormsModule } from '@angular/forms';
import { ChartsModule } from 'ng2-charts';
import { ModalModule, BsDropdownModule  } from 'ngx-bootstrap';
import { AppComponent } from './app.component';
import { LoginStatusService } from './shared/login-status.service';


@NgModule({
	declarations: [
		AppComponent
	],
	imports: [
		BrowserModule,
		ModalModule.forRoot(),
		BsDropdownModule.forRoot(),
		FormsModule,
		MomentModule,
		ChartsModule,
		SharedModule,
		ThermoModule
	],
	providers: [
		LoginStatusService
	],
	bootstrap: [AppComponent],
	exports: [
		FormsModule
	]
})
export class AppModule { }
