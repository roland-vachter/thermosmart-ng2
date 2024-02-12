import { Schema, model } from 'mongoose';
import { ITemperature } from './Temperature';

export interface IHeatingPlanPopulated {
	_id:  number;
	displayOrder: number;
	name: string;
	intervals: {
		startHour: number;
		startMinute: number;
		temp: ITemperature;
	}[];
	iconClass: string;
}

export interface IHeatingPlan {
	_id:  number;
	displayOrder: number;
	name: string;
	intervals: {
		startHour: number;
		startMinute: number;
		temp: number;
	}[];
	iconClass: string;
}

const heatingPlanSchema = new Schema<IHeatingPlan>({
	_id: Number,
	displayOrder: {
		type: Number,
		index: true
	},
	name: {
		type: String,
		index: true
	},
	intervals: [{
		startHour: Number,
		startMinute: Number,
		temp: {
			type: Number,
			ref: 'Temperature'
		}
	}],
	iconClass: String
});

heatingPlanSchema.index({name: 1});
heatingPlanSchema.index({displayOrder: 1});
heatingPlanSchema.set('versionKey', false);

export default model<IHeatingPlan>('HeatingPlan', heatingPlanSchema);
