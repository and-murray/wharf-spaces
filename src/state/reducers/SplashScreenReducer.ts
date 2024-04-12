import {createSlice} from '@reduxjs/toolkit';

export type SplashScreenState = {
  hideSplashScreen: boolean;
};

const initialState: SplashScreenState = {
  hideSplashScreen: false,
};

export const splashScreenSlice = createSlice({
  name: 'SplashScreen',
  initialState: initialState,
  reducers: {
    hideSplashScreen: (state, action) => {
      state.hideSplashScreen = action.payload;
    },
  },
});

export const {hideSplashScreen} = splashScreenSlice.actions;
export default splashScreenSlice.reducer;
