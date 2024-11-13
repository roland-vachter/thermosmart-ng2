import EventEmitter from 'events';
import TypedEventEmitter from 'typed-emitter';
import PlantWateringSchedule, { IPlantWateringSchedule } from '../models/PlantWateringSchedule';
import PlantWateringStatusHistory from '../models/PlantWateringStatusHistory';

export const PLANT_WATERING_STATUS = {
	DRY: false,
	WET: true
};
const MINUTES_UNTIL_DRY = 6;

const zones = [1, 2];

interface PlantWateringStatus extends IPlantWateringSchedule {
	status: boolean;
}

export const plantWateringEvts = new EventEmitter() as TypedEventEmitter<{ update: (o: PlantWateringStatus) => void }>;

const status: Record<number, PlantWateringStatus> = {};
let initialPromise: Promise<void> | null = Promise.all(zones.map(async z => {
	const [schedule, lastHistoryItem] = await Promise.all([
		PlantWateringSchedule
			.findOne({
				zone: z
			})
			.exec(),
		PlantWateringStatusHistory
			.findOne({
				zone: z
			})
			.sort({
				datetime: -1
			})
			.exec()
	]);

	if (!status[z]) {
		status[z] = {} as PlantWateringStatus;
	}

	if (lastHistoryItem) {
		status[z].status = lastHistoryItem.status;
	} else {
		status[z].status = PLANT_WATERING_STATUS.WET;
	}

	if (schedule) {
		status[z].minutesUntilDry = schedule.minutesUntilDry;
		status[z].label = schedule.label;
	} else {
		await new PlantWateringSchedule({
			zone: z,
			label: z.toString(),
			minutesUntilDry: MINUTES_UNTIL_DRY
		}).save();

		status[z].minutesUntilDry = MINUTES_UNTIL_DRY;
		status[z].label = z.toString();
	}
})).then(() => {
	initialPromise = null;

	// setInterval(() => {
	// 	Object.keys(status).map(Number).forEach(async z => {
	// 		status[z].minutesUntilDry -= 1;
	// 		if (status[z].minutesUntilDry <= 0) {
	// 			status[z].minutesUntilDry = 0;
	// 			status[z].status = PLANT_WATERING_STATUS.DRY;

	// 			await new PlantWateringStatusHistory({
	// 				zone: z,
	// 				datetime: new Date(),
	// 				status: PLANT_WATERING_STATUS.DRY
	// 			}).save();

	// 			await PlantWateringSchedule
	// 				.findOneAndUpdate({
	// 					zone: z
	// 				}, {
	// 					minutesUntilDry: 0
	// 				});

	// 			plantWateringEvts.emit('update', status[z]);
	// 		}
	// 	});
	// }, 60 * 1000);
});

export const getPlantWateringStatus = async () => initialPromise ? initialPromise.then(() => status) : status;

export const markAsWet = async (z: number) => {
	// await new PlantWateringStatusHistory({
	// 	zone: z,
	// 	datetime: new Date(),
	// 	status: PLANT_WATERING_STATUS.WET
	// }).save();

	// await PlantWateringSchedule
	// 	.findOneAndUpdate({
	// 		zone: z
	// 	}, {
	// 		minutesUntilDry: MINUTES_UNTIL_DRY
	// 	});

	// plantWateringEvts.emit('update', status[z]);
};
