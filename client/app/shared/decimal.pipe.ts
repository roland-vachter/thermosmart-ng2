import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'decimal'
})
export class DecimalPipe implements PipeTransform {

	transform(value: number):any {
		const absValue = Math.abs(value);
		const decimal = parseInt(((absValue - Math.floor(absValue)) * 10).toFixed(0), 10);

		if (decimal === 10) {
			return 0;
		}

		if (isNaN(decimal)) {
			return '-';
		}

		return decimal;
	}

}
