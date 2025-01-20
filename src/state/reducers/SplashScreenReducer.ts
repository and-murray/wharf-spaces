import {createSlice} from '@reduxjs/toolkit';
import {fetchRemoteConfig} from './RemoteConfigSlice';

export type SplashScreenState = {
  hideSplashScreen: boolean;
  remoteConfigFound: boolean;
  screensLoaded: boolean;
};

const initialState: SplashScreenState = {
  hideSplashScreen: false,
  remoteConfigFound: false,
  screensLoaded: false,
};

export const splashScreenSlice = createSlice({
  name: 'SplashScreen',
  initialState: initialState,
  reducers: {
    screensLoaded: (state, action) => {
      state.screensLoaded = action.payload;
      state.hideSplashScreen = action.payload && state.remoteConfigFound;
    },
  },
  extraReducers(builder) {
    builder.addCase(fetchRemoteConfig.fulfilled, (state, {}) => {
      state.remoteConfigFound = true;
      state.hideSplashScreen = state.remoteConfigFound && state.screensLoaded;
    });
  },
});

export const {screensLoaded} = splashScreenSlice.actions;
export default splashScreenSlice.reducer;
