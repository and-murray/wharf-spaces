import React from 'react';
import {TestWrapper} from '@components/TestWrapper';
import {render} from '@testing-library/react-native';
import AuthContainer from './AuthContainer';
import {Text} from 'native-base';
import * as hooks from '@state/utils/hooks';

const useAppSelectorSpy = jest.spyOn(hooks, 'useAppSelector');

describe('When AuthContainer is rendered on screen', () => {
  let SomeChild: () => React.JSX.Element;
  beforeEach(() => {
    SomeChild = () => <Text testID="this is a child">text</Text>;
    jest.clearAllMocks();
    useAppSelectorSpy.mockReturnValue({
      user: {user: undefined},
      firebaseRemoteConfig: {isDemoLoginEnabled: true},
    });
  });

  it('renders correctly with child when a authenticated user is provided', () => {
    const user = {
      id: '1',
      firstName: 'john',
      lastName: 'jones',
      email: 'jones',
      profilePicUrl: '1',
      role: 'user',
      businessUnit: 'murray',
    };
    useAppSelectorSpy.mockReturnValue({
      user: {user: user},
      firebaseRemoteConfig: {isDemoLoginEnabled: true},
    });

    const {getByTestId} = render(
      <TestWrapper>
        <AuthContainer>
          <SomeChild />
        </AuthContainer>
      </TestWrapper>,
    );
    expect(getByTestId('this is a child')).toBeTruthy();
  });

  it('renders sign in with when no authenticated user is provided', () => {
    const {queryByTestId, getByTestId} = render(
      <TestWrapper>
        <AuthContainer>
          <SomeChild />
        </AuthContainer>
      </TestWrapper>,
    );
    expect(getByTestId('GoogleSigninButton')).toBeTruthy();
    expect(queryByTestId('this is a child')).toBeNull();
  });

  it('renders demo sign in when feature flag enabled', () => {
    const {queryByTestId, getByTestId} = render(
      <TestWrapper>
        <AuthContainer>
          <SomeChild />
        </AuthContainer>
      </TestWrapper>,
    );
    expect(getByTestId('DemoLoginButton')).toBeTruthy();
    expect(queryByTestId('this is a child')).toBeNull();
  });

  it('does not render demo sign in when feature flag enabled', () => {
    useAppSelectorSpy.mockReturnValue({
      user: {user: undefined},
      firebaseRemoteConfig: {isDemoLoginEnabled: false},
    });
    const {queryByTestId} = render(
      <TestWrapper>
        <AuthContainer>
          <SomeChild />
        </AuthContainer>
      </TestWrapper>,
    );
    expect(queryByTestId('DemoLoginButton')).toBeNull();
    expect(queryByTestId('this is a child')).toBeNull();
  });
});
