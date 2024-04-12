import {FirebaseAuthTypes} from '@react-native-firebase/auth';
import User, {BusinessUnit, Role} from '@customTypes/user';
import {
  signInSilently,
  getAccessTokens,
} from '../../authentication/FirebaseGoogleAuthentication';
import {CollectionName} from '../CollectionName';
import {db} from '../Database';
import getNameData from '../FirestoreUserAPIs/GetNameData/getNameData';
import getOrganisationData from '../FirestoreUserAPIs/GetOrganisationData/getOrganisationData';
import getFirestoreUser from './getFirestoreUser';
import getServerTimestamp from '../firestoreUtils/getServerTimestamp';
import {LogLevel, logMessage} from '@root/src/util/Logging/Logging';

export async function createFirestoreUser(
  firebaseUser: FirebaseAuthTypes.User,
): Promise<User> {
  if (firebaseUser.email === 'demo@example.com') {
    const user: User = {
      id: firebaseUser.uid,
      firstName: 'ANDi',
      lastName: 'Murray',
      email: firebaseUser.email,
      profilePicUrl: '',
      role: Role.demo,
      businessUnit: BusinessUnit.unknown,
      createdAt: getServerTimestamp(),
      updatedAt: getServerTimestamp(),
    };
    return await setUserDoc(user);
  }

  await signInSilently();
  const accessTokens = await getAccessTokens();
  let organisationData;
  let nameData;
  try {
    organisationData = await getOrganisationData(accessTokens.accessToken);
    nameData = await getNameData(accessTokens.accessToken);
  } catch (error) {
    logMessage(LogLevel.error, error);
    throw new Error('Error fetching organisational unit');
  }
  if (organisationData && nameData) {
    let department =
      organisationData.organizations?.[0]?.department?.toLowerCase() ??
      'unknown';
    if ((department as string).includes('tenzing')) {
      department = BusinessUnit.tenzing;
    }
    const businessUnit = Object.values(BusinessUnit).includes(department)
      ? department
      : BusinessUnit.unknown;
    const email = firebaseUser.email;
    if (email) {
      const user: User = {
        id: firebaseUser.uid,
        firstName: nameData.names?.[0].givenName ?? 'ANDi',
        lastName: nameData.names?.[0].familyName ?? 'Murray',
        email: email,
        profilePicUrl: firebaseUser.photoURL ?? '',
        role: Role.user,
        businessUnit: businessUnit,
        createdAt: getServerTimestamp(),
        updatedAt: getServerTimestamp(),
      };
      return await setUserDoc(user);
    } else {
      throw new Error('Missing email or key information');
    }
  } else {
    throw new Error('Permissions of user incorrect');
  }
}

const setUserDoc = async (user: User): Promise<User> => {
  try {
    await db.collection(CollectionName.users).doc(user.id).set(user);
    const reduxUser = await getFirestoreUser(user.id);
    if (!reduxUser) {
      throw new Error('User should now exist');
    }
    return reduxUser;
  } catch (error) {
    const newError = new Error(`Failed to set user: ${error}`);
    logMessage(LogLevel.error, newError);
    throw newError;
  }
};
