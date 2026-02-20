import {DefaultConfig, getRemoteConfig} from 'firebase-admin/remote-config';
import {firebaseApp} from '../App';

export type Config = {
  deskCapacity: number;
  parkingCapacity: ParkingCapacity;
  endpoints: Endpoints;
};

type ParkingCapacity = {
  murrayCarCapacity: number;
  adamsCarCapacity: number;
  tenzingCarCapacity: number;
  unknownCarCapacity: number;
};

type Endpoints = {
  carAPIURL: string;
  deskAPIURL: string;
  genericAPIURL: string;
};

const defaultParkingCapacity: ParkingCapacity = {
  murrayCarCapacity: 6,
  adamsCarCapacity: 2,
  tenzingCarCapacity: 2,
  unknownCarCapacity: 0,
};

const defaultDeskCapacity = 36;

function defaultRemoteConfig(): DefaultConfig {
  if (process.env.FUNCTIONS_EMULATOR) {
    return {
      deskCapacity: defaultDeskCapacity,
      parkingCapacity: JSON.stringify(defaultParkingCapacity),
      endpoints: JSON.stringify({
        carAPIURL:
          'http://127.0.0.1:5001/murray-apps-dev/europe-west1/carapiGen2',
        deskAPIURL:
          'http://127.0.0.1:5001/murray-apps-dev/europe-west1/deskapiGen2',
        genericAPIURL:
          'http://127.0.0.1:5001/murray-apps-dev/europe-west1/apiGen2',
      }),
    };
  }
  if (process.env.GCLOUD_PROJECT === 'murray-apps-dev') {
    return {
      deskCapacity: defaultDeskCapacity,
      parkingCapacity: JSON.stringify(defaultParkingCapacity),
      endpoints: JSON.stringify({
        carAPIURL: 'https://carapigen2-qg3ssmjwca-ew.a.run.app',
        deskAPIURL: 'https://deskapigen2-qg3ssmjwca-ew.a.run.app',
        genericAPIURL: 'https://apigen2-qg3ssmjwca-ew.a.run.app',
      }),
    };
  }
  //TODO: CHANGE TO PROD URLS
  return {
    deskCapacity: defaultDeskCapacity,
    parkingCapacity: JSON.stringify(defaultParkingCapacity),
    endpoints: JSON.stringify({
      carAPIURL: 'https://carapigen2-qg3ssmjwca-ew.a.run.app',
      deskAPIURL: 'https://deskapigen2-qg3ssmjwca-ew.a.run.app',
      genericAPIURL: 'https://apigen2-qg3ssmjwca-ew.a.run.app',
    }),
  };
}

export async function getFirebaseRemoteConfig(): Promise<Config> {
  // Initialize server-side Remote Config
  const rc = getRemoteConfig(firebaseApp);
  const template = await rc.getServerTemplate({
    defaultConfig: defaultRemoteConfig(),
  });
  // Load Remote Config
  await template.load();
  // Add template parameters to config
  const config = template.evaluate();

  const appConfig: Config = {
    deskCapacity: config.getNumber('deskCapacity'),
    parkingCapacity: JSON.parse(config.getString('parkingCapacity')),
    endpoints: JSON.parse(config.getString('endpoints')),
  };

  console.log(appConfig);
  return appConfig;
}
