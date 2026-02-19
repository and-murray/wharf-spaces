export type Config = {
  webAppId: string;
  androidAppId: string;
  iOSAppId: string;
  iOSEnterpriseAppId: string;
  deskCapacity: number;
  parkingCapacity: ParkingCapacity;
  endpoints: Endpoints;
};

export type ParkingCapacity = {
  murrayCarCapacity: number;
  adamsCarCapacity: number;
  tenzingCarCapacity: number;
  unknownCarCapacity: number;
};

export type Endpoints = {
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

export function defaultConfig(): Config {
  if (process.env.FUNCTIONS_EMULATOR) {
    return {
      webAppId: '1:158825467211:web:95848ee4581486165f6cce',
      androidAppId: '1:158825467211:android:85063aa7df7881b45f6cce',
      iOSAppId: '1:158825467211:ios:fc70f2c6aebf346d5f6cce',
      iOSEnterpriseAppId: '1:158825467211:ios:df7deb454c644c1c5f6cce',
      deskCapacity: defaultDeskCapacity,
      parkingCapacity: defaultParkingCapacity,
      endpoints: {
        carAPIURL:
          'http://127.0.0.1:5001/murray-apps-dev/europe-west1/carapi/v1/booking',
        deskAPIURL:
          'http://127.0.0.1:5001/murray-apps-dev/europe-west1/deskapi/v1/booking',
        genericAPIURL:
          'http://127.0.0.1:5001/murray-apps-dev/europe-west1/deskapi/v1/booking',
      },
    };
  }
  if (process.env.GCLOUD_PROJECT === 'murray-apps-dev') {
    return {
      webAppId: '1:158825467211:web:95848ee4581486165f6cce',
      androidAppId: '1:158825467211:android:85063aa7df7881b45f6cce',
      iOSAppId: '1:158825467211:ios:fc70f2c6aebf346d5f6cce',
      iOSEnterpriseAppId: '1:158825467211:ios:df7deb454c644c1c5f6cce',
      deskCapacity: defaultDeskCapacity,
      parkingCapacity: defaultParkingCapacity,
      endpoints: {
        carAPIURL: 'https://carapigen2-qg3ssmjwca-ew.a.run.app/v1/booking',
        deskAPIURL: 'https://deskapigen2-qg3ssmjwca-ew.a.run.app/v1/booking',
        genericAPIURL: 'https://apigen2-qg3ssmjwca-ew.a.run.app',
      },
    };
  }
  //TODO: CHANGE TO PROD URLS
  return {
    webAppId: '1:766732919970:web:4986e35dba950e254623fb',
    androidAppId: '1:766732919970:android:7332d15ee09cf3bc4623fb',
    iOSAppId: '1:766732919970:ios:780269d67752bb334623fb',
    iOSEnterpriseAppId: '',
    deskCapacity: defaultDeskCapacity,
    parkingCapacity: defaultParkingCapacity,
    endpoints: {
      carAPIURL:
        'http://127.0.0.1:5001/murray-apps-dev/europe-west1/carapi/v1/booking',
      deskAPIURL:
        'http://127.0.0.1:5001/murray-apps-dev/europe-west1/deskapi/v1/booking',
      genericAPIURL:
        'http://127.0.0.1:5001/murray-apps-dev/europe-west1/deskapi/v1/booking',
    },
  };
}
