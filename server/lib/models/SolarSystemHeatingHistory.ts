import { Schema, model } from 'mongoose';

export interface ISolarSystemHeatingHistory {
	datetime: Date;
	noOfRunningRadiators: number;
	location: number;
}

const solarSystemHeatingHistorySchema = new Schema<ISolarSystemHeatingHistory>({
	datetime: {
		type: Date,
		index: true
	},
	noOfRunningRadiators: Number,
	location: {
		type: Number,
		ref: 'Location'
	}
});

solarSystemHeatingHistorySchema.index({datetime: 1});
solarSystemHeatingHistorySchema.set('versionKey', false);

export default model<ISolarSystemHeatingHistory>('SolarSystemHeatingHistory', solarSystemHeatingHistorySchema);