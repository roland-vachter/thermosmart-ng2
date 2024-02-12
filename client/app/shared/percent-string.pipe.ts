import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'percentString'
})
export class PercentStringPipe implements PipeTransform {

	transform(value: number): string {
		return value + '%';
	}

}
