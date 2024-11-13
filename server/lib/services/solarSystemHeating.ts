import moment, { Moment } from 'moment-timezone';
import Location from '../models/Location';
import { getConfig } from './config';
import SolarSystemHeatingHistory from '../models/SolarSystemHeatingHistory';
import EventEmitter from 'events';
import TypedEventEmitter from 'typed-emitter';
import { LOCATION_FEATURE, LocationBasedEvent } from '../types/generic';
import { hasLocationFeature } from './location';
import { getAvgByLocation } from './insideConditions';

enum DEVICE_TYPE {
  INVERTER = 'INVERTER',
  SMART_METER = 'SMART_METER'
}

const DEVICE_ID_BY_TYPE = {
  [DEVICE_TYPE.INVERTER]: 38,
  [DEVICE_TYPE.SMART_METER]: 47
}

interface SolarSystemHeatingStatus {
  numberOfRadiators: number;
  numberOfRunningRadiators: number;
  numberOfRunningRadiatorsReported: number;
  solarProduction?: {
    value?: number;
    lastUpdate?: Moment;
  }
  gridInjection?: {
    value?: number;
    lastUpdate?: Moment;
  }
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

interface HuaweiDeviceResponse {
  data: {
    dataItemMap: {
      active_power: number;
    }
  }[];
}


interface SolarSystemStatus {
  numberOfRadiators: number;
  numberOfRunningRadiators: number;
  solarProduction: number;
  gridInjection: number;
}

type SolarSystemEvents = {
	change: (e: SolarSystemStatus & LocationBasedEvent) => void;
}

export const solarSystemEvts = new EventEmitter() as TypedEventEmitter<SolarSystemEvents>;


const statusByLocations: Record<number, SolarSystemHeatingStatus> = {};

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
      numberOfRadiators: 0,
      numberOfRunningRadiators: 0,
      numberOfRunningRadiatorsReported: null,
      solarProduction: {
        value: 0,
        lastUpdate: moment()
      },
      gridInjection: {
        value: 0,
        lastUpdate: moment()
      }
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
        console.warn(resJson.failCode, resJson.message);
        return resJson.message;
      } else {
        console.log('-> device list successful');
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

async function getHuaweiActivePower(apiUrl: string, authToken: string, deviceType: DEVICE_TYPE, deviceId: string) {
  let power: number;

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
        console.warn(deviceType, resJson.failCode, resJson.message);
        return resJson.message;
      } else {
        console.log(deviceType, 'successful');
        power = resJson.data.length ? resJson.data[0]?.dataItemMap?.active_power : 0;
      }
    }
  } catch (e) {
    console.warn(e);
  }

  return power;
}

async function calculateNumberOfRunningRadiators(locationId: number) {
  const [radiatorPower, targetTemperatureConfig] = await Promise.all([
    await getConfig('solarSystemRadiatorPower', locationId),
    await getConfig('solarSystemHeatingTemperature', locationId)
  ]);

  let targetTemp = 24;
  if (targetTemperatureConfig?.value) {
    targetTemp = targetTemperatureConfig.value as number;
  }

  const insideCondition = getAvgByLocation(locationId);

  if (insideCondition.temperature > targetTemp) {
    return 0;
  }

  const locationStatus = statusByLocations[locationId];
  const correctedGridInjectionValue = locationStatus?.gridInjection?.value + locationStatus.numberOfRunningRadiatorsReported * (radiatorPower?.value as number);

  if (radiatorPower?.value && correctedGridInjectionValue > 0 && (radiatorPower?.value as number) > 0) {
    return Math.floor(correctedGridInjectionValue / (radiatorPower?.value as number));
  }

  solarSystemEvts.emit('change', {
    ...getStatusByLocation(locationId),
    location: locationId
  });

  return 0;
}

