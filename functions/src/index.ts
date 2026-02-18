import {onRequest} from 'firebase-functions/v2/https';
import {onSchedule} from 'firebase-functions/v2/scheduler';
const functions = require('firebase-functions/v1');
import App from './App';
import {DecodedIdToken} from 'firebase-admin/auth';
import {callCarAPI} from './v1/Services/Scheduled/callCarAPI';

declare global {
  namespace Express {
    export interface Request {
      user?: DecodedIdToken;
    }
  }
}

const config = {region: 'europe-west1', maxInstances: 1, timeoutSeconds: 60};

/**
 * Desk Booking function
 * This instance of the firebase function handles only desk booking and designed to run requests sequencially and on one instance at a time
 * NOTE: Please do not change the function name as the firebase uses the firebase to
 * auto generate http URL i.e. base_url/region/function-name (e.g: baseurl/europe-west1/deskBooking)
 */
// GEN 1 Function to be removed after migration
exports.deskapi = functions
  .region('europe-west1')
  .runWith({
    // Only allow one booking to be made at a time
    maxInstances: 1,
    timeoutSeconds: 60,
  })
  .https.onRequest(App);
// GEN 2 Function to stay after migration
exports.deskapiGen2 = onRequest(config, App);

/**
 * Car Booking function
 * This instance of the firebase function handles only car booking and designed to run requests sequencially and on one instance at a time
 * NOTE: Please do not change the function name as the firebase uses the firebase to
 * auto generate http URL i.e. base_url/region/function-name (e.g: baseurl/europe-west1/carBooking)
 */
// GEN 1 Function to be removed after migration
exports.carapi = functions
  .region('europe-west1')
  .runWith({
    // Only allow one booking to be made at a time
    maxInstances: 1,
    timeoutSeconds: 60,
  })
  .https.onRequest(App);
// GEN 2 Function to stay after migration
exports.carapiGen2 = onRequest(config, App);

/**
 * Utils function
 *  NOTE: Please do not change the function name as the firebase uses the firebase to
 * auto generate http URL i.e. base_url/region/function-name (e.g: baseurl/europe-west1/utils)
 */
// GEN 1 Function to be removed after migration
exports.api = functions
  .region('europe-west1')
  .runWith({
    timeoutSeconds: 60,
  })
  .https.onRequest(App);
// GEN 2 Function to stay after migration
exports.apiGen2 = onRequest(config, App);

/**
 * Scheduled Function - This is run every day so we can call an end point at 9pm to check car spaces are allocated.
 *  NOTE: Please do not change the function name as the firebase uses the firebase to
 * auto generate http URL i.e. base_url/region/function-name (e.g: baseurl/europe-west1/utils)
 */
// GEN 1 Function to be removed after migration
exports.scheduledFunctionCrontab = functions
  .region('europe-west1')
  .runWith({
    timeoutSeconds: 240,
  })
  .pubsub.schedule('0 21 * * *')
  .timeZone('Europe/London')
  .onRun(async () => {
    try {
      await callCarAPI();
      console.log('Called car API Successfully');
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  });
// GEN 2 Function to stay after migration
exports.scheduledFunctionCrontabGen2 = onSchedule(
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
