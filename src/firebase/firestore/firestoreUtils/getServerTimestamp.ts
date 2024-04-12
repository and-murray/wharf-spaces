import firebase from '@react-native-firebase/firestore';

const getServerTimestamp = (): FirebaseFirestore.FieldValue =>
  firebase.FieldValue.serverTimestamp();

export default getServerTimestamp;
