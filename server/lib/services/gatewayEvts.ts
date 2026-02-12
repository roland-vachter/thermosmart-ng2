import EventEmitter from 'events';
import TypedEventEmitter from 'typed-emitter';
import { GatewayStatus } from './gateway';

type GatewayEvents = {
	statusChange: (evt: GatewayStatus & { location: number }) => void;
}

export default new EventEmitter() as TypedEventEmitter<GatewayEvents>;
