import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'dayOfWeekName'
})
export class DayOfWeekNamePipe implements PipeTransform {

	private dayNameByIndex = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

	transform(dayOfWeekNumber: any): any {
		return this.dayNameByIndex[dayOfWeekNumber];
	}

}
