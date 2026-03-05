import User from '@customTypes/user';
import {FirebaseAuthTypes} from '@react-native-firebase/auth';
import getFirestoreUser from './getFirestoreUser';
import {createUser} from '@root/src/firebase/functions/createUser';
import {LogLevel, logMessage} from '@root/src/util/Logging/Logging';
import {Endpoints} from '@root/src/types/Endpoints';
import {getAppCheckToken} from '@root/src/firebase/functions/functions';
import {getAccessTokens, signInSilently} from '@root/src/firebase/authentication/FirebaseGoogleAuthentication';

export async function getUser(
  firebaseUser: FirebaseAuthTypes.User,
  endpoints: Endpoints
): Promise<User> {
  try {
    const user = await getFirestoreUser(firebaseUser.uid);
    if (!user) {
      await signInSilently();
      const appCheckToken = await getAppCheckToken();
      const accessTokens = await getAccessTokens();
      const bearerTokens = await firebaseUser.getIdToken();
      return createUser(endpoints, appCheckToken, accessTokens.accessToken, bearerTokens);
    } else {
      return user;
    }
  } catch (error) {
    logMessage(LogLevel.error, error);
    throw new Error('error');
  }
}
