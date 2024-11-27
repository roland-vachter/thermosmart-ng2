import { Schema, model } from 'mongoose';

export interface IConfig {
	name: string;
	value?: string | number | boolean;
	location: number;
	encrypted?: boolean;
	private?: boolean;
}

const configSchema = new Schema<IConfig>({
	name: {
		type: String,
		index: true
	},
	value: Schema.Types.Mixed,
	location: {
		type: Number,
		ref: 'Location'
	},
	encrypted: Boolean,
	private: Boolean
});

configSchema.set('versionKey', false);

export default model<IConfig>('Config', configSchema);
