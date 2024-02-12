import { Schema, model } from 'mongoose';
import moment from 'moment-timezone';

export interface IHeatingSensorHistory {
	sensor: number;
	datetime: Date;
	t: number;
	h: number;
}

const heatingSensorHistorySchema = new Schema<IHeatingSensorHistory>({
	sensor: {
		type: Number,
		ref: 'SensorSetting',
		index: true
	},
	datetime: {
		type: Date,
		index: true
	},
	t: Number,
	h: Number
});

heatingSensorHistorySchema.set('versionKey', false);

const HeatingSensorHistory = model<IHeatingSensorHistory>('HeatingSensorHistory', heatingSensorHistorySchema);
export default HeatingSensorHistory;

function cleanup () {
	HeatingSensorHistory
		.deleteMany({
			datetime: {
				$lt: moment().subtract(1, 'week').toDate()
			}
		})
		.exec()
		.then(result => {
			console.log('Successfully cleaned up heating plan overrides, deleted count:', result.deletedCount);
		})
		.catch(e => {
			console.error('Failed to cleanup heating plan overrides with error:', e);
		});
}

cleanup();
setInterval(cleanup, 60 * 60 * 1000);
