import React, {ReactNode} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {Provider} from 'react-redux';
import {store} from '@state/store';
import {GluestackUIProvider} from '@gluestack-ui/themed';
import {config} from '@root/gluestack-ui.config';

interface CustomComponentProps {
  children: ReactNode;
}

export function TestWrapper({children}: CustomComponentProps) {
  return (
    <GluestackUIProvider config={config}>
      <Provider store={store}>
        <NavigationContainer>{children}</NavigationContainer>
      </Provider>
    </GluestackUIProvider>
  );
}
