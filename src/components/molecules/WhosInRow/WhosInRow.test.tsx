import React from 'react';
import {TestWrapper} from '@components/TestWrapper';
import {render} from '@testing-library/react-native';
import WhosInRow from './WhosInRow';
import * as ProfilePicture from '@atoms/ProfilePicture/ProfilePicture';
import {SpaceType} from '@customTypes/booking';
import {parseGluestackComponentStyleProps} from '@root/src/util/GluestackUtils/GluestackUtils';

describe('When WhosInRow is on screen', () => {
  describe('Desk Bookings', () => {
    let profilePictureSpy = jest
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
      expect(profilePictureSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          uri: 'testProfilePictureURI',
          showBorder: false,
        }),
        {},
      );
      expect(queryByTestId('testCommunalSpace')).toBeFalsy();

      const styleProps = parseGluestackComponentStyleProps(
        getByTestId('testWhosInContainer').props.style,
      );

      expect(styleProps.backgroundColor).toBe('#ffffff');
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
      expect(profilePictureSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          uri: 'testProfilePictureURI',
          showBorder: false,
        }),
        {},
      );
      expect(getByTestId('testCommunalSpace')).toBeTruthy();

      const styleProps = parseGluestackComponentStyleProps(
        getByTestId('testWhosInContainer').props.style,
      );

      expect(styleProps.backgroundColor).toBe('#f6f6f6');
    });
  });

  describe('Car Bookings', () => {
    let profilePictureSpy = jest
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
      expect(profilePictureSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          uri: 'testProfilePictureURI',
          showBorder: false,
        }),
        {},
      );
      expect(queryByTestId('testCommunalSpace')).toBeFalsy();

      const styleProps = parseGluestackComponentStyleProps(
        getByTestId('testWhosInContainer').props.style,
      );

      expect(styleProps.backgroundColor).toBe('#ffffff');
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
      expect(profilePictureSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          uri: 'testProfilePictureURI',
          showBorder: false,
        }),
        {},
      );
      expect(getByText('Waiting list position: 1')).toBeTruthy();

      const styleProps = parseGluestackComponentStyleProps(
        getByTestId('testWhosInContainer').props.style,
      );

      expect(styleProps.backgroundColor).toBe('#f6f6f6');
    });
  });
});
