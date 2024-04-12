import {firestore} from 'firebase-admin';
import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';

export type Note = {
  createdAt: firestore.Timestamp | FirebaseFirestoreTypes.FieldValue;
  updatedAt: firestore.Timestamp | FirebaseFirestoreTypes.FieldValue;
  text: string;
  date: string;
  isClubhouseClosed: boolean;
  uuid: string;
};
