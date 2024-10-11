import { Schema, model } from 'mongoose';

export interface IHeatingHoldConditionHistory {
	datetime: Date;
	status: boolean;
  type: HeatingHoldConditionTypes;
	location: number;
}

export enum HeatingHoldConditionTypes {
  INCREASING_TREND = 'increasing_trend',
  FAVORABLE_WEATHER_FORECAST = 'favorable_weather_forecast',
  WINDOW_OPEN = 'window_open'
}

const heatingHoldConditionHistorySchema = new Schema<IHeatingHoldConditionHistory>({
	datetime: {
		type: Date,
		index: true
	},
  type: String,
	status: Boolean,
	location: {
		type: Number,
		ref: 'Location'
	}
});

heatingHoldConditionHistorySchema.index({datetime: 1});
heatingHoldConditionHistorySchema.set('versionKey', false);

export default model<IHeatingHoldConditionHistory>('HeatingHoldConditionHistory', heatingHoldConditionHistorySchema);
