import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {
  makeBookingDeletion,
  makeBookingRequest,
  makeBookingEdit,
} from '@firebase/functions/functions';
import {
  formatToBookingDateUTC,
  getTodaysUTCDateMidnightString,
} from '@utils/DateTimeUtils/DateTimeUtils';
import dayjs from 'dayjs';
import {
  BookingPostRequest,
  BookingType,
  EditBooking,
  SpaceType,
  TimeSlot,
} from '@customTypes/booking';
import {setShowError} from './ErrorSlice';

type SelectedOptionsState = {
  selectedDay: string;
  selectedSpaceType: SpaceType;
};

const initialState: SelectedOptionsState = {
  selectedDay: getTodaysUTCDateMidnightString(),
  selectedSpaceType: SpaceType.desk,
};

type PostBookingArgs = {
  selectedDay: string;
  userId: string;
  timeSlot: TimeSlot;
  spaceType: SpaceType;
  bookingType: BookingType;
  numberOfBookings: number;
};

export const deleteBookings = createAsyncThunk(
  'bookings/delete',
  async (bookingIds: string[], thunkAPI) => {
    const appState = thunkAPI.getState();
    const {selectedDayOptions} = appState as {
      selectedDayOptions: SelectedOptionsState;
    };
    await makeBookingDeletion(selectedDayOptions.selectedSpaceType, {
      bookingIds,
    }).catch(() => thunkAPI.dispatch(setShowError(true)));
  },
);

export const editBookings = createAsyncThunk(
  'bookings/edit',
  async (bookings: EditBooking[], thunkAPI) => {
    const appState = thunkAPI.getState();
    const {selectedDayOptions} = appState as {
      selectedDayOptions: SelectedOptionsState;
    };
    await makeBookingEdit(selectedDayOptions.selectedSpaceType, {
      bookings: bookings,
    }).catch(() => thunkAPI.dispatch(setShowError(true)));
  },
);

export const postBookings = createAsyncThunk(
  'bookings/post',
  async (
    {
      selectedDay,
      userId,
      timeSlot,
      spaceType,
      bookingType,
      numberOfBookings,
    }: PostBookingArgs,
    thunkAPI,
  ) => {
    const appState = thunkAPI.getState();
    const bookings = [];
    const date = formatToBookingDateUTC(dayjs(selectedDay), false);
    for (let i = 0; i < numberOfBookings; i++) {
      bookings.push({
        date: date,
        userId: userId,
        timeSlot: timeSlot,
        spaceType: spaceType,
        bookingType: bookingType,
      });
    }
    const bookingPostRequest: BookingPostRequest = {
      bookings: bookings,
    };
    const {selectedDayOptions} = appState as {
      selectedDayOptions: SelectedOptionsState;
    };
    await makeBookingRequest(
      selectedDayOptions.selectedSpaceType,
      bookingPostRequest,
    ).catch(() => thunkAPI.dispatch(setShowError(true)));
  },
);

export const selectedDayOptionsSlice = createSlice({
  name: 'SelectedDayOptions',
  initialState: initialState,
  reducers: {
    storeSelectedDay: (state, action) => {
      state.selectedDay = formatToBookingDateUTC(dayjs(action.payload), false);
    },
    storeSelectedSpaceType: (state, action) => {
      state.selectedSpaceType = action.payload;
    },
    resetSelectedOptionsState: () => initialState,
  },
});

export const {
  storeSelectedDay,
  storeSelectedSpaceType,
  resetSelectedOptionsState,
} = selectedDayOptionsSlice.actions;

export default selectedDayOptionsSlice.reducer;
