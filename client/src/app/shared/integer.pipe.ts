import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'integer'
})
export class IntegerPipe implements PipeTransform {

	transform(value: number):any {		
		if (isNaN(value)) {
			return '-';
		}

		const intValue = value < 0 ? Math.ceil(value) : Math.floor(value);

		return value < 0 && value > -1 ? '-' + intValue : intValue;
	}

}
