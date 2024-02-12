import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'dayOfWeekName'
})
export class DayOfWeekNamePipe implements PipeTransform {

	private dayNameByIndex = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

	transform(dayOfWeekNumber: number): string {
		return this.dayNameByIndex[dayOfWeekNumber];
	}

}
