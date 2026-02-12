import { Schema, model } from 'mongoose';

export interface IGatewayResetHistory {
	datetime: Date;
	location: number;
}

const gatewayResetHistorySchema = new Schema<IGatewayResetHistory>({
	datetime: {
		type: Date,
		index: true
	},
	location: {
		type: Number,
		ref: 'Location'
	}
});

gatewayResetHistorySchema.index({datetime: 1});
gatewayResetHistorySchema.set('versionKey', false);

export default model<IGatewayResetHistory>('GatewayResetHistory', gatewayResetHistorySchema);
