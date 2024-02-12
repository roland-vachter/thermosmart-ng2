import { PLANT_WATERING_STATUS, getPlantWateringStatus } from "./plantWatering";


interface Notification {
	label: string;
	iconClass: string;
	text: string;
}

const notifications: Notification[] = [];

export const getNotifications = () => notifications;

void getPlantWateringStatus().then(plantWateringStatus => {
	Object.keys(plantWateringStatus).map(Number).forEach(z => {
		if (plantWateringStatus[z].status === PLANT_WATERING_STATUS.DRY) {
			notifications.push({
				label: plantWateringStatus[z].label,
				iconClass: 'plantwatering',
				text: 'Dry'
			})
		}
	});
})
