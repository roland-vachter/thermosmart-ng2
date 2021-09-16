import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SecurityComponent } from './security.component';
import { ServerApiService } from './services/server-api.service';
import { ServerUpdateService } from '../shared/server-update.service';
import { MomentModule } from 'angular2-moment';
import { SecuritySettingsModalComponent } from './components/security-settings-modal/security-settings-modal.component';
import { FormsModule } from '@angular/forms';

@NgModule({
	imports: [
		CommonModule,
		MomentModule,
		FormsModule
	],
	exports: [
		SecurityComponent
	],
	declarations: [
		SecurityComponent,
		SecuritySettingsModalComponent
	],
	providers: [
		ServerApiService,
		ServerUpdateService
	],
	entryComponents: [
		SecuritySettingsModalComponent
	]
})
export class SecurityModule { }
