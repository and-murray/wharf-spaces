import React, {useEffect, useRef, useState} from 'react';
import {AppState} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {AuthContainer, LoadingContainer, HomeContainer} from './';
import {useAppDispatch, useAppSelector} from '@state/utils/hooks';
import {fetchRemoteConfig} from '@state/reducers/RemoteConfigSlice';
import ErrorContainer from './ErrorContainer/ErrorContainer';
import {fetchLondonTime} from '@state/reducers/UtilsSlice';
import {checkAppIntegrity} from '../util/FirebaseUtils/FirebaseUtils';
import RNExitApp from 'react-native-exit-app';
import AlertMessage from '../components/atoms/AlertMessage/AlertMessage';
import BootSplash from 'react-native-bootsplash';

function AppContainer(): React.JSX.Element {
  const {
    splashScreen: {hideSplashScreen},
  } = useAppSelector(state => state);
  const dispatch = useAppDispatch();
  const appState = useRef(AppState.currentState);

  const [invalidApp, setInvalidApp] = useState(false);
  function handleAlertClose() {
    RNExitApp.exitApp();
  }

  async function handleRetry() {
    const isValidApp = await checkAppIntegrity();
    setInvalidApp(!isValidApp);
    if (isValidApp) {
      dispatch(fetchRemoteConfig());
      dispatch(fetchLondonTime());
    }
  }

  useEffect(() => {
    const fetchSetup = async () => {
      const isValidApp = await checkAppIntegrity();
      setInvalidApp(!isValidApp);
      if (isValidApp) {
        dispatch(fetchRemoteConfig());
        dispatch(fetchLondonTime());
      }
    };

    fetchSetup();
  }, [dispatch]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App has become foregrounded
        dispatch(fetchLondonTime());
      }
      appState.current = nextAppState;
    });
    return () => {
      subscription.remove();
    };
  }, [dispatch]);

  useEffect(() => {
    if (hideSplashScreen) {
      BootSplash.hide({fade: true});
    }
  }, [hideSplashScreen]);
  return (
    <NavigationContainer>
      <ErrorContainer>
        <LoadingContainer>
          <AuthContainer>
            <HomeContainer />
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
          </AuthContainer>
        </LoadingContainer>
      </ErrorContainer>
    </NavigationContainer>
  );
}
export default AppContainer;
