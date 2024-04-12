import dayjs from 'dayjs';
import {sanitiseDate} from '../../utils/DateTimeUtils';
import admin from 'firebase-admin';
import {getConfig} from '../../Config';

export async function callCarAPI() {
  const config = getConfig();
  const url = `${config.baseURL}/carapi/v1/booking/allocateEmptySlots`;
  console.log(`URL: ${url}`);
  const appCheckToken = await admin.appCheck().createToken(config.webAppId);
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
  const options = {
    method: 'PATCH',
    headers: {
      'X-Firebase-AppCheck': appCheckToken.token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({date: midnightDate, spaceType: 'car'}),
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
