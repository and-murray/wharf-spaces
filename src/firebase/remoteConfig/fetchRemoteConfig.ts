import remoteConfig from '@react-native-firebase/remote-config';
import {ParkingCapacityConfig} from '@state/reducers/RemoteConfigSlice';
import Config from 'react-native-config';

export function getDeskCapacity(): number {
  return remoteConfig().getNumber('deskCapacity');
}

export function getIsDemoLoginEnabled(): boolean {
  return remoteConfig().getBoolean('isDemoLoginEnabled');
}

export function getParkingCapacity(): ParkingCapacityConfig {
  const parkingCapacity = remoteConfig().getString('parkingCapacity');
  if (parkingCapacity) {
    return JSON.parse(parkingCapacity);
  } else {
    return JSON.parse(parkingDefault);
  }
}

export async function fetchInitialRemoteConfig(): Promise<boolean> {
  if (Config.REMOTE_CONFIG_FETCH_DEBUG) {
    await remoteConfig().setConfigSettings({minimumFetchIntervalMillis: 30000});
  }
  await setDefaults();
  return remoteConfig().fetchAndActivate();
}

async function setDefaults() {
  await remoteConfig().setDefaults({
    deskCapacity: 36,
    parkingCapacity: parkingDefault,
    isDemoLoginEnabled: false,
  });
}

const parkingDefault = JSON.stringify({
  murray: 6,
  tenzing: 2,
  hawking: 2,
  unknown: 0,
});
