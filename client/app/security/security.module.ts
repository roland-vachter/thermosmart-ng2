import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SecurityComponent } from './security.component';
import { ServerApiService } from './services/server-api.service';
import { ServerUpdateService } from '../shared/server-update.service';
import { SecuritySettingsModalComponent } from './components/security-settings-modal/security-settings-modal.component';
import { FormsModule } from '@angular/forms';
import { RefreshEventService } from '../services/refresh-event.service';
import { LocationService } from '../services/location.service';

@NgModule({
	imports: [
		CommonModule,
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
		ServerUpdateService,
		RefreshEventService,
		LocationService
	],
	entryComponents: [
		SecuritySettingsModalComponent
	]
})
export class SecurityModule {
}
