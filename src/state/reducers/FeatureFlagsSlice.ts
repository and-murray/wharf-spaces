import {createSlice} from '@reduxjs/toolkit';
import {FeatureFlags} from '@root/src/types/FeatureFlags';

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
});

export const {setTabBarEnabled} = featureFlagsSlice.actions;
export default featureFlagsSlice.reducer;
