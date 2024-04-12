export type Config = {
  baseURL: string;
  webAppId: string;
  androidAppId: string;
  iOSAppId: string;
  iOSEnterpriseAppId: string;
};

export function getConfig(): Config {
  if (process.env.FUNCTIONS_EMULATOR) {
    return {
      baseURL: 'http://127.0.0.1:5001/murray-apps-dev/europe-west1',
      webAppId: '1:158825467211:web:95848ee4581486165f6cce',
      androidAppId: '1:158825467211:android:85063aa7df7881b45f6cce',
      iOSAppId: '1:158825467211:ios:fc70f2c6aebf346d5f6cce',
      iOSEnterpriseAppId: '1:158825467211:ios:df7deb454c644c1c5f6cce',
    };
  }
  if (process.env.GCLOUD_PROJECT === 'murray-apps-dev') {
    return {
      baseURL: 'https://europe-west1-murray-apps-dev.cloudfunctions.net',
      webAppId: '1:158825467211:web:95848ee4581486165f6cce',
      androidAppId: '1:158825467211:android:85063aa7df7881b45f6cce',
      iOSAppId: '1:158825467211:ios:fc70f2c6aebf346d5f6cce',
      iOSEnterpriseAppId: '1:158825467211:ios:df7deb454c644c1c5f6cce',
    };
  }
  return {
    baseURL: 'https://europe-west1-murray-apps.cloudfunctions.net',
    webAppId: '1:766732919970:web:4986e35dba950e254623fb',
    androidAppId: '1:766732919970:android:7332d15ee09cf3bc4623fb',
    iOSAppId: '1:766732919970:ios:780269d67752bb334623fb',
    iOSEnterpriseAppId: '',
  };
}
