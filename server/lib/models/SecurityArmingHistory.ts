import { Schema, model } from 'mongoose';

export enum SECURITY_STATUS {
	DISARMED = 'disarmed',
	ARMING = 'arming',
	ARMED = 'armed',
	PREALARM = 'prealarm',
	ALARM = 'alarm'
};

export interface ISecurityArmingHistory {
	datetime: Date;
	status: SECURITY_STATUS;
	location: number;
}

const securityArmingHistorySchema = new Schema<ISecurityArmingHistory>({
	datetime: {
		type: Date,
		index: true
	},
	status: String,
	location: {
		type: Number,
		ref: 'Location'
	}
});

securityArmingHistorySchema.index({datetime: 1});
securityArmingHistorySchema.set('versionKey', false);

export default model<ISecurityArmingHistory>('SecurityArmingHistory', securityArmingHistorySchema);
