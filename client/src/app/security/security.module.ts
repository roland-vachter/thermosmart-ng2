import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SecurityComponent } from './security.component';
import { ServerApiService } from './services/server-api.service';
import { ServerUpdateService } from '../shared/server-update.service';
import { MomentModule } from 'angular2-moment';

@NgModule({
	imports: [
		CommonModule,
		MomentModule
	],
	exports: [
		SecurityComponent
	],
	declarations: [SecurityComponent],
	providers: [
		ServerApiService,
		ServerUpdateService
	]
})
export class SecurityModule { }
