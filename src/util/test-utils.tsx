import React, {PropsWithChildren} from 'react';
import {render, RenderOptions} from '@testing-library/react-native';
import {Provider} from 'react-redux';
import {AppStore, RootState, setupStore} from '../state/store';
import {NativeBaseProvider} from '@gluestack-ui/themed-native-base';
import {NavigationContainer} from '@react-navigation/native';
import theme from '@root/theme';

interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: Partial<RootState>;
  store?: AppStore;
}

export const renderWithProviders = (
  ui: React.ReactElement,
  {
    preloadedState = {},
    store = setupStore(preloadedState),
    ...renderOptions
  }: ExtendedRenderOptions = {},
) => {
  const inset = {
    frame: {x: 0, y: 0, width: 0, height: 0},
    insets: {top: 0, left: 0, right: 0, bottom: 0},
  };

  const wrapper = ({children}: PropsWithChildren) => {
    return (
      <NativeBaseProvider initialWindowMetrics={inset} theme={theme}>
        <Provider store={store}>
          <NavigationContainer>{children}</NavigationContainer>
        </Provider>
      </NativeBaseProvider>
    );
  };

  return {store, ...render(ui, {wrapper, ...renderOptions})};
};
