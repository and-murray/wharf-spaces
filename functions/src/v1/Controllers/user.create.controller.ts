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
        const googleAccessToken = req.headersDistinct['x-google-access-token'] ?? '';
        if (googleAccessToken.length > 0 && googleAccessToken[0]) {
          const firestoreUser = await getUserInfoAndCreate(user, googleAccessToken[0]);
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
  console.log('GOT TO HERE 1');
  console.log(firebaseUser.email);
  if (firebaseUser.email === 'demo@example.com') {
    console.log('GOT TO HERE 2');
    const user: User = {
      id: firebaseUser.uid,
      firstName: 'ANDi',
      lastName: 'Murray',
      email: firebaseUser.email,
      profilePicUrl: '',
      role: Role.Enum.demo,
      businessUnit: BusinessUnit.Enum.unknown,
      createdAt: getFirestoreServerTimestamp(),
      updatedAt: getFirestoreServerTimestamp(),
    };
    console.log('GOT TO HERE 3');
    return await createFirestoreUser(user);
  }

  let personData;
  try {
    personData = await getPersonData(token);
  } catch (error) {
    throw error;
  }
  if (personData) {
    let department: BusinessUnit = BusinessUnit.Enum.murray;
    personData.organizations?.[0]?.department?.toLowerCase() ?? 'unknown';
    if ((department as string).includes('tenzing')) {
      department = BusinessUnit.Enum.tenzing;
    } else if ((department as string).includes('adams')) {
      department = BusinessUnit.Enum.adams;
    } else if ((department as string).includes('vaughan')) {
      department = BusinessUnit.Enum.adams;
    }
    const email = firebaseUser.email;
    if (email) {
      const user: User = {
        id: firebaseUser.uid,
        firstName: personData.names?.[0].givenName ?? 'ANDi',
        lastName: personData.names?.[0].familyName ?? 'Murray',
        email: email,
        profilePicUrl: firebaseUser.picture ?? '',
        role: Role.Enum.user,
        businessUnit: department as BusinessUnit,
        createdAt: getFirestoreServerTimestamp(),
        updatedAt: getFirestoreServerTimestamp(),
      };
      return await createFirestoreUser(user);
    } else {
      throw new Error('Missing email or key information');
    }
  } else {
    throw new Error('Permissions of user incorrect');
  }
}

export default createUser;
