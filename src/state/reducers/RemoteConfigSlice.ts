import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {
  fetchInitialRemoteConfig,
  getDeskCapacity,
  getParkingCapacity,
  getIsDemoLoginEnabled,
  getFeatureFlags,
} from '@firebase/remoteConfig/fetchRemoteConfig';
import {FeatureFlags} from '@root/src/types/FeatureFlags';

export type ParkingCapacityConfig = {
  murray: number;
  tenzing: number;
  adams: number;
  unknown: number;
};
export type FirebaseRemoteConfigState = {
  deskCapacity: number;
  parkingCapacity: ParkingCapacityConfig;
  isDemoLoginEnabled: boolean;
  featureFlags: FeatureFlags | undefined;
};

const initialState: FirebaseRemoteConfigState = {
  deskCapacity: getDeskCapacity(),
  parkingCapacity: getParkingCapacity(),
  isDemoLoginEnabled: getIsDemoLoginEnabled(),
  featureFlags: getFeatureFlags(),
};

export const fetchRemoteConfig = createAsyncThunk(
  'firebaseRemoteConfig/get',
  async () => await fetchInitialRemoteConfig(),
);

export const remoteConfigSlice = createSlice({
  name: 'RemoteConfig',
  initialState: initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(fetchRemoteConfig.fulfilled, (state, {payload}) => {
      if (payload !== true) {
        console.log(
          'No new firebase configs were fetched from the backend, and the local configs were already activated',
        );
      } else {
        console.log(
          'New firebase configs were retrieved from the backend and activated.',
        );
      }
      state.deskCapacity = getDeskCapacity();
      state.parkingCapacity = getParkingCapacity();
      state.isDemoLoginEnabled = getIsDemoLoginEnabled();
      state.featureFlags = getFeatureFlags();
    });
  },
});

export default remoteConfigSlice.reducer;
