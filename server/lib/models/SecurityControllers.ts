import { Schema, model } from 'mongoose';
import EventEmitter from 'events';

interface ISecurityControllers {
	controllerid: number;
	location: number;
}

const securityControllersSchema = new Schema<ISecurityControllers>({
	controllerid: Number,
	location: {
		type: Number,
		ref: 'Location'
	}
});

securityControllersSchema.set('versionKey', false);
securityControllersSchema.index({controllerid: 1});

export default model<ISecurityControllers>('SecurityControllers', securityControllersSchema);

export const evts = new EventEmitter();
