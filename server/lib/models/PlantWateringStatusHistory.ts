import { Schema, model } from 'mongoose';

export interface IPlantWateringStatusHistory {
	datetime: Date;
	status: boolean;
	zone: number;
}

const plantWateringStatusHistorySchema = new Schema<IPlantWateringStatusHistory>({
	datetime: {
		type: Date,
		index: true
	},
	status: Boolean,
	zone: Number
});

plantWateringStatusHistorySchema.index({datetime: 1});
plantWateringStatusHistorySchema.index({zone: 1});
plantWateringStatusHistorySchema.set('versionKey', false);

export default model<IPlantWateringStatusHistory>('PlantWateringStatusHistory', plantWateringStatusHistorySchema);
