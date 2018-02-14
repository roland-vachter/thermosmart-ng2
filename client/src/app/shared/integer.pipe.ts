import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'integer'
})
export class IntegerPipe implements PipeTransform {

	transform(value: number):any {
		const decimal = parseInt(((value - Math.floor(value)) * 10).toFixed(0), 10);
		if (decimal === 10) {
			return Math.floor(value) + 1;
		}
		
		if (isNaN(value)) {
			return '-';
		}

		return Math.floor(value);
	}

}
