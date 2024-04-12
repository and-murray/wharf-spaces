import messaging from '@react-native-firebase/messaging';
import {Platform, PermissionsAndroid} from 'react-native';
import auth from '@react-native-firebase/auth';
import {removeToken, addToken} from '@firebase/messaging/tokenManagerUtils';

/*
Once a user has selected a permission status, iOS prevents the permission dialog from being displayed again. This allows the users of your application full control of how notifications are handled:

If the user declines permission, they must manually allow notifications via the Settings UI for your application.
If the user has accepted permission, notifications will be shown using the settings requested (e.g. with or without sound).

The value returned is a number value, which can be mapped to one of the following values from messaging.AuthorizationStatus:

-1 = messaging.AuthorizationStatus.NOT_DETERMINED: Permission has not yet been requested for your application.
0 = messaging.AuthorizationStatus.DENIED: The user has denied notification permissions.
1 = messaging.AuthorizationStatus.AUTHORIZED: The user has accept the permission & it is enabled.
2 = messaging.AuthorizationStatus.PROVISIONAL: Provisional authorization has been granted.
3 = messaging.AuthorizationStatus.EPHEMERAL: The app is authorized to create notifications for a limited amount of time. Used for app clips.
*/
export const requestMessagingPermission = async () => {
  switch (Platform.OS) {
    case 'ios':
      await requestMessagingPermissionIOS();
      break;
    case 'android':
      await requestMessagingPermissionAndroid();
      break;

    default:
      break;
  }
};

const rationale = {
  title: 'We need permission to send you push notifications',
  message:
    "This app can send you notifications to tell you if you've been assigned a space after being on the reserve list",
  buttonPositive: 'ok',
};
const requestMessagingPermissionAndroid = () =>
  Number(Platform.Version) >= 33 &&
  PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    rationale,
  );

const requestMessagingPermissionIOS = async () => {
  const authorizationStatus = await messaging().requestPermission();

  if (authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED) {
    console.log('User has notification permissions enabled.');
  } else if (
    authorizationStatus === messaging.AuthorizationStatus.PROVISIONAL
  ) {
    console.log('User has provisional notification permissions.');
  } else {
    console.log('User has notification permissions disabled');
  }
};
/*
-------------- ON IOS --------------
-1 = messaging.AuthorizationStatus.NOT_DETERMINED: Permission has not yet been requested for your application.
0 = messaging.AuthorizationStatus.DENIED: The user has denied notification permissions.
1 = messaging.AuthorizationStatus.AUTHORIZED: The user has accept the permission & it is enabled.
2 = messaging.AuthorizationStatus.PROVISIONAL: Provisional authorization has been granted.
3 = messaging.AuthorizationStatus.EPHEMERAL: The app is authorized to create notifications for a limited amount of time. Used for app clips.

-------------- ON ANDROID --------------
0 = not enabled
1 = is enabled
*/
export const checkMessagingPermission = async () =>
  await messaging().hasPermission();

export const saveTokenToDatabase = (token: string) => {
  // Assume user is already signed in
  const userId = auth().currentUser?.uid;
  if (!userId) {
    return;
  }
  addToken(userId, token);
};

export const messagingSignOutHandler = async () => {
  const currentToken = await messaging().getToken();
  // Assume user is already signed in
  const userId = auth().currentUser?.uid;
  if (!userId) {
    return;
  }
  removeToken(userId, currentToken);
  await messaging().deleteToken();
};
