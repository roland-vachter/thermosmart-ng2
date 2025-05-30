import { Schema, model } from 'mongoose';

export interface IHeatingStatistics {
	date: Date;
	avgTargetTemp: number;
	avgOutsideTemp: number;
	avgOutsideHumi: number;
	sunshineMinutes: number;
	runningMinutes: number;
	radiatorRunningMinutes?: number;
	location: number;
}

const heatingStatisticsSchema = new Schema<IHeatingStatistics>({
	date: Date,
	avgTargetTemp: Number,
	avgOutsideTemp: Number,
	avgOutsideHumi: Number,
	runningMinutes: Number,
	sunshineMinutes: Number,
	radiatorRunningMinutes: Number,
	location: {
		type: Number,
		ref: 'Location'
	}
});

heatingStatisticsSchema.index({date: 1, location: 1});
heatingStatisticsSchema.set('versionKey', false);

export default model<IHeatingStatistics>('HeatingStatistics', heatingStatisticsSchema);
