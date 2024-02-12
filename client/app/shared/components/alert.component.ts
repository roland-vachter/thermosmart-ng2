import { Component, Input } from '@angular/core';
import { ALERT_TYPE } from '../../types/types';

@Component({
	selector: 'alert-wrapper',
	templateUrl: './alert.component.html',
	styleUrls: ['./alert.component.scss']
})
export class AlertWrapperComponent {

	@Input() type: ALERT_TYPE;
    @Input() content: string;

	constructor() { }

}
