import {db} from './Database';
import {Note} from '@customTypes/notes';
import {CollectionName} from './CollectionName';
import {RootAction} from '@state/store';
import {setNotes} from '@state/reducers/NoteSlice';

const subscribeToNotesCollection = (day: string, dispatch: RootAction) => {
  const unsubscribe = db
    .collection(CollectionName.notes)
    .where('date', '==', day)
    .onSnapshot(snapshot => {
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
      dispatch(setNotes(notes));
    });
  return unsubscribe;
};

export default subscribeToNotesCollection;
