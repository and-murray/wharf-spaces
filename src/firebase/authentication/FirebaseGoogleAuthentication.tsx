import React from 'react';
import {
  GoogleSignin,
  statusCodes,
  GoogleSigninButton,
  type NativeModuleError,
} from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import Config from 'react-native-config';
import {messagingSignOutHandler} from '@firebase/messaging/messagingService';
import {setLoading} from '@root/src/state/reducers/LoadingSlice';
import {useAppDispatch} from '@root/src/state/utils/hooks';
import {LogLevel, logMessage} from '@root/src/util/Logging/Logging';

const webClientId = Config.REACT_APP_FIREBASE_AUTH_WEB_CLIENT_ID;

if (!webClientId) {
  console.error('No web client id set for environment');
  throw Error('No web client id set for environment');
}

GoogleSignin.configure({
  webClientId: webClientId,
  hostedDomain: 'and.digital',
  scopes: [
    'https://www.googleapis.com/auth/contacts.readonly',
    'https://www.googleapis.com/auth/user.organization.read',
  ],
});

const isErrorWithCode = (error: unknown): error is NativeModuleError => {
  // to account for https://github.com/facebook/react-native/issues/41950
  // fixed in https://github.com/facebook/react-native/commit/9525074a194b9cf2b7ef8ed270978e3f7f2c41f7 0.74
  const isNewArchErrorIOS = typeof error === 'object' && error != null;
  return (error instanceof Error || isNewArchErrorIOS) && 'code' in error;
};

export const signOut = async () => {
  // Do any other signout work e.g clear notification tokens
  if (auth().currentUser) {
    try {
      await messagingSignOutHandler();
    } catch (error) {
      logMessage(LogLevel.error, error);
    }
    auth().signOut();
  }
};
export const getTokenID = () => auth().currentUser?.getIdToken();
export const getAccessTokens = async () => await GoogleSignin.getTokens();

if (__DEV__) {
  getTokenID()?.then(token => {
    console.log('Firebase Auth Token: ', token);
  });
}

export const signInSilently = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signInSilently();

    if (!userInfo.user.email.includes('@and.digital')) {
      await GoogleSignin.signOut();
      throw new Error('Not a valid user');
    }

    const googleCredential = auth.GoogleAuthProvider.credential(
      userInfo.idToken,
    );

    // Sign-in the user with the credential
    return auth().signInWithCredential(googleCredential);
  } catch (error) {
    if (isErrorWithCode(error) && error.code === statusCodes.SIGN_IN_REQUIRED) {
      // When the user hasn't signed in before or they have signed out.
      // In this case, you should let the user sign in explicitly.
      await GoogleSignin.signOut();
      return;
    } else if (
      error instanceof Error &&
      error.message.includes('invalid_grant')
    ) {
      // The token has expired or been revoked. Sign the user out, and prompt them to sign in again.
      await GoogleSignin.signOut();
      return;
    } else {
      // Handle the error based on its type
      console.error('Error in silent sign-in: ', error);
      throw error;
    }
  }
};

export enum GoogleSignInError {
  SIGN_IN_CANCELLED,
  IN_PROGRESS,
  PLAY_SERVICES_NOT_AVAILABLE,
  NOT_ANDI,
  UNKNOWN,
}

export const GoogleSignInComponent = ({
  errorCallback,
}: {
  errorCallback: React.Dispatch<
    React.SetStateAction<GoogleSignInError | undefined>
  >;
}) => {
  const dispatch = useAppDispatch();
  const onGoogleButtonPress = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      // Sign out before signing in to display the account picker
      await GoogleSignin.signOut();
      const userInfo = await GoogleSignin.signIn();

      if (!userInfo.user.email.includes('@and.digital')) {
        await GoogleSignin.signOut();
        errorCallback(GoogleSignInError.NOT_ANDI);
        return;
      }
      const googleCredential = auth.GoogleAuthProvider.credential(
        userInfo.idToken,
      );
      dispatch(setLoading(true));
      // Sign-in the user with the credential
      return auth().signInWithCredential(googleCredential);
    } catch (error) {
      dispatch(setLoading(false));
      if (
        isErrorWithCode(error) &&
        error.code === statusCodes.SIGN_IN_CANCELLED
      ) {
        // user cancelled the login flow
        console.error(
          'Authentication error: SIGN_IN_CANCELLED',
          statusCodes.SIGN_IN_CANCELLED,
        );
        errorCallback(GoogleSignInError.SIGN_IN_CANCELLED);
        return;
      } else if (
        isErrorWithCode(error) &&
        error.code === statusCodes.IN_PROGRESS
      ) {
        // operation (e.g. sign in) is in progress already
        console.error('Authentication error: ', statusCodes.IN_PROGRESS);
        errorCallback(GoogleSignInError.IN_PROGRESS);
        return;
      } else if (
        isErrorWithCode(error) &&
        error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE
      ) {
        // play services not available or outdated
        console.error(
          'Authentication error: ',
          statusCodes.PLAY_SERVICES_NOT_AVAILABLE,
        );
        errorCallback(GoogleSignInError.PLAY_SERVICES_NOT_AVAILABLE);
        return;
      } else {
        // some other error happened
        console.error(
          'Authentication error: ',
          error,
          isErrorWithCode(error) && error.code,
        );
        errorCallback(GoogleSignInError.UNKNOWN);
        return;
      }
    }
  };

  return (
    <GoogleSigninButton
      // disabled linting for google guidelines
      // eslint-disable-next-line react-native/no-inline-styles
      style={{width: 206, height: 48}}
      size={GoogleSigninButton.Size.Wide}
      color={GoogleSigninButton.Color.Light}
      onPress={() => onGoogleButtonPress()}
      testID="GoogleSigninButton"
    />
  );
};
