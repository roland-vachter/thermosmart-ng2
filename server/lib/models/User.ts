import { Schema, model } from 'mongoose';

export interface IUser {
	emails?: string[];
	username?: string;
	password?: string;
	locations: number[];
	permissions: string[];
}

const userSchema = new Schema<IUser>({
	emails: {
		type: [String],
		index: true
	},
	username: {
		type: String,
		index: true
	},
	password: String,
	locations: [{
		type: Number,
		ref: 'Location'
	}],
	permissions: [String]
});

userSchema.set('versionKey', false);

export default model<IUser>('User', userSchema);
