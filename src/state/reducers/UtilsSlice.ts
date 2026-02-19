import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {fetchLondonTimeFromServer} from '@root/src/firebase/functions/functions';
import {DateFormat} from '@root/src/util/DateTimeUtils/DateTimeUtils';
import dayjs from 'dayjs';
import {FirebaseRemoteConfigState} from './RemoteConfigSlice';

export type UtilsState = {
  londonServerTimestamp?: string;
  storedDeviceTimestamp?: string; // Mark the device time when the londonServerTime is received
};

const initialState: UtilsState = {
  londonServerTimestamp: undefined,
  storedDeviceTimestamp: undefined,
};

export const fetchLondonTime = createAsyncThunk(
  'londonTime/get',
  async (_, thunkAPI) => {
    const appState = thunkAPI.getState();
    const {firebaseRemoteConfig} = appState as {
      firebaseRemoteConfig: FirebaseRemoteConfigState;
    };
    return await fetchLondonTimeFromServer(firebaseRemoteConfig.endpoints);
  },
);

export const utilsSlice = createSlice({
  name: 'Utils',
  initialState: initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(fetchLondonTime.fulfilled, (state, {payload}) => {
      state.londonServerTimestamp = payload;
      state.storedDeviceTimestamp = dayjs().format(
        DateFormat.londonServerTimestampFormat,
      );
    });
  },
});

export default utilsSlice.reducer;
