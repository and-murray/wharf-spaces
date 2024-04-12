import React, {useMemo, useState} from 'react';
import AppContainer from '@navigation/AppContainer';
import {store} from '@state/store';
import {Provider} from 'react-redux';
import {NativeBaseProvider} from 'native-base';
import theme from './theme';
import 'react-native-gesture-handler';
import AlertMessage from '@components/atoms/AlertMessage/AlertMessage';
import RNExitApp from 'react-native-exit-app';
import {checkAppIntegrity} from './src/util/FirebaseUtils/FirebaseUtils';
function App(): React.JSX.Element {
  const [invalidApp, setInvalidApp] = useState(false);

  useMemo(async () => {
    const isValidApp = await checkAppIntegrity();
    setInvalidApp(!isValidApp);
  }, []);

  function handleAlertClose() {
    RNExitApp.exitApp();
  }

  function handleRetry() {
    checkAppIntegrity();
  }

  return (
    <NativeBaseProvider theme={theme}>
      <Provider store={store}>
        {invalidApp && (
          <AlertMessage
            isOpen={invalidApp}
            onClose={handleAlertClose}
            title="Unverified App or Device"
            message="We could not verify the integrity of your app or phone. You can retry or close the app."
            alertConfig={{
              button1: {
                onPress: handleAlertClose,
                colorScheme: 'red',
                text: 'Close',
              },
              button2: {
                onPress: handleRetry,
                colorScheme: 'warmGray',
                text: 'Retry',
              },
            }}
          />
        )}
        <AppContainer />
      </Provider>
    </NativeBaseProvider>
  );
}
export default App;
