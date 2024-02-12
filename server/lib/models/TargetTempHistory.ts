import { Schema, model } from 'mongoose';

export interface ITargetTempHistory {
	datetime: Date;
	t: number;
	location: number;
}

const targetTempHistorySchema = new Schema<ITargetTempHistory>({
	datetime: {
		type: Date,
		index: true
	},
	t: Number,
	location: {
		type: Number,
		ref: 'Location'
	}
});

targetTempHistorySchema.index({datetime: 1});
targetTempHistorySchema.set('versionKey', false);

export default model<ITargetTempHistory>('TargetTempHistory', targetTempHistorySchema);
