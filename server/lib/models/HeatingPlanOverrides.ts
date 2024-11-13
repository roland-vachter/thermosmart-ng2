import { Schema, model } from 'mongoose';
import EventEmitter from 'events';
import moment from 'moment-timezone';
import TypedEventEmitter from 'typed-emitter';

export interface IHeatingPlanOverrides {
	date: number;
	plan: number;
	location: number;
}

const heatingPlanOverridesSchema = new Schema<IHeatingPlanOverrides>({
	date: Number,
	plan: {
		type: Number,
		ref: 'HeatingPlan'
	},
	location: {
		type: Number,
		ref: 'Location'
	}
});

heatingPlanOverridesSchema.index({date: 1});
heatingPlanOverridesSchema.set('versionKey', false);

const HeatingPlanOverrides = model<IHeatingPlanOverrides>('HeatingPlanOverrides', heatingPlanOverridesSchema);

export default HeatingPlanOverrides;



interface HeatingPlanOverrideChangeEvent {
	location: number;
}

type HeatingPlanOverrideEvents = {
	change: (o: HeatingPlanOverrideChangeEvent) => void;
}

export const heatingPlanOverrideEvts = new EventEmitter() as TypedEventEmitter<HeatingPlanOverrideEvents>;
export const triggerHeatingPlanOverridesChange = (location: number) => {
	console.log('heating plan override change triggered');
	heatingPlanOverrideEvts.emit('change', {
		location
	});
};

function cleanup () {
	HeatingPlanOverrides
		.deleteMany({
			date: {
				$lt: moment().subtract(1, 'day').valueOf()
			}
		})
		.exec()
		.then(result => {
			console.log('Successfully cleaned up heating plan overrides, deleted count:', result.deletedCount);
		})
		.catch(e => {
			console.error('Failed to cleanup heating plan overrides with error:', e);
		});
}

cleanup();
setInterval(cleanup, 60 * 60 * 1000);
