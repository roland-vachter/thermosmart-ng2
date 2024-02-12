import { HydratedDocument, Schema, model } from 'mongoose';
import EventEmitter from 'events';
import { IHeatingPlanPopulated } from './HeatingPlan';
import TypedEventEmitter from 'typed-emitter';

export interface IHeatingPlanWithLocation {
	plan: number;
	location: number;
}

export interface IHeatingPlanWithLocationPopulated {
	plan: IHeatingPlanPopulated;
	location: number;
}

export interface IHeatingDefaultPlan {
	_id: number;
	dayOfWeek: number;
	defaultPlan: number;
	plans: IHeatingPlanWithLocation[];
}

const heatingPlanSchema = new Schema<IHeatingDefaultPlan>({
	_id: Number,
	dayOfWeek: Number,
	defaultPlan: {
		type: Number,
		ref: 'HeatingPlan'
	},
	plans: [{
		plan: {
			type: Number,
			ref: 'HeatingPlan'
		},
		location: {
			type: Number,
			ref: 'Location'
		}
	}]
});

heatingPlanSchema.index({ dayOfWeek: 1 });
heatingPlanSchema.set('versionKey', false);

export default model<IHeatingDefaultPlan>('HeatingDefaultPlan', heatingPlanSchema);


interface HeatingDefaultPlanChangeEvent {
	defaultPlan: HydratedDocument<IHeatingDefaultPlan>;
	locationId: number;
}

type HeatingDefaultPlanEvents = {
	change: (o: HeatingDefaultPlanChangeEvent) => void;
}

export const heatingDefaultPlanEvts = new EventEmitter() as TypedEventEmitter<HeatingDefaultPlanEvents>;
export const triggerHeatingDefaultPlanChange = (defaultPlan: HydratedDocument<IHeatingDefaultPlan>, locationId: number) => {
	heatingDefaultPlanEvts.emit('change', {
		defaultPlan,
		locationId
	});
};
