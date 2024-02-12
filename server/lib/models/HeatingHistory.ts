import { Schema, model } from 'mongoose';

export interface IHeatingHistory {
	datetime: Date;
	status: boolean;
	location: number;
}

const heatingHistorySchema = new Schema<IHeatingHistory>({
	datetime: {
		type: Date,
		index: true
	},
	status: Boolean,
	location: {
		type: Number,
		ref: 'Location'
	}
});

heatingHistorySchema.index({datetime: 1});
heatingHistorySchema.set('versionKey', false);

export default model<IHeatingHistory>('HeatingHistory', heatingHistorySchema);
