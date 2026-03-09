import type {Request, Response} from 'express';
import {User, Role, BusinessUnit} from '../Models/booking.model';
import {DecodedIdToken} from 'firebase-admin/auth';
import {getFirestoreUser, createFirestoreUser} from '../Services/FirebaseAdminService/firestoreUser';
import {getPersonData} from '../Services/GoogleAPI/getPersonData';
import getFirestoreServerTimestamp from '../utils/FirebaseUtils/FirestoreTimestamp';

export const createUser = async (req: Request, res: Response) => {
  const user = req.user;
  if (user) {
    try {
      const firestoreUser = await getFirestoreUser(user.uid);
      res.status(200).send(JSON.stringify(firestoreUser));
    } catch {
      try {
        const googleAccessToken = req.headers['google-access-token']?.toString() ?? '';
        if (googleAccessToken.length > 0) {
          const firestoreUser = await getUserInfoAndCreate(user, googleAccessToken);
          res.status(200).send(JSON.stringify(firestoreUser));
        } else {
          res.status(400).send('No google access token');
        }
      } catch (error) {
        res.status(500).send(error);
      }
    }
  } else {
    res.status(400).send('No user found');
  }
};

async function getUserInfoAndCreate(
  firebaseUser: DecodedIdToken,
  token: string
): Promise<User> {
  const email = firebaseUser.email;
  if (!email) {
    throw new Error('Missing email or key information');
  }
  if (email === 'demo@example.com') {
    const user: User = {
      id: firebaseUser.uid,
      firstName: 'ANDi',
      lastName: 'Murray',
      email: email,
      profilePicUrl: '',
      role: Role.Enum.demo,
      businessUnit: BusinessUnit.Enum.unknown,
      createdAt: getFirestoreServerTimestamp(),
      updatedAt: getFirestoreServerTimestamp(),
    };
    return await createFirestoreUser(user);
  }
  let personData;
  try {
    personData = await getPersonData(token);
  } catch (error) {
    console.error(error);
    throw error;
  }
  if (personData) {
    const department = personData.organizations?.[0]?.department?.toLowerCase() ?? 'unknown';
    let businessUnit: BusinessUnit = BusinessUnit.Enum.unknown;
    if ((department as string).includes('murray')) {
      businessUnit = BusinessUnit.Enum.murray;
    } else if ((department as string).includes('tenzing')) {
      businessUnit = BusinessUnit.Enum.tenzing;
    } else if ((department as string).includes('adams')) {
      businessUnit = BusinessUnit.Enum.adams;
    } else if ((department as string).includes('vaughan')) {
      businessUnit = BusinessUnit.Enum.adams;
    }
    const user: User = {
      id: firebaseUser.uid,
      firstName: personData.names?.[0].givenName ?? 'ANDi',
      lastName: personData.names?.[0].familyName ?? 'Murray',
      email: email,
      profilePicUrl: firebaseUser.picture ?? '',
      role: Role.Enum.user,
      businessUnit: businessUnit,
      createdAt: getFirestoreServerTimestamp(),
      updatedAt: getFirestoreServerTimestamp(),
    };
    return await createFirestoreUser(user);
  } else {
    throw new Error('Permissions of user incorrect');
  }
}

export default createUser;
