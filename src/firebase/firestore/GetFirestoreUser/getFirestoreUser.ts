import User from '@customTypes/user';
import {db} from '../Database';
import {CollectionName} from '../CollectionName';

async function getFirestoreUser(uid: string): Promise<User | undefined> {
  const userDoc = await db.collection(CollectionName.users).doc(uid).get();
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
