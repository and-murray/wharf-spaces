import React, {useEffect, useLayoutEffect} from 'react';
import DeskScreen from '@screens/DeskScreen/DeskScreen';
import messaging from '@react-native-firebase/messaging';
import {Alert} from 'react-native';
import {Button, ButtonIcon} from '@gluestack-ui/themed';
import {createStackNavigator} from '@react-navigation/stack';
import {hideSplashScreen} from '@root/src/state/reducers/SplashScreenReducer';
import {LogLevel, logMessage} from '@root/src/util/Logging/Logging';
import {LogoutIcon} from '@res/images/LogoutIcon';
import {signOut} from '@firebase/authentication/FirebaseGoogleAuthentication';
import {useAppDispatch} from '@state/utils/hooks';
import {
  requestMessagingPermission,
  saveTokenToDatabase,
  checkMessagingPermission,
} from '@firebase/messaging/messagingService';

const Stack = createStackNavigator();
function HomeContainer(): React.JSX.Element {
  const dispatch = useAppDispatch();
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      Alert.alert(
        remoteMessage.notification?.title ?? 'Murray Desk Booking',
        remoteMessage.notification?.body ?? '',
      );
    });

    return unsubscribe;
  }, []);

  function logoutButton() {
    return (
      <Button action="default" onPress={logoutAlert}>
        <ButtonIcon as={LogoutIcon} />
      </Button>
    );
  }
  const logoutAlert = () => {
    Alert.alert(
      'Log out?',
      'Are you sure you want to log out of your account?',
      [
        {text: 'Cancel'},
        {text: 'Log out', onPress: () => signOut(), style: 'destructive'},
      ],
    );
  };
  useEffect(() => {
    const requestMessaging = async () => {
      await requestMessagingPermission();
      const permissionValue = await checkMessagingPermission();
      if (permissionValue === 1) {
        try {
          const token = await messaging().getToken();
          saveTokenToDatabase(token);
        } catch (error) {
          logMessage(LogLevel.error, error);
        }
      }
    };
    requestMessaging();

    return messaging().onTokenRefresh(token => {
      saveTokenToDatabase(token);
    });
  }, []);

  useLayoutEffect(() => {
    dispatch(hideSplashScreen(true)); // dismiss if not already dismissed when home screen shown.
  });

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Bookings"
        component={DeskScreen}
        options={{
          headerRight: logoutButton,
        }}
      />
    </Stack.Navigator>
  );
}
export default HomeContainer;
