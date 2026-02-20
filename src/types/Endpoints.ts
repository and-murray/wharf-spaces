import {REACT_APP_USE_EMULATORS} from '../util/FirebaseUtils/FirebaseUtils';

export type Endpoints = {
  carAPIURL: string;
  deskAPIURL: string;
  genericAPIURL: string;
};

export function endpointsDefault(): Endpoints {
  if (REACT_APP_USE_EMULATORS && __DEV__) {
    return {
      carAPIURL:
        'http://127.0.0.1:5001/murray-apps-dev/europe-west1/carapiGen2',
      deskAPIURL:
        'http://127.0.0.1:5001/murray-apps-dev/europe-west1/deskapiGen2',
      genericAPIURL:
        'http://127.0.0.1:5001/murray-apps-dev/europe-west1/apiGen2',
    };
  } else if (__DEV__) {
    return {
      carAPIURL: 'https://carapigen2-qg3ssmjwca-ew.a.run.app',
      deskAPIURL: 'https://deskapigen2-qg3ssmjwca-ew.a.run.app',
      genericAPIURL: 'https://apigen2-qg3ssmjwca-ew.a.run.app',
    };
  }
  // TODO: Change to Prod Gen2 when we know them
  return {
    carAPIURL: 'https://europe-west1-murray-apps.cloudfunctions.net/carapi',
    deskAPIURL: 'https://europe-west1-murray-apps.cloudfunctions.net/deskapi',
    genericAPIURL: 'https://europe-west1-murray-apps.cloudfunctions.net/api',
  };
}
