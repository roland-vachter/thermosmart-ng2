import moment, { Moment } from 'moment-timezone';
import Location from '../models/Location';
import { getConfig } from './config';
import SolarSystemHeatingHistory from '../models/SolarSystemHeatingHistory';
import EventEmitter from 'events';
import TypedEventEmitter from 'typed-emitter';
import { LOCATION_FEATURE, LocationBasedEvent } from '../types/generic';
import { hasLocationFeature } from './location';
import { getAvgByLocation } from './insideConditions';
import { deepEqual } from '../utils/utils';
import SolarSystemHistory from '../models/SolarSystemHistory';
import GridVoltageHistory from '../models/GridVoltageHistory';

enum DEVICE_TYPE {
  INVERTER = 'INVERTER',
  SMART_METER = 'SMART_METER'
}

const DEVICE_ID_BY_TYPE = {
  [DEVICE_TYPE.INVERTER]: 38,
  [DEVICE_TYPE.SMART_METER]: 47
}

interface SolarSystemHeatingStatus {
  wattHourConsumption: number;
  wattHourAvailable: number;
  numberOfRadiators: number;
  solarProduction?: {
    value?: number;
    lastUpdate?: Moment;
  }
  gridInjection?: {
    value?: number;
    lastUpdate?: Moment;
  }
  gridVoltage?: number;
  authToken?: string;
  deviceList?: HuaweiDeviceList;
}

interface HuaweiGenericResponse {
  failCode: number;
  message: string;
  success: boolean;
}

interface HuaweiDevice {
  devDn: string;
  devTypeId: number;
}

type HuaweiDeviceList = Partial<Record<DEVICE_TYPE, string>>;

interface HuaweiDeviceListResponse {
  data: HuaweiDevice[];
}

interface HuaweiData {
  active_power: number;
  meter_u: number;
}

interface HuaweiDeviceResponse {
  data: {
    dataItemMap: HuaweiData;
  }[];
}


interface SolarSystemStatus {
  wattHourConsumption: number;
  wattHourAvailable: number;
  numberOfRadiators: number;
  solarProduction: number;
  gridInjection: number;
  gridVoltage: number;
  isOn: boolean;
}

type SolarSystemEvents = {
	change: (e: SolarSystemStatus & LocationBasedEvent) => void;
}

export const solarSystemEvts = new EventEmitter() as TypedEventEmitter<SolarSystemEvents>;


const statusByLocations: Record<number, SolarSystemHeatingStatus> = {};
const lastSentStatusByLocations: Record<number, SolarSystemStatus> = {};

async function updateAllLocations () {
  const locations = await Location
		.find()
		.exec();

	return Promise.all(locations.map(l => {
    if (hasLocationFeature(l, LOCATION_FEATURE.SOLAR_SYSTEM_HEATING)) {
      return updateByLocation(l._id);
    } else {
      return null;
    }
  }));
}

function initLocation(locationId: number) {
  if (!statusByLocations[locationId]) {
    statusByLocations[locationId] = {
      wattHourConsumption: 0,
      wattHourAvailable: 0,
      numberOfRadiators: 0,
      solarProduction: {
        value: 0,
        lastUpdate: moment()
      },
      gridInjection: {
        value: 0,
        lastUpdate: moment()
      },
      gridVoltage: 0
    };
  }
}

async function getAuthToken(apiUrl: string, username: string, password: string) {
  let authToken: string;
  try {
    const resLogin = await fetch(`${apiUrl}/thirdData/login`, {
      method: 'POST',
      headers: [
        ['Content-type', 'application/json']
      ],
      body: JSON.stringify({
        userName: username,
        systemCode: password
      })
    });

    if (resLogin.headers.get('xsrf-token')) {
      authToken = resLogin.headers.get('xsrf-token');
    } else {
      const resJson = await resLogin.json();
      console.warn(resJson.failCode, resJson.message);
    }
  } catch (e) {
    console.warn(e);
  }

  return authToken;
}

