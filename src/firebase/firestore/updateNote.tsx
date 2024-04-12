import firestore from '@react-native-firebase/firestore';
import {db} from './Database';
import {CollectionName} from './CollectionName';
import {LogLevel, logMessage} from '@root/src/util/Logging/Logging';

export const updateNote = async (
  eventDocumentId: string,
  inputFieldText: string,
) => {
  try {
    db.collection(CollectionName.notes).doc(eventDocumentId).update({
      updatedAt: firestore.FieldValue.serverTimestamp(),
      text: inputFieldText,
    });
  } catch (error) {
    logMessage(LogLevel.error, error);
  }
};
