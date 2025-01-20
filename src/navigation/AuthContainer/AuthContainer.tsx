import React, {useState, useEffect, ReactNode} from 'react';
import {FirebaseAuthTypes} from '@react-native-firebase/auth';
import auth from '@react-native-firebase/auth';
import {fetchRemoteConfig} from '@state/reducers/RemoteConfigSlice';
import {useAppDispatch, useAppSelector} from '@state/utils/hooks';
import {clearUser, fetchUser} from '@state/reducers/UserSlice';
import {setLoading} from '@root/src/state/reducers/LoadingSlice';
import {screensLoaded} from '@state/reducers/SplashScreenReducer';
import LoginScreen from '@root/src/screens/LoginScreen/LoginScreen';
import {resetSelectedOptionsState} from '@state/reducers/selectedDayOptionsSlice';
type CustomComponentProps = {
  children: ReactNode;
};

const AuthContainer = ({children}: CustomComponentProps): React.JSX.Element => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const user = useAppSelector(state => state.user.user);

  const dispatch = useAppDispatch();

  // onAuthStateChanged callback fires when user signs in or out
  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  });

  const onAuthStateChanged = (
    currentUser: FirebaseAuthTypes.User | null | undefined,
  ) => {
    // !authenticatedUser to stop onload chaining
    if (currentUser && !user) {
      dispatch(setLoading(true));
      dispatch(fetchUser(currentUser));
      dispatch(resetSelectedOptionsState());
    }
    if (!currentUser) {
      dispatch(clearUser());
      setIsAuthenticated(false);
      dispatch(screensLoaded(true)); // dismiss splash when login needed
    }
  };

  useEffect(() => {
    if (user) {
      dispatch(fetchRemoteConfig());
      dispatch(setLoading(false));
      setIsAuthenticated(true);
    }
  }, [user, dispatch]);

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <>{children}</>;
};

export default AuthContainer;
