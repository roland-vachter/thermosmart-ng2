import { Schema, model } from 'mongoose';
import EventEmitter from 'events';

interface ISecurityCameras {
	ip: string;
	location: number;
}

const securityCamerasSchema = new Schema<ISecurityCameras>({
	ip: String,
	location: {
		type: Number,
		ref: 'Location'
	}
});

securityCamerasSchema.set('versionKey', false);
securityCamerasSchema.index({ip: 1});

export default model<ISecurityCameras>('SecurityCameras', securityCamerasSchema);

export const evts = new EventEmitter();
