import type {NextFunction, Request, Response} from 'express';
import * as admin from 'firebase-admin';
import {getConfig} from '../Config';

const appCheck = async (req: Request, res: Response, next: NextFunction) => {
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
