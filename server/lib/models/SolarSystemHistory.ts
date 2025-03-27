import { Schema, model } from 'mongoose';

export interface ISolarSystemHistory {
	datetime: Date;
	solarProduction: number;
	consumption: number;
	location: number;
}

const solarSystemHistorySchema = new Schema<ISolarSystemHistory>({
	datetime: {
		type: Date,
		index: true
	},
	solarProduction: Number,
	consumption: Number,
	location: {
		type: Number,
		ref: 'Location'
	}
});

solarSystemHistorySchema.index({datetime: 1});
solarSystemHistorySchema.set('versionKey', false);

export default model<ISolarSystemHistory>('SolarSystemHistory', solarSystemHistorySchema);
