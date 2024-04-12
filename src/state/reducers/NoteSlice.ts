import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import getNotesCollection from '@firebase/firestore/getNotesCollection';
import {Note} from '@customTypes/notes';

export type NoteState = {
  notes: Note[];
};

const initialState: NoteState = {
  notes: [],
};

export const fetchNotes = createAsyncThunk(
  'notes/get',
  async (day: string) => await getNotesCollection(day),
);

export const noteSlice = createSlice({
  name: 'Notes',
  initialState: initialState,
  reducers: {
    setNotes: (state, action) => {
      state.notes = action.payload;
    },
  },
  extraReducers(builder) {
    builder.addCase(fetchNotes.fulfilled, (state, {payload}) => {
      state.notes = payload;
    });
  },
});

export const {setNotes} = noteSlice.actions;
export default noteSlice.reducer;
