import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { UserService } from '../../../services/user.service';
import { User } from '../../../types/types';
import { SensorSetting } from '../../types/types';

@Component({
	selector: 'thermo-change-sensor-settings-modal',
	templateUrl: './change-sensor-settings-modal.component.html',
	styleUrls: ['./change-sensor-settings-modal.component.scss']
})
export class ChangeSensorSettingsModalComponent implements OnInit {
	@Input() label:string = '';
	@Input() tempAdjust:number = 0;
	@Input() humidityAdjust:number = 0;
	@Output() result: EventEmitter<SensorSetting> = new EventEmitter();

	private user: User;

	constructor(
		public bsModalRef: BsModalRef,
		private userService: UserService
	) { }

	ngOnInit() {
		this.userService.getUser().subscribe(user => this.user = user);
	}

	onSubmit () {
		this.result.emit({
			label: this.label,
			tempAdjust: this.tempAdjust,
			humidityAdjust: this.humidityAdjust
		});
		this.bsModalRef.hide();
	}

	hasAdminPermission() {
		return this.user?.permissions?.includes('admin');
	}
}
