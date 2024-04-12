import React from 'react';
import {TestWrapper} from '@components/TestWrapper';
import {render} from '@testing-library/react-native';
import UserProfileSectionHome from './UserProfileSectionHome';
import * as hooks from '@state/utils/hooks';
import * as dateFormatter from '@utils/DateTimeUtils/DateTimeUtils';

describe('When UsersProfileSection is on screen ', () => {
  it('Renders Correctly', () => {
    const {getByTestId} = render(
      <TestWrapper>
        <UserProfileSectionHome />
      </TestWrapper>,
    );

    expect(getByTestId('users-profile-section')).toBeTruthy();
  });
  it('Displays the text EY UP first name', () => {
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
        <UserProfileSectionHome />
      </TestWrapper>,
    );

    expect(getByText('EY UP Bob')).toBeTruthy();
  });

  it('Displays date', () => {
    jest.spyOn(hooks, 'useAppSelector').mockReturnValue({
      user: {
        firstName: 'Bob',
        lastName: '',
        profilePicUrl: '',
      },
    });
    jest.spyOn(dateFormatter, 'formatDate').mockReturnValue('formatted date');
    const {getByText} = render(
      <TestWrapper>
        <UserProfileSectionHome />
      </TestWrapper>,
    );

    expect(getByText('formatted date')).toBeTruthy();
  });
});
