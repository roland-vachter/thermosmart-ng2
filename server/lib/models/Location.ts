import { Schema, model } from 'mongoose';
import { Orientation } from '../types/outsideConditions';

export interface ILocation {
	_id: number;
	name: string;
	timezone: string;
	features: string[];
	orientations: Orientation[];
}

const location = new Schema<ILocation>({
	_id: Number,
	name: String,
	timezone: String,
	features: [String],
	orientations: [String]
});

location.set('versionKey', false);

export default model<ILocation>('Location', location);
