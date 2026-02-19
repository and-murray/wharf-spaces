export type Endpoints = {
  carAPIURL: string;
  deskAPIURL: string;
  genericAPIURL: string;
};

export function endpointsDefault(): Endpoints {
  // TODO: Emulators
  if (__DEV__) {
    return {
      carAPIURL: 'https://carapigen2-qg3ssmjwca-ew.a.run.app/v1/booking',
      deskAPIURL: 'https://deskapigen2-qg3ssmjwca-ew.a.run.app/v1/booking',
      genericAPIURL: 'https://apigen2-qg3ssmjwca-ew.a.run.app',
    };
  }
  // TODO: Change to Prod Gen2 when we know them
  return {
    carAPIURL:
      'https://europe-west1-murray-apps.cloudfunctions.net/carapi/v1/booking',
    deskAPIURL:
      'https://europe-west1-murray-apps.cloudfunctions.net/deskapi/v1/booking',
    genericAPIURL: 'https://europe-west1-murray-apps.cloudfunctions.net/api',
  };
}
