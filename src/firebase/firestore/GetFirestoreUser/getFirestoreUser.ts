import User from '@customTypes/user';
import {CollectionName} from '../CollectionName';
import {db} from '../DatabaseV2';
import {doc, getDoc} from '@react-native-firebase/firestore';

async function getFirestoreUser(uid: string): Promise<User | undefined> {
  const docRef = doc(db, CollectionName.users, uid);
  const userDoc = await getDoc(docRef);
  if (userDoc.exists()) {
    const userData = userDoc.data() as User;
    return {
      ...userData,
      updatedAt: {...userData.updatedAt},
      createdAt: {...userData.createdAt},
    } as User;
  } else {
    return undefined;
  }
}

export default getFirestoreUser;
