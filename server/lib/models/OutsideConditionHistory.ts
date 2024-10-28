import { Schema, model } from 'mongoose';

export interface IOutsideConditionHistory {
	datetime: Date;
	t: number;
	h: number;
	sunny: boolean;
}

const outsideConditionHistorySchema = new Schema<IOutsideConditionHistory>({
	datetime: {
		type: Date,
		index: true
	},
	t: Number,
	h: Number,
	sunny: Boolean
});

outsideConditionHistorySchema.index({datetime: 1});
outsideConditionHistorySchema.set('versionKey', false);

export default model<IOutsideConditionHistory>('OutsideConditionHistory', outsideConditionHistorySchema);