async function getHuaweiDeviceList(apiUrl: string, authToken: string, stationCode: string) {
  let devices: Partial<Record<DEVICE_TYPE, string>>;

  try {
    const resDevList = await fetch(`${apiUrl}/thirdData/getDevList`, {
      method: 'POST',
      headers: [
        ['Content-type', 'application/json'],
        ['XSRF-TOKEN', authToken]
      ],
      body: JSON.stringify({
        stationCodes: stationCode
      })
    });

    const resJson = await resDevList.json() as HuaweiGenericResponse & HuaweiDeviceListResponse;

    if (resJson) {
      if (!resJson.success) {
        console.warn('SOLAR:', resJson.failCode, resJson.message);
        return resJson.message;
      } else {
        console.log('SOLAR: -> device list successful');
        devices = {};
        resJson?.data?.forEach(d => {
          switch (d.devTypeId) {
            case 38:
              devices[DEVICE_TYPE.INVERTER] = d.devDn;
              break;
            case 47:
              devices[DEVICE_TYPE.SMART_METER] = d.devDn;
              break;
          }
        });
      }
    }
  } catch (e) {
    console.warn(e);
  }

  return devices;
}

async function getHuaweiData(apiUrl: string, authToken: string, deviceType: DEVICE_TYPE, deviceId: string) {
  try {
    const resDevList = await fetch(`${apiUrl}/thirdData/getDevRealKpi`, {
      method: 'POST',
      headers: [
        ['Content-type', 'application/json'],
        ['XSRF-TOKEN', authToken]
      ],
      body: JSON.stringify({
        devIds: deviceId,
        devTypeId: DEVICE_ID_BY_TYPE[deviceType]
      })
    });

    const resJson = await resDevList.json() as HuaweiGenericResponse & HuaweiDeviceResponse;

    if (resJson) {
      if (!resJson.success) {
        console.warn('SOLAR:', deviceType, resJson.failCode, resJson.message);
        return resJson.message;
      } else {
        console.log('SOLAR:', deviceType, 'successful');
        return resJson.data.length && resJson.data[0]?.dataItemMap || null;
      }
    }
  } catch (e) {
    console.warn(e);
  }

  return null;
}

async function calculateWattHourAvailable(locationId: number) {
  const [targetTemperatureConfig, solarHeatingDisabled] = await Promise.all([
    await getConfig('solarSystemHeatingTemperature', locationId),
    await getConfig('solarHeatingDisabled', locationId)
  ]);

  let targetTemp = 24;
  if (targetTemperatureConfig?.value) {
    targetTemp = targetTemperatureConfig.value as number;
  }

  const insideCondition = getAvgByLocation(locationId);

  const locationStatus = statusByLocations[locationId];
  const correctedGridInjectionValue = Math.min(
    locationStatus?.gridInjection?.value + locationStatus.wattHourConsumption,
    locationStatus?.solarProduction?.value || 0
  );

  console.log('SOLAR: production', locationStatus?.solarProduction?.value);
  console.log('SOLAR: grid injection', locationStatus?.gridInjection?.value);
  console.log('SOLAR: corrected grid injection', correctedGridInjectionValue);

  if (correctedGridInjectionValue > 0 && !(
    insideCondition.temperature > targetTemp ||
    solarHeatingDisabled?.value === true
  )) {
    console.log('SOLAR: Wh available', correctedGridInjectionValue);

    return correctedGridInjectionValue;
  } else {
    console.log('SOLAR: OFF', insideCondition.temperature > targetTemp ? 'temp over target' : solarHeatingDisabled?.value === true ? 'disabled' : 'unknown');
  }

  return 0;
}

