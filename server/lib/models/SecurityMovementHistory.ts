import { Schema, model } from 'mongoose';

interface ISecurityMovementHistory {
	datetime: Date;
	location: number;
}

const securityMovementHistorySchema = new Schema<ISecurityMovementHistory>({
	datetime: {
		type: Date,
		index: true
	},
	location: {
		type: Number,
		ref: 'Location'
	}
});

securityMovementHistorySchema.index({datetime: 1});
securityMovementHistorySchema.set('versionKey', false);

export default model<ISecurityMovementHistory>('SecurityMovementHistory', securityMovementHistorySchema);