async function updateByLocation(locationId: number) {
  initLocation(locationId);

  const locationStatus = statusByLocations[locationId];

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
          let resInverter = await getHuaweiActivePower(apiUrl?.value as string, locationStatus.authToken, DEVICE_TYPE.INVERTER, locationStatus.deviceList[DEVICE_TYPE.INVERTER]);

          if (typeof resInverter === 'string' && resInverter === 'USER_MUST_RELOGIN') {
            locationStatus.authToken = await getAuthToken(apiUrl.value as string, username.value as string, password.value as string);
            resInverter = await getHuaweiActivePower(apiUrl?.value as string, locationStatus.authToken, DEVICE_TYPE.INVERTER, locationStatus.deviceList[DEVICE_TYPE.INVERTER]);
          }

          if (typeof resInverter === 'number') {
            locationStatus.solarProduction = {
              value: resInverter * 1000,
              lastUpdate: moment()
            };
          }
        }

        await new Promise(resolve => setTimeout(resolve, 10000));

        if (locationStatus.deviceList instanceof Object && locationStatus.deviceList[DEVICE_TYPE.SMART_METER]) {
          let resSmartMeter = await getHuaweiActivePower(apiUrl?.value as string, locationStatus.authToken, DEVICE_TYPE.SMART_METER, locationStatus.deviceList[DEVICE_TYPE.SMART_METER]);

          if (typeof resSmartMeter === 'string' && resSmartMeter === 'USER_MUST_RELOGIN') {
            locationStatus.authToken = await getAuthToken(apiUrl.value as string, username.value as string, password.value as string);
            resSmartMeter = await getHuaweiActivePower(apiUrl?.value as string, locationStatus.authToken, DEVICE_TYPE.SMART_METER, locationStatus.deviceList[DEVICE_TYPE.SMART_METER]);
          }

          if (typeof resSmartMeter === 'number') {
            locationStatus.gridInjection = {
              value: resSmartMeter,
              lastUpdate: moment()
            }
          }
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

  locationStatus.numberOfRunningRadiators = await calculateNumberOfRunningRadiators(locationId);
};

export function getStatusByLocation(locationId: number): SolarSystemStatus {
  const locationStatus = statusByLocations[locationId];
  if (locationStatus) {
    return {
      numberOfRadiators: locationStatus.numberOfRadiators || 0,
      numberOfRunningRadiators: locationStatus.numberOfRunningRadiators || 0,
      solarProduction: locationStatus.solarProduction?.value || 0,
      gridInjection: locationStatus.gridInjection?.value || 0
    };
  }

  return null;
}

export function isSolarHeatingOn(locationId: number) {
  return getStatusByLocation(locationId)?.numberOfRunningRadiators > 0;
}

let updateTimeout: ReturnType<typeof setTimeout>;
export async function updateRunningRadiators(locationId: number, numberOfRadiators: number, numberOfRunningRadiators: number) {
  initLocation(locationId);

  const locationStatus = statusByLocations[locationId];

  if (typeof locationStatus.numberOfRunningRadiatorsReported !== 'number') {
    const lastSavedStatus = await SolarSystemHeatingHistory.findOne({
      location: locationId
    }).sort({
      datetime: -1
    });

    if (lastSavedStatus) {
      locationStatus.numberOfRunningRadiatorsReported = lastSavedStatus.noOfRunningRadiators;
    }
  }

  if (locationStatus.numberOfRunningRadiatorsReported !== numberOfRunningRadiators) {
    await new SolarSystemHeatingHistory({
      location: locationId,
      datetime: new Date(),
      noOfRunningRadiators: numberOfRunningRadiators
    }).save();
  }

  locationStatus.numberOfRadiators = numberOfRadiators;
  locationStatus.numberOfRunningRadiatorsReported = numberOfRunningRadiators;

  solarSystemEvts.emit('change', {
    location: locationId,
    ...getStatusByLocation(locationId)
  });

  if (updateTimeout) {
    clearTimeout(updateTimeout);
  }

  updateTimeout = setTimeout(() => {
    void updateRunningRadiators(locationId, numberOfRadiators, 0);
  }, 30 * 60 * 1000);
}

export const init = () => {
  void updateAllLocations();

  setInterval(() => {
    void updateAllLocations();
  }, 5.1 * 60 * 1000);
}
