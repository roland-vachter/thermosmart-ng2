import { DurationPipe } from './duration.pipe';
import { DecimalPipe } from './decimal.pipe';
import { IntegerPipe } from './integer.pipe';
import { SocketIoModule, SocketIoConfig } from 'ng-socket-io';
import { ObjectKeysPipe } from './object-keys.pipe';
import { PercentStringPipe } from './percent-string.pipe';
import { DayOfWeekNamePipe } from './day-of-week-name.pipe';
import { LoginStatusService } from './login-status.service';
import { ServerUpdateService } from './server-update.service';
import { ResponsivityService } from './reponsivity.service';
import { SharedServerApiService } from './shared-server-api.service';
import { AlertModule } from 'ngx-bootstrap';
import { SharedModalsService } from './shared-modals.service';
import { AlertWrapperComponent } from './components/alert.component';
import { MomentModule } from 'ngx-moment';

const config: SocketIoConfig = {
	url: '/frontend',
	options: {}
};

@NgModule({
	imports: [
		CommonModule,
		HttpClientModule,
		SocketIoModule.forRoot(config),
		AlertModule.forRoot(),
		MomentModule
	],
	declarations: [
		DurationPipe,
		DecimalPipe,
		IntegerPipe,
		ObjectKeysPipe,
		PercentStringPipe,
		DayOfWeekNamePipe,
		AlertWrapperComponent
	],
	exports: [
		DurationPipe,
		DecimalPipe,
		IntegerPipe,
		ObjectKeysPipe,
		PercentStringPipe,
		DayOfWeekNamePipe
	],
	providers: [
		LoginStatusService,
		ServerUpdateService,
		ResponsivityService,
		SharedServerApiService,
		SharedModalsService
	],
	entryComponents: [
		AlertWrapperComponent
	]
})
export class SharedModule { }
