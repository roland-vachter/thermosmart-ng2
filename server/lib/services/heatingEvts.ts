import EventEmitter from 'events';
import TypedEventEmitter from 'typed-emitter';

interface ChangeHeatingEvent {
	isOn: boolean;
	location: number;
}

interface ChangeHeatingPowerEvent {
	location: number;
	poweredOn: boolean;
	until?: Date;
}

type HeatingEvents = {
	changeHeating: (h: ChangeHeatingEvent) => void;
	changeHeatingPower: (h: ChangeHeatingPowerEvent) => void;
}

export default new EventEmitter() as TypedEventEmitter<HeatingEvents>;
