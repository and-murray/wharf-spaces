import admin from 'firebase-admin';
import type {Request, Response} from 'express';
import {CollectionName} from '../Services/CollectionName';
import {User, Role, BusinessUnit} from '../Models/booking.model';
import {DecodedIdToken} from 'firebase-admin/auth';
import {people_v1} from 'googleapis';
import {getFirestoreUser} from '../Services/FirebaseAdminService/getFirestoreUser';

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
          const firestoreUser = await createFirestoreUser(user, googleAccessToken[0]);
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

async function createFirestoreUser(
  firebaseUser: DecodedIdToken,
  token: string
): Promise<User> {
  if (firebaseUser.email === 'demo@example.com') {
    const user: User = {
      id: firebaseUser.uid,
      firstName: 'ANDi',
      lastName: 'Murray',
      email: firebaseUser.email,
      profilePicUrl: '',
      role: Role.Enum.demo,
      businessUnit: BusinessUnit.Enum.unknown,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    };
    return await setUserDoc(user);
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
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
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
    const db = admin.firestore();
    await db.collection(CollectionName.users).doc(user.id).set(user);
    const firestoreUser = await getFirestoreUser(user.id);
    if (firestoreUser) {
        return firestoreUser;
    } else {
        throw Error();
    }
};

const getPersonData = async (token: string): Promise<people_v1.Schema$Person | undefined> => {
  try {
    const organisationResponse = await fetch(
      'https://people.googleapis.com/v1/people/me?personFields=organizations,names',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (!organisationResponse.ok) {
      throw new Error(
        `API request failed with status ${organisationResponse.status}`,
      );
    }
    return organisationResponse.json() as people_v1.Schema$Person;
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

export default createUser;
