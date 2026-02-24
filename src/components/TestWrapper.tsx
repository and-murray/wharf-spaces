import React, {ReactNode} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {NativeBaseProvider} from 'native-base';
import {Provider} from 'react-redux';
import {store} from '@state/store';
import theme from '@root/theme';

interface CustomComponentProps {
  children: ReactNode;
}

export function TestWrapper({children}: CustomComponentProps) {
  const inset = {
    frame: {x: 0, y: 0, width: 0, height: 0},
    insets: {top: 0, left: 0, right: 0, bottom: 0},
  };

  return (
    <NativeBaseProvider initialWindowMetrics={inset} theme={theme}>
      <Provider store={store}>
        <NavigationContainer>{children}</NavigationContainer>
      </Provider>
    </NativeBaseProvider>
  );
}
