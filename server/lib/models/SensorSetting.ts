import { Schema, model } from 'mongoose';
import EventEmitter from 'events';

export interface ISensorSetting {
	_id: number;
	order: number;
	label: string;
	enabled: boolean;
	tempAdjust: number;
	humidityAdjust: number;
	location: number;
	controller: boolean;
}

const sensorSettingSchema = new Schema<ISensorSetting>({
	_id: Number,
	order: Number,
	label: String,
	enabled: {
		type: Boolean,
		default: true
	},
	tempAdjust: Number,
	humidityAdjust: Number,
	location: {
		type: Number,
		ref: 'Location'
	},
	controller: {
		type: Boolean,
		default: false
	}
});

sensorSettingSchema.set('versionKey', false);

export default model<ISensorSetting>('SensorSetting', sensorSettingSchema);

export const evts = new EventEmitter();
