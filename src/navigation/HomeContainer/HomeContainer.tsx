import React, {useEffect, useLayoutEffect} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import BookingScreen from '@root/src/screens/BookingScreen/BookingScreen';
import {Alert} from 'react-native';
import {IconButton, Icon} from 'native-base';
import {signOut} from '@firebase/authentication/FirebaseGoogleAuthentication';
import {LogoutIcon} from '@res/images/LogoutIcon';
import {
  requestMessagingPermission,
  saveTokenToDatabase,
  checkMessagingPermission,
} from '@firebase/messaging/messagingService';
import messaging from '@react-native-firebase/messaging';
import {LogLevel, logMessage} from '@root/src/util/Logging/Logging';
import {hideSplashScreen} from '@root/src/state/reducers/SplashScreenReducer';
import {useAppDispatch} from '@state/utils/hooks';

// const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
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
      <IconButton
        onPress={logoutAlert}
        variant="unstyled"
        accessibilityLabel="Log Out"
        icon={<Icon as={LogoutIcon} />}
      />
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
    <Tab.Navigator>
      <Tab.Screen name="Bookings" component={BookingScreen} />
    </Tab.Navigator>
  );
  // return (
  //   <Stack.Navigator>
  //     <Stack.Screen
  //       name="Bookings"
  //       component={BookingScreen}
  //       options={{
  //         headerRight: logoutButton,
  //       }}
  //     />
  //   </Stack.Navigator>
  // );
}
export default HomeContainer;
