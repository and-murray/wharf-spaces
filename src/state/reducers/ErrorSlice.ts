import {createSlice} from '@reduxjs/toolkit';

export type ErrorState = {
  showError: boolean;
};

const initialState: ErrorState = {
  showError: false,
};

export const errorSlice = createSlice({
  name: 'Error',
  initialState: initialState,
  reducers: {
    setShowError: (state, action) => {
      state.showError = action.payload;
    },
  },
});

export const {setShowError} = errorSlice.actions;
export default errorSlice.reducer;
