import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'objectKeys'
})
export class ObjectKeysPipe implements PipeTransform {

	transform(value: Record<string, unknown>): string[] {
		return Object.keys(value);
	}

}
