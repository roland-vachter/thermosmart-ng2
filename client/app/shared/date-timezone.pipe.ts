import { Pipe, PipeTransform } from '@angular/core';
import moment, { Moment } from 'moment';

@Pipe({
	name: 'dateTimezone'
})
export class DateTimezonePipe implements PipeTransform {

	transform(date: Moment | Date | string, timezone: string, format: string): string {
		return moment(date).tz(timezone).format(format);
	}

}
