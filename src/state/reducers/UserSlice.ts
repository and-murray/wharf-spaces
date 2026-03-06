import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {User} from '@customTypes';
import {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {getUser} from '@firebase/firestore/GetFirestoreUser/getUser';
import {signOut} from '@firebase/authentication/FirebaseGoogleAuthentication';
import {FirebaseRemoteConfigState} from './RemoteConfigSlice';

export type UserState = {
  user?: User;
  activeBookingDates: string[];
};

const initialState: UserState = {
  user: undefined,
  activeBookingDates: [],
};

export const fetchUser = createAsyncThunk(
  'user/get',
  async (firebaseUser: FirebaseAuthTypes.User, thunkAPI): Promise<User | undefined> => {
    const appState = thunkAPI.getState();
    const {firebaseRemoteConfig} = appState as {
      firebaseRemoteConfig: FirebaseRemoteConfigState;
    };
    return await getUser(firebaseUser, firebaseRemoteConfig.endpoints);
  }
);

export const userSlice = createSlice({
  name: 'User',
  initialState: initialState,
  reducers: {
    setUser: (state, {payload}: PayloadAction<User>) => {
      state.user = payload;
    },
    clearUser: state => {
      signOut();
      state.user = undefined;
    },
    setActiveBookingDates: (state, {payload}: PayloadAction<string[]>) => {
      state.activeBookingDates = payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchUser.fulfilled, (state, {payload}) => {
        if (payload) {
          state.user = payload;
        } else {
          signOut();
          state.user = undefined;
        }
      })
      .addCase(fetchUser.rejected, (state, {}) => {
        signOut();
        state.user = undefined;
      });
  },
});

export const {
  setUser,
  clearUser,
  setActiveBookingDates: setActiveBookingDates,
} = userSlice.actions;

export default userSlice.reducer;
