import { DurationPipe } from './duration.pipe';
import { DecimalPipe } from './decimal.pipe';
import { IntegerPipe } from './integer.pipe';
import { ObjectKeysPipe } from './object-keys.pipe';
import { PercentStringPipe } from './percent-string.pipe';
import { DayOfWeekNamePipe } from './day-of-week-name.pipe';
import { LoginStatusService } from './login-status.service';
import { ServerUpdateService } from './server-update.service';
import { ResponsivityService } from './reponsivity.service';
import { SharedServerApiService } from './shared-server-api.service';
import { AlertModule } from 'ngx-bootstrap/alert';
import { SharedModalsService } from './shared-modals.service';
import { AlertWrapperComponent } from './components/alert.component';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DateTimezonePipe } from './date-timezone.pipe';

@NgModule({
	imports: [
		CommonModule,
		HttpClientModule,
		AlertModule.forRoot()
	],
	declarations: [
		DurationPipe,
		DecimalPipe,
		IntegerPipe,
		ObjectKeysPipe,
		PercentStringPipe,
		DayOfWeekNamePipe,
		AlertWrapperComponent,
		DateTimezonePipe
	],
	exports: [
		DurationPipe,
		DecimalPipe,
		IntegerPipe,
		ObjectKeysPipe,
		PercentStringPipe,
		DayOfWeekNamePipe,
		DateTimezonePipe
	],
	providers: [
		LoginStatusService,
		ServerUpdateService,
		ResponsivityService,
		SharedServerApiService,
		SharedModalsService
	]
})
export class SharedModule { }
