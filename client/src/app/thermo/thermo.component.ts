import { Component, OnInit } from '@angular/core';
import { ServerUpdateService } from '../shared/server-update.service';
import { ServerApiService } from './services/server-api.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { StatisticsModalComponent } from './components/statistics-modal/statistics-modal.component';
import { ThermoConfigModalComponent } from './components/thermo-config-modal/thermo-config-modal.component';
import { ChangeHeatingPlanModalComponent } from './components/change-heating-plan-modal/change-heating-plan-modal.component';

@Component({
	selector: 'thermo',
	templateUrl: './thermo.component.html',
	styleUrls: ['./thermo.component.scss']
})
export class ThermoComponent {

	constructor() {
	}

	// update () {
	// 	const d = new Date();
	// 	this.percentInDay = this.getPercentInDay();
	// 	this.currentTime = `${this.pad(d.getHours(), 2)}:${this.pad(d.getMinutes(), 2)}`;
	// 	this.currentDate = d;
	// }

	// showHeatingStatisticsModal () {
	// 	this.modalService.show(StatisticsModalComponent, {
	// 		class: 'modal-xl'
	// 	});
	// }

	// showHeatingConfigModal () {
	// 	this.config['switchThresholdBelow'] = this.config['switchThresholdBelow'] || {
	// 		name: 'switchThresholdBelow',
	// 		value: 0.2
	// 	};

	// 	this.config['switchThresholdAbove'] = this.config['switchThresholdAbove'] || {
	// 		name: 'switchThresholdAbove',
	// 		value: 0.2
	// 	};

	// 	const modalRef = this.modalService.show(ThermoConfigModalComponent, {
	// 		initialState: {
	// 			temps: this.temperatureList,
	// 			heatingDefaultPlans: this.defaultHeatingPlans,
	// 			switchThresholdBelow: this.config['switchThresholdBelow'],
	// 			switchThresholdAbove: this.config['switchThresholdAbove']
	// 		},
	// 		class: 'modal-lg'
	// 	});

	// 	modalRef.content.onChangePlan.subscribe(this.showChangePlanModal.bind(this));
	// }

	// showChangePlanModal (dayOfWeek) {
	// 	const modalRef = this.modalService.show(ChangeHeatingPlanModalComponent, {
	// 		initialState: {
	// 			dayOfWeek,
	// 			planSelected: this.defaultHeatingPlans[dayOfWeek].plan.ref,
	// 			heatingPlans: this.heatingPlanList
	// 		},
	// 		class: 'modal-lg'
	// 	});

	// 	modalRef.content.onResult.subscribe(planId => {
	// 		if (typeof planId === 'number') {
	// 			this.serverApiService.changeDefaultPlan(dayOfWeek, planId);
	// 		}
	// 	});
	// }

	// refresh () {
	// 	this.init();
	// }

	// restartSensors () {
	// 	this.serverApiService.restartSensor();

	// 	this.restartSensorInProgress = true;
	// 	setTimeout(() => {
	// 		this.restartSensorInProgress = false;
	// 	}, 60000);
	// }

}
