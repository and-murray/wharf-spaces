import admin from 'firebase-admin';

const getFirestoreServerTimestamp = (): FirebaseFirestore.FieldValue =>
  admin.firestore.FieldValue.serverTimestamp();

export default getFirestoreServerTimestamp;
