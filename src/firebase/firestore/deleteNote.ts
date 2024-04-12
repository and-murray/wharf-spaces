import {db} from './Database';
import {CollectionName} from './CollectionName';
import {LogLevel, logMessage} from '@root/src/util/Logging/Logging';

export const deleteNote = async (eventDocumentId: string) => {
  try {
    db.collection(CollectionName.notes).doc(eventDocumentId).delete();
  } catch (error) {
    logMessage(LogLevel.error, error);
  }
};
