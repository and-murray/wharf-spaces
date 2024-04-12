import {combineReducers, configureStore} from '@reduxjs/toolkit';
import remoteConfigSlice from './reducers/RemoteConfigSlice';
import userSlice from './reducers/UserSlice';
import selectedDaySlice from './reducers/selectedDayOptionsSlice';
import noteSlice from './reducers/NoteSlice';
import loadingSlice from './reducers/LoadingSlice';
import errorSlice from './reducers/ErrorSlice';
import utilsSlice from './reducers/UtilsSlice';
import splashScreenReducer from './reducers/SplashScreenReducer';

const rootReducer = combineReducers({
  firebaseRemoteConfig: remoteConfigSlice,
  user: userSlice,
  selectedDayOptions: selectedDaySlice,
  note: noteSlice,
  loading: loadingSlice,
  error: errorSlice,
  utils: utilsSlice,
  splashScreen: splashScreenReducer,
});

export const setupStore = (preloadedState?: Partial<RootState>) =>
  configureStore({
    reducer: rootReducer,
    preloadedState,
  });

export const store = setupStore();

export type AppStore = ReturnType<typeof setupStore>;
export type RootState = ReturnType<typeof rootReducer>;
export type RootAction = typeof store.dispatch;

export default store;
