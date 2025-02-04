import {onRequest} from 'firebase-functions/v2/https';
import {onSchedule} from 'firebase-functions/v2/scheduler';

import App from './App';
import {DecodedIdToken} from 'firebase-admin/auth';
import {callCarAPI} from './v1/Services/Scheduled/callCarAPI';

declare module 'express-serve-static-core' {
  interface Request {
    user?: DecodedIdToken;
  }
}

const config = {region: 'europe-west1', maxInstances: 1, timeoutSeconds: 60};

/**
 * Desk Booking function
 * This instance of the firebase function handles only desk booking and designed to run requests sequencially and on one instance at a time
 * NOTE: Please do not change the function name as the firebase uses the firebase to
 * auto generate http URL i.e. base_url/region/function-name (e.g: baseurl/europe-west1/deskBooking)
 */
exports.deskapi = onRequest(config, App);
/**
 * Car Booking function
 * This instance of the firebase function handles only car booking and designed to run requests sequencially and on one instance at a time
 * NOTE: Please do not change the function name as the firebase uses the firebase to
 * auto generate http URL i.e. base_url/region/function-name (e.g: baseurl/europe-west1/carBooking)
 */
exports.carapi = onRequest(config, App);

/**
 * Utils function
 *  NOTE: Please do not change the function name as the firebase uses the firebase to
 * auto generate http URL i.e. base_url/region/function-name (e.g: baseurl/europe-west1/utils)
 */
exports.api = onRequest(config, App);

/**
 * Scheduled Function - This is run every day so we can call an end point at 9pm to check car spaces are allocated.
 *  NOTE: Please do not change the function name as the firebase uses the firebase to
 * auto generate http URL i.e. base_url/region/function-name (e.g: baseurl/europe-west1/utils)
 */
exports.scheduledFunctionCrontab = onSchedule(
  {
    schedule: '0 21 * * *',
    timeoutSeconds: 240,
    timeZone: 'Europe/London',
    region: 'europe-west1',
  },
  async () => {
    try {
      await callCarAPI();
      console.log('Called car API Successfully');
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  },
);
