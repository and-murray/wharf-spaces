import {
  BookingDeleteRequest,
  BookingPostRequest,
  BookingEditRequest,
  SpaceType,
} from '@customTypes/booking';
import {getTokenID} from '../authentication/FirebaseGoogleAuthentication';
import {firebase} from '@react-native-firebase/app-check';
import {LogLevel, logMessage} from '@root/src/util/Logging/Logging';
import {Endpoints} from '@root/src/types/Endpoints';

function getURL(spaceType: SpaceType, endpoints: Endpoints) {
  if (spaceType === SpaceType.desk) {
    return endpoints.deskAPIURL;
  } else {
    return endpoints.carAPIURL;
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
  endpoints: Endpoints,
) {
  const token = await getTokenID();
  const url = getURL(spaceType, endpoints);
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
  return Promise.resolve();
}

export async function makeBookingDeletion(
  spaceType: SpaceType,
  bookingDeleteRequest: BookingDeleteRequest,
  endpoints: Endpoints,
) {
  const token = await getTokenID();
  const url = getURL(spaceType, endpoints);
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
  return Promise.resolve();
}

export async function makeBookingEdit(
  spaceType: SpaceType,
  editBookingRequest: BookingEditRequest,
  endpoints: Endpoints,
) {
  const token = await getTokenID();
  const url = getURL(spaceType, endpoints);
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
  return Promise.resolve();
}

export async function fetchLondonTimeFromServer(
  endpoints: Endpoints,
): Promise<string> {
  const url = `${endpoints.genericAPIURL}/v1/getLondonTime`;
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
