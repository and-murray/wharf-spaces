import admin from 'firebase-admin';
import type {Request, Response} from 'express';
import {CollectionName} from '../Services/CollectionName';
import {User, Role, BusinessUnit} from '../Models/booking.model';
import { UserRecord } from 'firebase-admin/auth';

export const createUser = async (req: Request, res: Response) => {
    try {
        console.log('USER');
        console.log(req.user);
        const id = req.user?.uid;
        if (id) {
            let firestoreUser = await getFirestoreUser(id);
            if (firestoreUser) {
                res.status(200).send(firestoreUser);
            } else {
                const user = await admin.auth().getUser(id);
                if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
                    const token = req.headers.authorization.split('Bearer ')[1];
                    firestoreUser = await createFirestoreUser(user, token);
                    await setUserDoc(firestoreUser);
                } else {
                    res.status(500).send();
                }
            }
        }
    } catch (error) {
        res.status(500).send(JSON.stringify(error));
    }
};

async function createFirestoreUser(
  firebaseUser: UserRecord,
  accessToken: string
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

//   await signInSilently();
//   const accessTokens = await getAccessTokens();
  let organisationData;
  let nameData;
  try {
    organisationData = await getOrganisationData(accessToken);
    nameData = await getNameData(accessToken);
  } catch (error) {
    throw new Error('Error fetching organisational unit');
  }
  if (organisationData && nameData) {
    let department =
      organisationData.organizations?.[0]?.department?.toLowerCase() ??
      'unknown';
    if ((department as string).includes('tenzing')) {
      department = BusinessUnit.Enum.tenzing;
    } else if ((department as string).includes('adams')) {
      department = BusinessUnit.Enum.adams;
    } else if ((department as string).includes('vaughan')) {
      department = BusinessUnit.Enum.adams;
    }
    const businessUnit = Object.values(BusinessUnit).includes(department)
      ? department
      : BusinessUnit.Enum.unknown;
    const email = firebaseUser.email;
    if (email) {
      const user: User = {
        id: firebaseUser.uid,
        firstName: nameData.names?.[0].givenName ?? 'ANDi',
        lastName: nameData.names?.[0].familyName ?? 'Murray',
        email: email,
        profilePicUrl: firebaseUser.photoURL ?? '',
        role: Role.Enum.user,
        businessUnit: businessUnit,
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
export default createUser;

const getOrganisationData = async (accessToken: string) => {
  const organisationResponse = await fetch(
    'https://people.googleapis.com/v1/people/me?personFields=organizations',
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  if (!organisationResponse.ok) {
    throw new Error(
      `API request failed with status ${organisationResponse.status}`,
    );
  }
  return organisationResponse.json();
};

const getNameData = async (accessToken: string) => {
  const nameResponse = await fetch(
    'https://people.googleapis.com/v1/people/me?personFields=names',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  if (!nameResponse.ok) {
    throw new Error(`API request failed with status ${nameResponse.status}`);
  }
  return nameResponse.json();
};

async function getFirestoreUser(uid: string): Promise<User | undefined> {
  const db = admin.firestore();
  const ref = db.collection(CollectionName.users);
  const userDoc = await ref.doc(uid).get();
  if (userDoc) {
    return User.parse(userDoc.data());
  } else {
    return undefined;
  }
}
