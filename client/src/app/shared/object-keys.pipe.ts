import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'objectKeys'
})
export class ObjectKeysPipe implements PipeTransform {

	transform(value: any): any {
		return Object.keys(value);
	}

}
