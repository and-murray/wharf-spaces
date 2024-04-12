import crashlytics from '@react-native-firebase/crashlytics';
import {useAppSelector} from '@state/utils/hooks';
import React, {useState, useEffect} from 'react';
import {GoogleSignInComponent} from '@firebase/authentication/FirebaseGoogleAuthentication';
import EmailPasswordLoginModal from './EmailPasswordLoginModal';
import {GoogleSignInError} from '@firebase/authentication/FirebaseGoogleAuthentication';
import {Box, Center, HStack, Switch, Text, VStack} from '@gluestack-ui/themed';

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
    <Box flex={1} backgroundColor="$otherPrimaryRed">
      <Box
        alignSelf="flex-end"
        marginTop={5}
        paddingRight={3}
        position="absolute">
        <HStack alignItems="center">
          <Text fontFamily="Poppins-Regular" color="white" size="xs">
            Analytics
          </Text>
          <Switch
            isChecked={crashlyticsEnabled}
            onToggle={toggleCrashlytics}
            bgColor="emerald"
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
            size="5xl"
            fontFamily="Poppins-Medium">
            Hello
          </Text>
          <VStack marginTop="40%" space="sm">
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
