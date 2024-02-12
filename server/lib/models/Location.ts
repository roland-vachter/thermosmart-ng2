import { Schema, model } from 'mongoose';

export interface ILocation {
	_id: number;
	name: string;
	timezone: string;
	features: string[];
}

const location = new Schema<ILocation>({
	_id: Number,
	name: String,
	timezone: String,
	features: [String]
});

location.set('versionKey', false);

export default model<ILocation>('Location', location);
