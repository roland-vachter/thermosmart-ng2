import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'integer'
})
export class IntegerPipe implements PipeTransform {

	transform(value: number):string {
		if (isNaN(value)) {
			return '-';
		}

		let intValue = value < 0 ? Math.ceil(value) : Math.floor(value);

		const absValue = Math.abs(value);
		const decimal = parseInt(((absValue - Math.floor(absValue)) * 10).toFixed(0), 10);

		if (decimal === 10) {
			if (value > 0) {
				intValue += 1;
			} else {
				intValue -= 1;
			}
		}

		return value < 0 && value > -0.95 ? '-' + intValue : '' + intValue;
	}

}
