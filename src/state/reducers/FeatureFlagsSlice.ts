import {createSlice} from '@reduxjs/toolkit';
import {FeatureFlags} from '@root/src/types/FeatureFlags';
import {fetchRemoteConfig} from './RemoteConfigSlice';
import {getFeatureFlags} from '@root/src/firebase/remoteConfig/fetchRemoteConfig';

const initialState: FeatureFlags = {
  tabBarEnabled: true,
};

export const featureFlagsSlice = createSlice({
  name: 'FeatureFlags',
  initialState: initialState,
  reducers: {
    setTabBarEnabled: (state, action) => {
      state.tabBarEnabled = action.payload;
    },
  },
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
      const featureFlags = getFeatureFlags();
      console.log('GOT FEATURE FLAGS');
      if (featureFlags !== undefined) {
        console.log('Feature FLAGS defined');
        // If a feature flag is disabled locally it should always be off otherwise check remote config
        state.tabBarEnabled = initialState ? featureFlags.tabBarEnabled : false;
      }
    });
  },
});

export const {setTabBarEnabled} = featureFlagsSlice.actions;
export default featureFlagsSlice.reducer;
