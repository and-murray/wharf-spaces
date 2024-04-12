import {db} from '@firebase/firestore/Database';
import firestore from '@react-native-firebase/firestore';
import {CollectionName} from '@firebase/firestore/CollectionName';

export const removeToken = (userId: string, currentToken: string) =>
  db
    .collection(CollectionName.users)
    .doc(userId)
    .update({
      tokens: firestore.FieldValue.arrayRemove(currentToken),
    });

export const addToken = (userId: string, currentToken: string) =>
  db
    .collection(CollectionName.users)
    .doc(userId)
    .update({
      tokens: firestore.FieldValue.arrayUnion(currentToken),
    });
