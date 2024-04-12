import {VStack, HStack, Box, Text, Switch, Center} from 'native-base';
import crashlytics from '@react-native-firebase/crashlytics';
import {useAppSelector} from '@state/utils/hooks';
import React, {useState, useEffect} from 'react';
import {GoogleSignInComponent} from '@firebase/authentication/FirebaseGoogleAuthentication';
import EmailPasswordLoginModal from './EmailPasswordLoginModal';
import {GoogleSignInError} from '@firebase/authentication/FirebaseGoogleAuthentication';

export default function HomeScreen() {
  let {
    firebaseRemoteConfig: {isDemoLoginEnabled},
  } = useAppSelector(state => state);
  const [, setSignInError] = useState<GoogleSignInError>();
  const [demoLoginEnabled, setDemoLoginEnabled] = useState<boolean>(false);
  const [crashlyticsEnabled, setCrashlyticsEnabled] = useState(
    crashlytics().isCrashlyticsCollectionEnabled,
  );
  useEffect(() => {
    setDemoLoginEnabled(isDemoLoginEnabled);
  }, [isDemoLoginEnabled]);
  async function toggleCrashlytics() {
    await crashlytics()
      .setCrashlyticsCollectionEnabled(!crashlyticsEnabled)
      .then(() =>
        setCrashlyticsEnabled(crashlytics().isCrashlyticsCollectionEnabled),
      );
  }
  return (
    <Box flex={1} safeAreaTop={false} backgroundColor="other.primaryRed">
      <Box
        alignSelf="flex-end"
        marginTop={5}
        paddingRight={3}
        position="static">
        <HStack alignItems="center">
          <Text fontFamily="Poppins-Regular" color="white" fontSize="xs">
            Analytics
          </Text>
          <Switch
            isChecked={crashlyticsEnabled}
            onToggle={toggleCrashlytics}
            colorScheme="emerald"
            size="sm"
          />
        </HStack>
      </Box>
      <Center flex={1}>
        <VStack alignItems="center">
          <Text
            bold
            alignContent="center"
            color="white"
            fontSize="5xl"
            fontFamily="Poppins-Medium">
            Ey up!
          </Text>
          <VStack marginTop="40%" space={5}>
            <Box>
              <GoogleSignInComponent errorCallback={setSignInError} />
            </Box>
            {demoLoginEnabled && <EmailPasswordLoginModal />}
          </VStack>
        </VStack>
      </Center>
    </Box>
  );
}
