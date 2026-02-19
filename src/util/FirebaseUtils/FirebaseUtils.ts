import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';
import {Booking, ReducedUserData} from '@customTypes';
import {chunk} from '@utils/ArrayUtils/ArrayUtils';
import {
  FirebaseAppCheckTypes,
  firebase,
} from '@react-native-firebase/app-check';
import {getBundleId} from 'react-native-device-info';
import {LogLevel, logMessage} from '../Logging/Logging';

export const REACT_APP_USE_EMULATORS = false;

export async function chunkQuery<M>(
  docRef: FirebaseFirestoreTypes.CollectionReference,
  field: string | FirebaseFirestore.FieldPath,
  values: Array<string>,
) {
  const querySections = await Promise.all(
    chunk(values, 10).map(chunkedArray => {
      return docRef.where(field, 'in', chunkedArray).get();
    }),
  );
  return querySections
    .flatMap(querySection => querySection.docs)
    .map(documentData => documentData.data() as M);
}

export function calculateNewUserIds(
  bookings: Booking[],
  existingUserData: ReducedUserData,
): string[] {
  const userIds = bookings.map(booking => booking.userId);
  if (userIds.length === 0) {
    return [];
  }
  const uniqueIds = [...Object.keys(existingUserData)];
  const idsToFetch = userIds.filter(id => !uniqueIds.includes(id));
  return idsToFetch;
}

function androidProvider(): FirebaseAppCheckTypes.ReactNativeFirebaseAppCheckProviderAndroidOptions {
  const bundle = getBundleId();
  if (__DEV__ || bundle === 'digital.and.murrayapps.development') {
    return {
      provider: 'debug',
      debugToken: '5D8D570F-23AB-42D3-BD98-1691A9F70717',
    };
  }
  return {provider: 'playIntegrity'};
}
/**
 * Returns true if a valid app
 */
export async function checkAppIntegrity(): Promise<boolean> {
  const rnfbProvider = firebase
    .appCheck()
    .newReactNativeFirebaseAppCheckProvider();
  rnfbProvider.configure({
    android: androidProvider(),
    apple: {
      provider: __DEV__ ? 'debug' : 'appAttestWithDeviceCheckFallback',
      debugToken: '76E651C0-48DB-484F-BD81-3BE40674E38F',
    },
  });
  await firebase.appCheck().initializeAppCheck({
    provider: rnfbProvider,
    isTokenAutoRefreshEnabled: true,
  });
  const attemptCount = 0;
  do {
    try {
      const {token} = await firebase.appCheck().getToken(true);
      if (token.length > 0) {
        console.log('AppCheck verification passed');
      }
      return true;
    } catch (error) {
      const newError = new Error(
        `AppCheck verification failed with error: ${error}`,
      );
      logMessage(LogLevel.error, newError);
    }
  } while (attemptCount < 2);
  return false;
}
