import admin from 'firebase-admin';
import {CollectionName} from '../CollectionName';
import {User} from '../../Models/booking.model';

export async function getFirestoreUser(uid: string): Promise<User> {
  const db = admin.firestore();
  const ref = db.collection(CollectionName.users);
  const userDoc = await ref.doc(uid).get();
  if (userDoc.exists) {
    return User.parse(userDoc.data());
  } else {
    throw new Error('User does not exist');
  }
}

export async function createFirestoreUser(user: User): Promise<User> {
  const db = admin.firestore();
  await db.collection(CollectionName.users).doc(user.id).set(user);
  return user;
}
