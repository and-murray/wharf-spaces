import {createSlice} from '@reduxjs/toolkit';

export type LoadingState = {
  isLoading: boolean;
};

const initialState: LoadingState = {
  isLoading: false,
};

export const loadingSlice = createSlice({
  name: 'Loading',
  initialState: initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const {setLoading} = loadingSlice.actions;
export default loadingSlice.reducer;
