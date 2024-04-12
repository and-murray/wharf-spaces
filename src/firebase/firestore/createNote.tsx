import firestore from '@react-native-firebase/firestore';
import {Note} from '@customTypes/notes';
import {CollectionName} from './CollectionName';
import {db} from './Database';
import {LogLevel, logMessage} from '@root/src/util/Logging/Logging';

export const createNote = async (
  inputFieldText: string,
  selectedDate: string,
  uniqueId: string,
) => {
  const newNote: Note = {
    createdAt: firestore.FieldValue.serverTimestamp(),
    updatedAt: firestore.FieldValue.serverTimestamp(),
    text: inputFieldText,
    date: selectedDate,
    isClubhouseClosed: false,
    uuid: uniqueId,
  };

  try {
    db.collection(CollectionName.notes).doc(uniqueId).set(newNote);
  } catch (error) {
    logMessage(LogLevel.error, error);
  }
};
