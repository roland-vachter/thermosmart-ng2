import { Schema, model } from 'mongoose';
import EventEmitter from 'events';
import TypedEventEmitter from 'typed-emitter';

export interface ITemperature {
	_id: number;
	name: string;
	iconClass: string;
	color: string;
	defaultValue: number;
	values: {
		value: number;
		location: number;
	}[];
}

const temperatureSchema = new Schema<ITemperature>({
	_id: Number,
	name: {
		type: String,
		index: true
	},
	iconClass: String,
	color: String,
	defaultValue: Number,
	values: [{
		value: Number,
		location: {
			type: Number,
			ref: 'Location'
		}
	}]
});

temperatureSchema.index({name: 1});
temperatureSchema.set('versionKey', false);

export default model<ITemperature>('Temperature', temperatureSchema);


interface TemperatureEvent {
	ids: number | number[];
	location: number;
}

type TemperatureEvents = {
	change: (o: TemperatureEvent) => void;
}

export const temperatureEvts = new EventEmitter() as TypedEventEmitter<TemperatureEvents>;
export const triggerTemperatureChange = (ids: number | number[], location: number) => {
	console.log('temp change triggered', ids, 'for location', location);
	temperatureEvts.emit('change', {
		ids,
		location
	});
};
