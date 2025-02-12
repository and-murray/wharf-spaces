import React from 'react';
import AuthContainer from './AuthContainer';
import {Text} from '@gluestack-ui/themed-native-base';
import {renderWithProviders as render} from '@root/src/util/test-utils';
import {BusinessUnit, Role} from '@root/src/types/user';
import {Timestamp} from 'firebase-admin/firestore';

const partialFirebaseRemoteConfigStub = {
  deskCapacity: 36,
  parkingCapacity: {murray: 10, tenzing: 4, unknown: 0},
};

describe('When AuthContainer is rendered on screen', () => {
  const MockChildComponent = () => <Text testID="this is a child">text</Text>;
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with child when a authenticated user is provided', () => {
    const {getByTestId} = render(
      <AuthContainer>
        <MockChildComponent />
      </AuthContainer>,
      {
        preloadedState: {
          user: {
            user: {
              id: '1',
              firstName: 'john',
              lastName: 'jones',
              email: 'jones',
              profilePicUrl: '1',
              role: Role.user,
              businessUnit: BusinessUnit.murray,
              createdAt: undefined as unknown as Timestamp, // real Timestamp value is non-serializable
              updatedAt: undefined as unknown as Timestamp, // using undefined to avoid error
            },
            activeBookingDates: [],
          },
        },
      },
    );
    expect(getByTestId('this is a child')).toBeTruthy();
  });

  it('renders sign in with when no authenticated user is provided', () => {
    const {queryByTestId, getByTestId} = render(
      <AuthContainer>
        <MockChildComponent />
      </AuthContainer>,
    );
    expect(getByTestId('GoogleSigninButton')).toBeTruthy();
    expect(queryByTestId('this is a child')).toBeNull();
  });

  it('renders demo sign in when feature flag enabled', () => {
    const {queryByTestId, getByTestId} = render(
      <AuthContainer>
        <MockChildComponent />
      </AuthContainer>,
      {
        preloadedState: {
          firebaseRemoteConfig: {
            ...partialFirebaseRemoteConfigStub,
            isDemoLoginEnabled: true,
          },
        },
      },
    );
    expect(getByTestId('DemoLoginButton')).toBeTruthy();
    expect(queryByTestId('this is a child')).toBeNull();
  });

  it('does not render demo sign in when feature flag disabled', () => {
    const {queryByTestId} = render(
      <AuthContainer>
        <MockChildComponent />
      </AuthContainer>,
      {
        preloadedState: {
          firebaseRemoteConfig: {
            ...partialFirebaseRemoteConfigStub,
            isDemoLoginEnabled: false,
          },
        },
      },
    );
    expect(queryByTestId('DemoLoginButton')).toBeNull();
    expect(queryByTestId('this is a child')).toBeNull();
  });
});
