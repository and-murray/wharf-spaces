import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {fetchLondonTimeFromServer} from '@root/src/firebase/functions/functions';
import {DateFormat} from '@root/src/util/DateTimeUtils/DateTimeUtils';
import dayjs from 'dayjs';

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
  async () => await fetchLondonTimeFromServer(),
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
