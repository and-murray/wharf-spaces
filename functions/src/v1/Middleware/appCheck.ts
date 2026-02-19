import type {Request, Response} from 'express';
import * as admin from 'firebase-admin';

const appCheck = async (req: Request, res: Response, next: Function) => {
  const appCheckToken = req.headers['x-firebase-appcheck'];
  if (!appCheckToken) {
    res.status(401).send('Missing App Check Header');
  }
  try {
    const tokenResponse = await admin
      .appCheck()
      .verifyToken(appCheckToken as string);
    if (await validAppId(tokenResponse.appId)) {
      next();
    } else {
      res.status(401).send('Invalid App Id');
    }
  } catch {
    res.status(401).send('Unauthorized Device');
  }
};

async function validAppId(appId: string): Promise<boolean> {
  return (
    appId === appCheckConfig().webAppId ||
    appId === appCheckConfig().iOSAppId ||
    appId === appCheckConfig().iOSEnterpriseAppId ||
    appId === appCheckConfig().androidAppId
  );
}
export default appCheck;

type AppCheckConfig = {
  webAppId: string;
  androidAppId: string;
  iOSAppId: string;
  iOSEnterpriseAppId: string;
};

export function appCheckConfig(): AppCheckConfig {
  if (process.env.FUNCTIONS_EMULATOR) {
    return {
      webAppId: '1:158825467211:web:95848ee4581486165f6cce',
      androidAppId: '1:158825467211:android:85063aa7df7881b45f6cce',
      iOSAppId: '1:158825467211:ios:fc70f2c6aebf346d5f6cce',
      iOSEnterpriseAppId: '1:158825467211:ios:df7deb454c644c1c5f6cce',
    };
  }
  if (process.env.GCLOUD_PROJECT === 'murray-apps-dev') {
    return {
      webAppId: '1:158825467211:web:95848ee4581486165f6cce',
      androidAppId: '1:158825467211:android:85063aa7df7881b45f6cce',
      iOSAppId: '1:158825467211:ios:fc70f2c6aebf346d5f6cce',
      iOSEnterpriseAppId: '1:158825467211:ios:df7deb454c644c1c5f6cce',
    };
  }
  return {
    webAppId: '1:766732919970:web:4986e35dba950e254623fb',
    androidAppId: '1:766732919970:android:7332d15ee09cf3bc4623fb',
    iOSAppId: '1:766732919970:ios:780269d67752bb334623fb',
    iOSEnterpriseAppId: '',
  };
}
