import { Pipe, PipeTransform } from '@angular/core';
import moment, { Moment } from 'moment';

@Pipe({
	name: 'dateTimezone'
})
export class DateTimezonePipe implements PipeTransform {

	transform(date: Moment | Date | string, format: string): any {
		return moment(date).tz('Europe/Bucharest').format(format);
	}

}
