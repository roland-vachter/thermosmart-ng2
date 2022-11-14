import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';

@Pipe({
	name: 'duration'
})
export class DurationPipe implements PipeTransform {

	transform(value: number): string {
		let str = '';

		const duration = moment.duration(value * 60 * 1000);

		str += `${duration.hours() || 0}h `;
		str += `${duration.minutes() || 0}m`;

		return str.trim();
	}

}