async function updateByLocation(locationId: number) {
  initLocation(locationId);

  const locationStatus = statusByLocations[locationId];

  const lastSolarProduction = locationStatus?.solarProduction?.value || 0;
  const lastGridInjection = locationStatus?.gridInjection?.value || 0;
  const lastGridVoltage = locationStatus?.gridVoltage || 0;

  const [inverterType, apiUrl, username, password, stationCode] = await Promise.all([
    getConfig('solarSystemInverterType', locationId),
    getConfig('solarSystemApiUrl', locationId),
    getConfig('solarSystemUsername', locationId),
    getConfig('solarSystemPassword', locationId),
    getConfig('solarSystemStationCode', locationId)
  ]);

  if (inverterType?.value && apiUrl?.value && username?.value && password?.value) {
    if (inverterType?.value === 'Huawei') {
      if (!locationStatus.authToken) {
        locationStatus.authToken = await getAuthToken(apiUrl.value as string, username.value as string, password.value as string);
      }

      if (locationStatus.authToken) {
        if (!locationStatus.deviceList) {
          let resDeviceList = await getHuaweiDeviceList(apiUrl?.value as string, locationStatus.authToken, stationCode?.value as string);

          if (typeof resDeviceList === 'string' && resDeviceList === 'USER_MUST_RELOGIN') {
            locationStatus.authToken = await getAuthToken(apiUrl.value as string, username.value as string, password.value as string);
            resDeviceList = await getHuaweiDeviceList(apiUrl?.value as string, locationStatus.authToken, stationCode?.value as string);
          }

          if (typeof resDeviceList !== 'string') {
            locationStatus.deviceList = resDeviceList as HuaweiDeviceList;
          }

          await new Promise(resolve => setTimeout(resolve, 10000));
        }

        if (locationStatus.deviceList instanceof Object && locationStatus.deviceList[DEVICE_TYPE.INVERTER]) {
          let resInverter = await getHuaweiData(apiUrl?.value as string, locationStatus.authToken, DEVICE_TYPE.INVERTER, locationStatus.deviceList[DEVICE_TYPE.INVERTER]);

          if (typeof resInverter === 'string' && resInverter === 'USER_MUST_RELOGIN') {
            locationStatus.authToken = await getAuthToken(apiUrl.value as string, username.value as string, password.value as string);
            resInverter = await getHuaweiData(apiUrl?.value as string, locationStatus.authToken, DEVICE_TYPE.INVERTER, locationStatus.deviceList[DEVICE_TYPE.INVERTER]);
          }

          resInverter = resInverter as HuaweiData;

          locationStatus.solarProduction = {
            value: Math.round((resInverter?.active_power || 0) * 1000),
            lastUpdate: moment()
          };
        }

        await new Promise(resolve => setTimeout(resolve, 10000));

        if (locationStatus.deviceList instanceof Object && locationStatus.deviceList[DEVICE_TYPE.SMART_METER]) {
          let resSmartMeter = await getHuaweiData(apiUrl?.value as string, locationStatus.authToken, DEVICE_TYPE.SMART_METER, locationStatus.deviceList[DEVICE_TYPE.SMART_METER]);

          if (typeof resSmartMeter === 'string' && resSmartMeter === 'USER_MUST_RELOGIN') {
            locationStatus.authToken = await getAuthToken(apiUrl.value as string, username.value as string, password.value as string);
            resSmartMeter = await getHuaweiData(apiUrl?.value as string, locationStatus.authToken, DEVICE_TYPE.SMART_METER, locationStatus.deviceList[DEVICE_TYPE.SMART_METER]);
          }

          resSmartMeter = resSmartMeter as HuaweiData;

          locationStatus.gridInjection = {
            value: Math.round(resSmartMeter?.active_power || 0),
            lastUpdate: moment()
          }

          locationStatus.gridVoltage = Math.round(resSmartMeter?.meter_u || 0);
        }
      }
    }
  }

  if (locationStatus?.solarProduction?.lastUpdate && locationStatus?.solarProduction?.lastUpdate?.isBefore(moment().subtract(30, 'minutes'))) {
    locationStatus.solarProduction.value = 0;
  }

  if (locationStatus?.gridInjection?.lastUpdate && locationStatus?.gridInjection?.lastUpdate?.isBefore(moment().subtract(30, 'minutes'))) {
    locationStatus.gridInjection.value = 0;
  }

  locationStatus.wattHourAvailable = await calculateWattHourAvailable(locationId);

  if (locationStatus.solarProduction.value !== lastSolarProduction || locationStatus.gridInjection.value !== lastGridInjection) {
    await new SolarSystemHistory({
      location: locationId,
      datetime: new Date(),
      solarProduction: locationStatus.solarProduction.value,
      consumption: locationStatus.solarProduction.value - locationStatus.gridInjection.value
    }).save();
  }

  if (locationStatus.gridVoltage !== lastGridVoltage) {
    await new GridVoltageHistory({
      location: locationId,
      datetime: new Date(),
      gridVoltage: locationStatus.gridVoltage
    }).save();
  }

  const newLocationStatus = await getStatusByLocation(locationId);
  if (!lastSentStatusByLocations[locationId] || !deepEqual(lastSentStatusByLocations[locationId], newLocationStatus)) {
    console.log('SOLAR: emit solar event');
    solarSystemEvts.emit('change', {
      location: locationId,
      ...newLocationStatus
    });

    lastSentStatusByLocations[locationId] = newLocationStatus;
  }
};

