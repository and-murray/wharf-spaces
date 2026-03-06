import User from '@customTypes/user';
import {FirebaseAuthTypes} from '@react-native-firebase/auth';
import getFirestoreUser from './getFirestoreUser';
import {createUser} from '@firebase/api/createUser';
import {LogLevel, logMessage} from '@utils/Logging/Logging';
import {Endpoints} from '@customTypes/Endpoints';

export async function getUser(
  firebaseUser: FirebaseAuthTypes.User,
  endpoints: Endpoints
): Promise<User> {
  try {
    const user = await getFirestoreUser(firebaseUser.uid);
    if (!user) {
      return createUser(endpoints);
    } else {
      return user;
    }
  } catch (error) {
    logMessage(LogLevel.error, error);
    throw new Error('error');
  }
}
