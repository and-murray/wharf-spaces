import admin from 'firebase-admin';
import type {Request, Response} from 'express';
import {CollectionName} from '../Services/CollectionName';
import {User, Role, BusinessUnit} from '../Models/booking.model';
import { UserRecord } from 'firebase-admin/auth';
import { refreshToken } from 'firebase-admin/app';
import {google} from 'googleapis';

export const createUser = async (req: Request, res: Response) => {
    try {
        console.log('USER');
        console.log(req.user);
        const id = req.user?.uid;
        if (id) {
            console.log('======== GET FIRESTORE USER 1');
            let firestoreUser = await getFirestoreUser(id);
            if (firestoreUser) {
                res.status(200).send(firestoreUser);
            } else {
                console.log('======== GET AUTH USER');
                const user = await admin.auth().getUser(id);
                if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
                    const token = req.headers.authorization.split('Bearer ')[1];
                    console.log('======== CREATE FIRESTORE USER');
                    console.log('==== TOKEN ');
                    console.log(refreshToken);
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
    console.log('============================================== PROVIDER DATA');
    console.log(firebaseUser.providerData);
    organisationData = await getOrganisationData(firebaseUser.providerData[0].uid);
    console.log('====== GOT ORG DATA');
    console.log(organisationData);
    nameData = await getNameData(accessToken);
    console.log('====== GET NAME DATA');
    console.log(nameData);
  } catch (error) {
    throw new Error('Error fetching organisational unit');
  }
  if (organisationData && nameData) {
    let department = BusinessUnit.Enum.murray as string;
     // organisationData.organizations?.[0]?.department?.toLowerCase() ??
     // 'unknown';
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
        businessUnit: businessUnit as BusinessUnit,
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

const SCOPES = [
  'https://www.googleapis.com/auth/contacts',
  'https://www.googleapis.com/auth/contacts.readonly',
  'https://www.googleapis.com/auth/directory.readonly',
  'https://www.googleapis.com/auth/user.addresses.read',
  'https://www.googleapis.com/auth/user.birthday.read',
  'https://www.googleapis.com/auth/user.emails.read',
  'https://www.googleapis.com/auth/user.gender.read',
  'https://www.googleapis.com/auth/user.organization.read',
  'https://www.googleapis.com/auth/user.phonenumbers.read',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/cloud-platform',
];
// The path to the credentials file.
// const filePath = require('/Users/christopher.batin/developer/wharf-spaces/murray-apps-dev-firebase-adminsdk-57gqb-953020e9a4.json');

const getOrganisationData = async (googleId: string) => {
  console.log('=============');
  console.log('ORG DATA START');
  try {
    console.log('GOOGLE ID');
    console.log(googleId);

  //   const auth = await authenticate({
  //   scopes: SCOPES,
  //   keyfilePath: filePath,
  // });
    const auth = new google.auth.GoogleAuth({
      keyFile: '/Users/christopher.batin/developer/wharf-spaces/murray-apps-dev-firebase-adminsdk-57gqb-953020e9a4.json',
      scopes: SCOPES,
    });
    const service = google.people({version: 'v1', auth});
    const personData = await service.people.get({
      resourceName: `people/${googleId}`,
      personFields: 'organizations',
    });
    console.log(`===== PERSON DATA ${JSON.stringify(personData)}`);
    return personData;
  } catch (error) {
    console.log('======= ERROR');
    console.error(error);
    return null;
  }
  // try {
  //   const organisationResponse = await fetch(
  //     'https://people.googleapis.com/v1/people/me?personFields=organizations',
  //     {
  //       method: 'GET',
  //       headers: {
  //         Authorization: `Bearer ${accessToken}`,
  //       },
  //     },
  //   );
  //   if (!organisationResponse.ok) {
  //     console.log('THIS API ERROR');
  //     console.error(JSON.stringify(organisationResponse));
  //     throw new Error(
  //       `API request failed with status ${organisationResponse.status}`,
  //     );
  //   }
  //   return organisationResponse.json();
  // } catch (error) {
  //   console.error(error);
  // }
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
  console.log('DB');
  const db = admin.firestore();
  console.log(`UID ${uid}`);
  const ref = db.collection(CollectionName.users);
  const userDoc = await ref.doc(uid).get();
  console.log('===== USER DOC RETRIEVED');
  if (userDoc.exists) {
    console.log('===== USER DOC EXISTS');
    return User.parse(userDoc.data());
  } else {
    console.log('===== USER DOC DOES NOT EXISTS');
    return undefined;
  }
}
