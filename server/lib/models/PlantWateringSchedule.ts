import { Schema, model } from 'mongoose';

export interface IPlantWateringSchedule {
	minutesUntilDry: number;
	zone: number;
	label: string;
}

const plantWateringScheduleSchema = new Schema<IPlantWateringSchedule>({
	minutesUntilDry: Number,
	zone: Number,
	label: String
});

plantWateringScheduleSchema.index({zone: 1});
plantWateringScheduleSchema.set('versionKey', false);

export default model<IPlantWateringSchedule>('PlantWateringSchedule', plantWateringScheduleSchema);
