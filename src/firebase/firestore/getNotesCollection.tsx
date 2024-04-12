import {db} from './Database';
import {Note} from '@customTypes/notes';
import {CollectionName} from './CollectionName';

const getNotesCollection = async (day: string): Promise<Note[]> => {
  const snapshot = await db
    .collection(CollectionName.notes)
    .where('date', '==', day)
    .get();
  const notes = snapshot.docs.map(doc => {
    const note = doc.data() as Note;
    const noteObject = {
      ...note,
      updatedAt: {
        ...note.updatedAt,
      },
      createdAt: {
        ...note.createdAt,
      },
    };
    return noteObject as Note;
  });
  return notes;
};

export default getNotesCollection;
