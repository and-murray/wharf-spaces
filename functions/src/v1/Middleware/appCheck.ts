import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {getConfig} from '../Config';

const appCheck = async (
  req: functions.https.Request,
  res: functions.Response<any>,
  next: Function,
) => {
  const appCheckToken = req.headers['x-firebase-appcheck'];
  if (!appCheckToken) {
    res.status(401).send('Missing App Check Header');
  }
  try {
    const tokenResponse = await admin
      .appCheck()
      .verifyToken(appCheckToken as string);
    if (validAppId(tokenResponse.appId)) {
      next();
    } else {
      res.status(401).send('Invalid App Id');
    }
  } catch {
    res.status(401).send('Unauthorized Device');
  }
};

function validAppId(appId: string): boolean {
  const config = getConfig();
  return (
    appId === config.webAppId ||
    appId === config.iOSAppId ||
    appId === config.iOSEnterpriseAppId ||
    appId === config.androidAppId
  );
}
export default appCheck;
