import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ThermoModule } from './thermo/thermo.module';
import { SecurityModule } from './security/security.module';
import { PlantwateringModule } from './plantwatering/plantwatering.module';
import { SharedModule } from './shared/shared.module';
import { MomentModule } from 'angular2-moment';
import { FormsModule } from '@angular/forms';
import { ChartsModule } from 'ng2-charts';
import { ModalModule, BsDropdownModule  } from 'ngx-bootstrap';
import { AppComponent } from './app.component';
import { LoginStatusService } from './shared/login-status.service';
import { RouterModule, Routes } from '@angular/router';
import {APP_BASE_HREF} from '@angular/common';

const ROUTES: Routes = [
	{
		path: '',
		children: [
			{
				path: '',
				redirectTo: 'thermo',
				pathMatch: 'full'
			},
			{
				path: 'thermo',
				loadChildren: './thermo/thermo.module#ThermoModule'
			},
			{
				path: 'security',
				loadChildren: './security/security.module#SecurityModule'
			},
			{
				path: 'plantwatering',
				loadChildren: './plantwatering/plantwatering.module#PlantwateringModule'
			}
		]
	}
]

@NgModule({
	declarations: [
		AppComponent
	],
	imports: [
		BrowserModule,
		ModalModule.forRoot(),
		BsDropdownModule.forRoot(),
		RouterModule.forRoot(ROUTES),
		FormsModule,
		MomentModule,
		ChartsModule,
		SharedModule
	],
	providers: [
		LoginStatusService,
		{ provide: APP_BASE_HREF, useValue: '/'}
	],
	bootstrap: [AppComponent],
	exports: [
		FormsModule
	]
})
export class AppModule { }
