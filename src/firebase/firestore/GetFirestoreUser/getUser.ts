import User from '@customTypes/user';
import {FirebaseAuthTypes} from '@react-native-firebase/auth';
import getFirestoreUser from './getFirestoreUser';
import {createFirestoreUser} from './createFirestoreUser';
import {LogLevel, logMessage} from '@root/src/util/Logging/Logging';

export async function getUser(
  firebaseUser: FirebaseAuthTypes.User,
): Promise<User> {
  try {
    const user = await getFirestoreUser(firebaseUser.uid);
    if (!user) {
      return createFirestoreUser(firebaseUser);
    } else {
      return user;
    }
  } catch (error) {
    logMessage(LogLevel.error, error);
    throw new Error('error');
  }
}
