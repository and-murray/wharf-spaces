import React from 'react';
import {TestWrapper} from '@components/TestWrapper';
import {render} from '@testing-library/react-native';
import UserProfileSection from './UserProfileSection';
import * as hooks from '@state/utils/hooks';

describe('When UsersProfileSection is on screen ', () => {
  it('Renders Correctly', () => {
    const {getByTestId} = render(
      <TestWrapper>
        <UserProfileSection />
      </TestWrapper>,
    );

    expect(getByTestId('users-profile-section')).toBeTruthy();
  });
  it('Displays the users first and last name', () => {
    jest.spyOn(hooks, 'useAppSelector').mockReturnValue({
      user: {
        firstName: 'Bob',
        lastName: 'Test',
        profilePicUrl:
          'https://lh3.googleusercontent.com/a/AGNmyxatHOStWjfT2xYyejMxtUYRb577e23a_ks4EIFV=s96-c',
      },
    });
    const {getByText} = render(
      <TestWrapper>
        <UserProfileSection />
      </TestWrapper>,
    );

    expect(getByText('Bob Test')).toBeTruthy();
  });
});
