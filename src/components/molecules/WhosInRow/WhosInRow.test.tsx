import React from 'react';
import {TestWrapper} from '@components/TestWrapper';
import {render} from '@testing-library/react-native';
import WhosInRow from './WhosInRow';
import * as ProfilePicture from '@atoms/ProfilePicture/ProfilePicture';
import theme from '@root/theme';
import {SpaceType} from '@customTypes/booking';

describe('When WhosInRow is on screen', () => {
  describe('Desk Bookings', () => {
    const profilePictureSpy = jest
      .spyOn(ProfilePicture, 'default')
      .mockImplementation();
    it('Renders Correctly when booking is not communal space', () => {
      const {getByText, queryByTestId, getByTestId} = render(
        <TestWrapper>
          <WhosInRow
            name="testName"
            profilePictureURI="testProfilePictureURI"
            timeSlot="testTimeSlot"
            isCurrentUser={false}
            isReserveSpace={false}
            spaceType={SpaceType.desk}
            reserveListPosition={undefined}
          />
        </TestWrapper>,
      );

      expect(getByText('testName')).toBeTruthy();
      expect(getByText('testTimeSlot')).toBeTruthy();
      expect(profilePictureSpy).toBeCalledWith(
        expect.objectContaining({
          uri: 'testProfilePictureURI',
          showBorder: false,
        }),
        {},
      );
      expect(queryByTestId('testCommunalSpace')).toBeFalsy();
      const containerColor = getByTestId('testWhosInContainer').props.style
        .backgroundColor;
      expect(containerColor).toBe(theme.colors.brand.white);
    });

    it('Renders correctly when booking is communal space', () => {
      const {getByText, getByTestId} = render(
        <TestWrapper>
          <WhosInRow
            name="testName"
            profilePictureURI="testProfilePictureURI"
            timeSlot="testTimeSlot"
            isCurrentUser={false}
            isReserveSpace={true}
            spaceType={SpaceType.desk}
            reserveListPosition={1}
          />
        </TestWrapper>,
      );

      expect(getByText('testName')).toBeTruthy();
      expect(getByText('testTimeSlot')).toBeTruthy();
      expect(profilePictureSpy).toBeCalledWith(
        expect.objectContaining({
          uri: 'testProfilePictureURI',
          showBorder: false,
        }),
        {},
      );
      expect(getByTestId('testCommunalSpace')).toBeTruthy();
      const containerColor = getByTestId('testWhosInContainer').props.style
        .backgroundColor;
      expect(containerColor).toBe(theme.colors.other.lightGrey);
    });
  });

  describe('Car Bookings', () => {
    const profilePictureSpy = jest
      .spyOn(ProfilePicture, 'default')
      .mockImplementation();
    it('Renders Correctly when booking is not reserve space', () => {
      const {getByText, queryByTestId, getByTestId} = render(
        <TestWrapper>
          <WhosInRow
            name="testName"
            profilePictureURI="testProfilePictureURI"
            timeSlot="testTimeSlot"
            isCurrentUser={false}
            isReserveSpace={false}
            spaceType={SpaceType.car}
            reserveListPosition={undefined}
          />
        </TestWrapper>,
      );

      expect(getByText('testName')).toBeTruthy();
      expect(getByText('testTimeSlot')).toBeTruthy();
      expect(profilePictureSpy).toBeCalledWith(
        expect.objectContaining({
          uri: 'testProfilePictureURI',
          showBorder: false,
        }),
        {},
      );
      expect(queryByTestId('testCommunalSpace')).toBeFalsy();
      const containerColor = getByTestId('testWhosInContainer').props.style
        .backgroundColor;
      expect(containerColor).toBe(theme.colors.brand.white);
    });

    it('Renders correctly when booking is reserve space', () => {
      const {getByText, getByTestId} = render(
        <TestWrapper>
          <WhosInRow
            name="testName"
            profilePictureURI="testProfilePictureURI"
            timeSlot="testTimeSlot"
            isCurrentUser={false}
            isReserveSpace={true}
            spaceType={SpaceType.car}
            reserveListPosition={1}
          />
        </TestWrapper>,
      );

      expect(getByText('testName')).toBeTruthy();
      expect(getByText('testTimeSlot')).toBeTruthy();
      expect(profilePictureSpy).toBeCalledWith(
        expect.objectContaining({
          uri: 'testProfilePictureURI',
          showBorder: false,
        }),
        {},
      );
      expect(getByText('Waiting list position: 1')).toBeTruthy();
      const containerColor = getByTestId('testWhosInContainer').props.style
        .backgroundColor;
      expect(containerColor).toBe(theme.colors.brand.white);
    });
  });
});
