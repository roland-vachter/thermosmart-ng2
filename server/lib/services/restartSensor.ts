import EventEmitter from 'events';
import TypedEventEmitter from 'typed-emitter';

let restartInProgress = false;

export const restartSensorEvts = new EventEmitter() as TypedEventEmitter<{ change: (r: boolean) => void}>;

export const initiateRestart = () => {
	if (restartInProgress === false) {
		restartInProgress = true;
		restartSensorEvts.emit('change', restartInProgress);

		setTimeout(() => {
			restartInProgress = false;
			restartSensorEvts.emit('change', restartInProgress);
		}, 60000);
	}
};

export const getRestartStatus = () => {
	return restartInProgress;
};