export async function getStatusByLocation(locationId: number): Promise<SolarSystemStatus> {
  const locationStatus = statusByLocations[locationId];
  if (locationStatus) {
    const solarHeatingDisabled = await getConfig('solarHeatingDisabled', locationId);

    return {
      wattHourConsumption: locationStatus.wattHourConsumption || 0,
      wattHourAvailable: locationStatus.wattHourAvailable || 0,
      numberOfRadiators: locationStatus.numberOfRadiators || 0,
      solarProduction: locationStatus.solarProduction?.value || 0,
      gridInjection: locationStatus.gridInjection?.value || 0,
      gridVoltage: locationStatus.gridVoltage || 0,
      isOn: solarHeatingDisabled?.value !== true
    };
  }

  return null;
}

export async function isSolarHeatingOn(locationId: number) {
  const status = await getStatusByLocation(locationId);

  return status?.wattHourConsumption > 0 && status?.isOn;
}

let updateTimeout: ReturnType<typeof setTimeout>;
export async function updateRadiatorConsumption(locationId: number, numberOfRadiators: number, wattHourConsumptionReported: number) {
  initLocation(locationId);

  const locationStatus = statusByLocations[locationId];
  locationStatus.numberOfRadiators = numberOfRadiators;

  if (typeof locationStatus.wattHourConsumption !== 'number') {
    const lastSavedStatus = await SolarSystemHeatingHistory.findOne({
      location: locationId,
      wattHourConsumption: { $gte: 0 }
    }).sort({
      datetime: -1
    });

    if (lastSavedStatus) {
      locationStatus.wattHourConsumption = lastSavedStatus.wattHourConsumption;
    }
  }

  console.log('SOLAR: Wh consumption reported', locationStatus.wattHourConsumption, wattHourConsumptionReported);

  if (locationStatus.wattHourConsumption !== wattHourConsumptionReported) {
    await new SolarSystemHeatingHistory({
      location: locationId,
      datetime: new Date(),
      wattHourConsumption: wattHourConsumptionReported
    }).save();
  }

  locationStatus.wattHourConsumption = wattHourConsumptionReported;

  const newLocationStatus = await getStatusByLocation(locationId);

  if (!lastSentStatusByLocations[locationId] || !deepEqual(lastSentStatusByLocations[locationId], newLocationStatus)) {
    console.log('SOLAR: emit solar event');
    solarSystemEvts.emit('change', {
      location: locationId,
      ...newLocationStatus
    });

    lastSentStatusByLocations[locationId] = newLocationStatus;
  }

  if (updateTimeout) {
    clearTimeout(updateTimeout);
  }

  updateTimeout = setTimeout(() => {
    void updateRadiatorConsumption(locationId, 0, 0);
  }, 30 * 60 * 1000);
}

export const init = () => {
  void updateAllLocations();

  setInterval(() => {
    void updateAllLocations();
  }, 5 * 60 * 1000);
}
