import React from 'react';
import {TestWrapper} from '@components/TestWrapper';
import {render, waitFor} from '@testing-library/react-native';
import HomeContainer from './HomeContainer';
import * as hooks from '@state/utils/hooks';

const mockSaveTokenToDatabase = jest.fn();
const mockRequestMessagingPermission = () => {};
const mockCheckMessagingPermission = jest
  .fn()
  .mockResolvedValueOnce(1)
  .mockResolvedValueOnce(1)
  .mockResolvedValueOnce(0);

jest.mock('@firebase/messaging/messagingService', () => ({
  requestMessagingPermission: () => mockRequestMessagingPermission(),
  saveTokenToDatabase: (token: string) => mockSaveTokenToDatabase(token),
  checkMessagingPermission: () => mockCheckMessagingPermission(),
}));
jest.mock('@screens/BookingScreen/BookingScreen');

describe('When the Home container is displayed', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when the user accepts the notification permission', () => {
    it('should save the token to the database', async () => {
      render(
        <TestWrapper>
          <HomeContainer />
        </TestWrapper>,
      );
      await waitFor(() => {
        expect(mockSaveTokenToDatabase).toHaveBeenCalledWith('MessageToken');
      });
    });
  });

  describe('when the user rejects the notification permission', () => {
    it('should not save the token to the database', () => {
      render(
        <TestWrapper>
          <HomeContainer />
        </TestWrapper>,
      );

      expect(mockSaveTokenToDatabase).toBeCalledTimes(0);
    });
  });

  it('renders a normal navigation stack with child when tabBarEnabled is false', () => {
    jest.spyOn(hooks, 'useAppSelector').mockReturnValue({
      tabBarEnabled: false,
    });

    const {queryByTestId} = render(
      <TestWrapper>
        <HomeContainer />
      </TestWrapper>,
    );
    expect(queryByTestId('TabBar')).toBeNull();
  });

  it('renders a tab bar with child when tabBarEnabled is true', () => {
    jest.spyOn(hooks, 'useAppSelector').mockReturnValue({
      tabBarEnabled: true,
    });

    const {queryByTestId} = render(
      <TestWrapper>
        <HomeContainer />
      </TestWrapper>,
    );
    expect(queryByTestId('TabBar')).toBeTruthy();
  });
});
