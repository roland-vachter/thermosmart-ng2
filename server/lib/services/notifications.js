const plantWateringService = require('./plantWatering');

const evts = new EventEmitter();

exports.evts = evts;
const notifications = [];

exports.getNotifications = () => notifications;

const plantWateringStatus = await plantWateringService.getStatus();
Object.keys(plantWateringStatus).forEach(z => {
	if (plantWateringStatus[z] === plantWateringService.STATUS.DRY) {
		notifications.push({
			label: plantWateringStatus[z].label,
			iconClass: 'plantwatering',
			text: 'Dry'
		})
	}
});
