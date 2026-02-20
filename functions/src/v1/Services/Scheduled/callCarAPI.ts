import dayjs from 'dayjs';
import {sanitiseDate} from '../../utils/DateTimeUtils';
import admin from 'firebase-admin';
import fetchBuilder, {RequestInitWithRetry} from 'fetch-retry';
import {getFirebaseRemoteConfig} from '../../Config';
import {appCheckConfig} from '../../Middleware/appCheck';

const fetch = fetchBuilder(global.fetch);

export async function callCarAPI() {
  const config = await getFirebaseRemoteConfig();

  const url = `${config.endpoints.carAPIURL}/v1/booking/allocateEmptySlots`;
  console.log(`URL: ${url}`);
  const appCheckToken = await admin
    .appCheck()
    .createToken(appCheckConfig().webAppId);
  try {
    const verifying = await admin.appCheck().verifyToken(appCheckToken.token);
    console.log(`Verifying ${verifying.token}`);
  } catch (error) {
    console.log(`Failed verifying error ${error}`);
  }
  if (!appCheckToken) {
    const error = new Error('500 failed to create app check token');
    return Promise.reject(error);
  }
  const tomorrow = dayjs().add(1, 'day');
  const midnightDate = sanitiseDate(dayjs(tomorrow)).format(
    'YYYY-MM-DDT00:00:00[Z]',
  );
  const options: RequestInitWithRetry<typeof fetch> = {
    method: 'PATCH',
    headers: {
      'X-Firebase-AppCheck': appCheckToken.token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({date: midnightDate, spaceType: 'car'}),
    // retry up to 3 times with backoff if >400 status code
    retries: 3,
    retryOn: async (_attempt, error, response) =>
      error !== null || (response !== null && response.status >= 400),
    retryDelay: (attempt, _error, _response) => Math.pow(3, attempt) * 5000,
  };
  const response = await fetch(url, options);
  if (!response.ok) {
    let errorInfo;
    try {
      errorInfo = await response.json();
    } catch {
      errorInfo = response;
    }
    const error = new Error(`${response.status} ${JSON.stringify(errorInfo)}`);
    return Promise.reject(error);
  } else {
    return Promise.resolve();
  }
}
