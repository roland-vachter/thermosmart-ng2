import moment, { Moment } from 'moment-timezone';
import { GATEWAY_STATUS } from '../types/generic';
import gatewayEvts from './gatewayEvts';
import GatewayResetHistory from '../models/GatewayResetHistory';

export interface GatewayStatus {
  status: GATEWAY_STATUS;
  resetInitiated: boolean;
  resetInProgress: boolean;
  lastResetAt: Moment;
  initialized: boolean;
  lastUpdate: Moment;
};

const defaultValues: GatewayStatus = {
  status: GATEWAY_STATUS.CONNECTED,
  resetInitiated: false,
  resetInProgress: false,
  lastResetAt: null,
  initialized: false,
  lastUpdate: null
};

const statusByLocation: Record<number, GatewayStatus> = {};

const updateStatusInternal = () => {
  Object.keys(statusByLocation).map(Number).forEach(locationId => {
    const locationStatus = statusByLocation[locationId];
    if (!locationStatus.lastUpdate || moment().diff(locationStatus.lastUpdate, 'minute') > 1) {
      locationStatus.status = GATEWAY_STATUS.DISCONNECTED;
      locationStatus.resetInProgress = false;
      locationStatus.resetInitiated = false;

      gatewayEvts.emit('statusChange', {
        ...statusByLocation[locationId],
        location: locationId
      });
    }
  });
}
setInterval(updateStatusInternal, 60000);

const initLocation = async (locationId: number) => {
  if (!statusByLocation[locationId]) {
    statusByLocation[locationId] = { ...defaultValues };
    statusByLocation[locationId].initialized = true;

    const gatewayHistory = await GatewayResetHistory.findOne({
      location: locationId
    }).sort({
      datetime: -1
    }).exec();

    if (gatewayHistory?.datetime) {
      statusByLocation[locationId].lastResetAt = moment(gatewayHistory.datetime);
    }
  }
};

export async function getStatus(locationId: number) {
  await initLocation(locationId);

  return statusByLocation[locationId];
}

export async function reset(locationId: number) {
  await initLocation(locationId);

  if (statusByLocation[locationId].resetInitiated || (
      statusByLocation[locationId].status === GATEWAY_STATUS.CONNECTED && !statusByLocation[locationId].resetInProgress
    )) {
    statusByLocation[locationId].resetInitiated = !statusByLocation[locationId].resetInitiated;

    gatewayEvts.emit('statusChange', {
      ...statusByLocation[locationId],
      location: locationId
    });
  }
}

export async function updateStatus(locationId: number, wasReset: boolean) {
  await initLocation(locationId);

  statusByLocation[locationId].status = GATEWAY_STATUS.CONNECTED;
  statusByLocation[locationId].lastUpdate = moment();
  if (wasReset) {
    statusByLocation[locationId].lastResetAt = moment();
    await new GatewayResetHistory({
      datetime: statusByLocation[locationId].lastResetAt,
      location: locationId
    }).save();

    statusByLocation[locationId].resetInitiated = false;
    statusByLocation[locationId].resetInProgress = false;
  }

  gatewayEvts.emit('statusChange', {
    ...statusByLocation[locationId],
    location: locationId
  });
}


export async function markReset(locationId: number) {
  await initLocation(locationId);

  statusByLocation[locationId].resetInProgress = true;

  gatewayEvts.emit('statusChange', {
    ...statusByLocation[locationId],
    location: locationId
  });
}
