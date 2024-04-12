import * as functions from 'firebase-functions';
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

/**
 * Desk Booking function
 * This instance of the firebase function handles only desk booking and designed to run requests sequencially and on one instance at a time
 * NOTE: Please do not change the function name as the firebase uses the firebase to
 * auto generate http URL i.e. base_url/region/function-name (e.g: baseurl/europe-west1/deskBooking)
 */
exports.deskapi = functions
  .region('europe-west1')
  .runWith({
    // Only allow one booking to be made at a time
    maxInstances: 1,
    timeoutSeconds: 60,
  })
  .https.onRequest(App);

/**
 * Car Booking function
 * This instance of the firebase function handles only car booking and designed to run requests sequencially and on one instance at a time
 * NOTE: Please do not change the function name as the firebase uses the firebase to
 * auto generate http URL i.e. base_url/region/function-name (e.g: baseurl/europe-west1/carBooking)
 */
exports.carapi = functions
  .region('europe-west1')
  .runWith({
    // Only allow one booking to be made at a time
    maxInstances: 1,
    timeoutSeconds: 60,
  })
  .https.onRequest(App);

/**
 * Utils function
 *  NOTE: Please do not change the function name as the firebase uses the firebase to
 * auto generate http URL i.e. base_url/region/function-name (e.g: baseurl/europe-west1/utils)
 */
exports.api = functions
  .region('europe-west1')
  .runWith({
    timeoutSeconds: 60,
  })
  .https.onRequest(App);

/**
 * Scheduled Function - This is run every day so we can call an end point at 9pm to check car spaces are allocated.
 *  NOTE: Please do not change the function name as the firebase uses the firebase to
 * auto generate http URL i.e. base_url/region/function-name (e.g: baseurl/europe-west1/utils)
 */
exports.scheduledFunctionCrontab = functions
  .region('europe-west1')
  .pubsub.schedule('0 21 * * *')
  .timeZone('Europe/London')
  .onRun(async () => {
    try {
      await callCarAPI();
      console.log('Called car API Successfully');
    } catch (error) {
      console.log(`Function error ${error}`);
    }
  });
