import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DurationPipe } from './duration.pipe';
import { DecimalPipe } from './decimal.pipe';
import { IntegerPipe } from './integer.pipe';
import { SocketIoModule, SocketIoConfig } from 'ng-socket-io';
import { HttpClientModule } from '@angular/common/http';
import { ObjectKeysPipe } from './object-keys.pipe';
import { PercentStringPipe } from './percent-string.pipe';
import { DayOfWeekNamePipe } from './day-of-week-name.pipe';
import { LoginStatusService } from './login-status.service';
import { ServerUpdateService } from './server-update.service';
import { ResponsivityService } from './reponsivity.service';

const config: SocketIoConfig = {
	url: '/frontend',
	options: {}
};

@NgModule({
	imports: [
		CommonModule,
		HttpClientModule,
		SocketIoModule.forRoot(config)
	],
	declarations: [
		DurationPipe,
		DecimalPipe,
		IntegerPipe,
		ObjectKeysPipe,
		PercentStringPipe,
		DayOfWeekNamePipe
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
		ResponsivityService
	]
})
export class SharedModule { }
