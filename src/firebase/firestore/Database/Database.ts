import firestore from '@react-native-firebase/firestore';
import {REACT_APP_USE_EMULATORS} from '@utils/FirebaseUtils/FirebaseUtils';
import {Platform} from 'react-native';

const db = firestore();

// You will need to delete the app and reinstall it.
if (REACT_APP_USE_EMULATORS && __DEV__) {
  if (Platform.OS === 'android') {
    db.useEmulator('10.0.2.2', 8080);
  } else {
    db.useEmulator('localhost', 8080);
  }
}

export default db;
