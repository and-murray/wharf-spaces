import {
  BookingDeleteRequest,
  BookingPostRequest,
  BookingEditRequest,
  SpaceType,
} from '@customTypes/booking';
import {getTokenID} from '../authentication/FirebaseGoogleAuthentication';
import {Platform} from 'react-native';
import Config from 'react-native-config';
import {REACT_APP_USE_EMULATORS} from '@utils/FirebaseUtils/FirebaseUtils';
import {firebase} from '@react-native-firebase/app-check';
import {LogLevel, logMessage} from '@root/src/util/Logging/Logging';
let baseUrl = Config.REACT_APP_FIREBASE_FUNCTIONS_BASE_URL;
if (!baseUrl) {
  console.error('No firebase url set for environment');
}

const apiVersion = 'v1';

if (REACT_APP_USE_EMULATORS && __DEV__) {
  // To point our dev machines to emulators, comment out if you don't want to use emulator in debug mode.
  if (Platform.OS === 'android') {
    baseUrl = 'http://10.0.2.2:5001/murray-apps-dev/europe-west1/';
  } else {
    baseUrl = 'http://127.0.0.1:5001/murray-apps-dev/europe-west1/';
  }
}

function getURL(spaceType: SpaceType) {
  if (spaceType === SpaceType.desk) {
    return `${baseUrl}deskapi/${apiVersion}/booking`;
  } else {
    return `${baseUrl}carapi/${apiVersion}/booking`;
  }
}

async function getAppCheckToken(): Promise<string> {
  try {
    const token = await firebase.appCheck().getToken();
    return token.token;
  } catch (error) {
    const newError = new Error(`Failed getting app check token ${error}`);
    logMessage(LogLevel.error, newError);
    return 'FAILED_TOKEN';
  }
}

export async function makeBookingRequest(
  spaceType: SpaceType,
  bookingRequest: BookingPostRequest,
) {
  const token = await getTokenID();
  const url = getURL(spaceType);
  const appCheckToken = await getAppCheckToken();
  const options = {
    method: 'POST',
    headers: {
      'X-Firebase-AppCheck': appCheckToken,
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    },
    body: JSON.stringify(bookingRequest),
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
  }
}

export async function makeBookingDeletion(
  spaceType: SpaceType,
  bookingDeleteRequest: BookingDeleteRequest,
) {
  const token = await getTokenID();
  const url = getURL(spaceType);
  const appCheckToken = await getAppCheckToken();
  const options = {
    method: 'DELETE',
    headers: {
      'X-Firebase-AppCheck': appCheckToken,
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    },
    body: JSON.stringify(bookingDeleteRequest),
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
    logMessage(LogLevel.error, error);
    return Promise.reject(error);
  }
}

export async function makeBookingEdit(
  spaceType: SpaceType,
  editBookingRequest: BookingEditRequest,
) {
  const token = await getTokenID();
  const url = getURL(spaceType);
  const appCheckToken = await getAppCheckToken();
  const options = {
    method: 'PATCH',
    headers: {
      'X-Firebase-AppCheck': appCheckToken,
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    },
    body: JSON.stringify(editBookingRequest),
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
    logMessage(LogLevel.error, error);
    return Promise.reject(error);
  }
}

export async function fetchLondonTimeFromServer(): Promise<string> {
  const url = `${baseUrl}api/${apiVersion}/getLondonTime`;
  const appCheckToken = await getAppCheckToken();
  const options = {
    method: 'GET',
    headers: {
      'X-Firebase-AppCheck': appCheckToken,
      'Content-Type': 'application/json',
    },
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
    logMessage(LogLevel.error, error);
    return Promise.reject(error);
  } else {
    const json = await response.json();
    return json.londonServerTime;
  }
}
