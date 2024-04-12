import React from 'react';
import {TestWrapper} from '@components/TestWrapper';
import {waitFor} from '@testing-library/react-native';
import WhosIn from './WhosIn';
import * as WhosInRow from '@molecules/WhosInRow/WhosInRow';
import {TimeSlot, BookingType, SpaceType} from '@customTypes/booking';
import {renderWithProviders as render} from '@root/src/util/test-utils';
import {userStateStub, userStub} from '@root/src/util/stubs';

let whosInRowSpy = jest.spyOn(WhosInRow, 'default');
let mockUserData = {
  ['userId1']: {
    name: 'Zane',
    profilePictureURI: 'profilePictureURI1',
    businessUnit: 'murray',
  },
  ['userId2']: {
    name: 'Alfie',
    profilePictureURI: 'profilePictureURI2',
    businessUnit: 'murray',
  },
  ['userId3']: {
    name: 'Barry',
    profilePictureURI: 'profilePictureURI3',
    businessUnit: 'murray',
  },
};
jest.mock('@utils/TimeSlotUtils/TimeSlotUtils', () => ({
  TimeSlotUtils: {
    toString: jest.fn().mockImplementation(timeSlot => timeSlot),
  },
}));

describe('When WhosIn is on screen ', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    whosInRowSpy.mockClear();
  });

  describe('For Desk Booking', () => {
    it('Renders Correctly', () => {
      const {getByText} = render(<WhosIn bookings={[]} userData={{}} />, {
        preloadedState: {
          selectedDayOptions: {
            selectedDay: '2023-06-26',
            selectedSpaceType: SpaceType.desk,
          },
          user: userStateStub,
        },
      });

      expect(getByText("Who's in?")).toBeTruthy();
      expect(getByText('0 ANDis')).toBeTruthy();
    });
  });

  describe('For Car Booking', () => {
    // beforeEach(() => {
    //   whosInRowSpy.mockImplementation();
    // });

    it('Renders Correctly', () => {
      const {getByText} = render(<WhosIn bookings={[]} userData={{}} />, {
        preloadedState: {
          selectedDayOptions: {
            selectedDay: '2023-06-26',
            selectedSpaceType: SpaceType.car,
          },
          user: userStateStub,
        },
      });

      expect(getByText("Who's parking?")).toBeTruthy();
      expect(getByText('0 ANDis')).toBeTruthy();
    });
  });

  it('Creates a single standard row correctly', async () => {
    const {getByText} = render(
      <WhosIn
        bookings={[
          {
            id: 'id2',
            userId: 'userId2',
            date: '2023-05-11T00:00:00Z',
            timeSlot: TimeSlot.am,
            bookingType: BookingType.personal,
            spaceType: SpaceType.desk,
            isReserveSpace: false,
            createdAt: 0,
            updatedAt: 0,
          },
        ]}
        userData={mockUserData}
      />,
      {
        preloadedState: {
          selectedDayOptions: {
            selectedDay: '2023-06-26',
            selectedSpaceType: SpaceType.desk,
          },
          user: userStateStub,
        },
      },
    );

    expect(whosInRowSpy).toBeCalledWith(
      expect.objectContaining({
        name: 'Alfie',
        profilePictureURI: 'profilePictureURI2',
        timeSlot: 'am',
        isCurrentUser: false,
        isReserveSpace: false,
        spaceType: 'desk',
        reserveListPosition: undefined,
      }),
      {},
    );
    expect(getByText('1 ANDi')).toBeTruthy();
  });

  it('Creates multiple rows correctly', async () => {
    const {getByText} = render(
      <WhosIn
        bookings={[
          {
            id: 'id2',
            userId: 'userId2',
            date: '2023-05-11T00:00:00Z',
            timeSlot: TimeSlot.allDay,
            bookingType: BookingType.personal,
            spaceType: SpaceType.desk,
            isReserveSpace: false,
            createdAt: 0,
            updatedAt: 0,
          },
          {
            id: 'id3',
            userId: 'userId3',
            date: '2023-05-11T00:00:00Z',
            timeSlot: TimeSlot.am,
            bookingType: BookingType.personal,
            spaceType: SpaceType.desk,
            isReserveSpace: false,
            createdAt: 0,
            updatedAt: 0,
          },
        ]}
        userData={mockUserData}
      />,
      {
        preloadedState: {
          selectedDayOptions: {
            selectedDay: '2023-06-26',
            selectedSpaceType: SpaceType.desk,
          },
          user: userStateStub,
        },
      },
    );

    expect(whosInRowSpy).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        name: 'Alfie',
        profilePictureURI: 'profilePictureURI2',
        timeSlot: 'allDay',
        isCurrentUser: false,
      }),
      {},
    );
    expect(whosInRowSpy).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        name: 'Barry',
        profilePictureURI: 'profilePictureURI3',
        timeSlot: 'am',
        isCurrentUser: false,
      }),
      {},
    );
    expect(getByText('2 ANDis')).toBeTruthy();
  });

  it('Sets isCurrentUser to true when user id matches the logged in users id', async () => {
    render(
      <WhosIn
        bookings={[
          {
            id: 'id1',
            userId: userStateStub.user.id,
            date: '2023-05-11T00:00:00Z',
            timeSlot: TimeSlot.am,
            bookingType: BookingType.personal,
            spaceType: SpaceType.desk,
            isReserveSpace: false,
            createdAt: 0,
            updatedAt: 0,
          },
        ]}
        userData={{
          [userStateStub.user.id]: {
            name: userStateStub.user.firstName,
            businessUnit: userStateStub.user.businessUnit,
            profilePictureURI: userStateStub.user.profilePicUrl,
          },
        }}
      />,
      {
        preloadedState: {
          selectedDayOptions: {
            selectedDay: '2023-06-26',
            selectedSpaceType: SpaceType.desk,
          },
          user: userStateStub,
        },
      },
    );

    expect(whosInRowSpy).toBeCalledWith(
      expect.objectContaining({
        name: userStateStub.user.firstName,
        profilePictureURI: userStateStub.user.profilePicUrl,
        timeSlot: 'am',
        isCurrentUser: true,
      }),
      {},
    );
  });

  // TODO: this should not be tested by mock calls. The Row is rendered, or mock called, before it is sorted.
  it.skip(' the who is in section is ordered alphabetically by name', async () => {
    const {getByText} = render(
      <WhosIn
        bookings={[
          {
            id: 'id1',
            userId: 'userId1',
            date: '2023-05-11T00:00:00Z',
            timeSlot: TimeSlot.allDay,
            bookingType: BookingType.personal,
            spaceType: SpaceType.desk,
            isReserveSpace: false,
            createdAt: 0,
            updatedAt: 0,
          },
          {
            id: 'id3',
            userId: 'userId3',
            date: '2023-05-11T00:00:00Z',
            timeSlot: TimeSlot.allDay,
            bookingType: BookingType.personal,
            spaceType: SpaceType.desk,
            isReserveSpace: false,
            createdAt: 0,
            updatedAt: 0,
          },
          {
            id: 'id2',
            userId: 'userId2',
            date: '2023-05-11T00:00:00Z',
            timeSlot: TimeSlot.allDay,
            bookingType: BookingType.personal,
            spaceType: SpaceType.desk,
            isReserveSpace: false,
            createdAt: 0,
            updatedAt: 0,
          },
        ]}
        userData={mockUserData}
      />,
      {
        preloadedState: {
          selectedDayOptions: {
            selectedDay: '2023-06-26',
            selectedSpaceType: SpaceType.desk,
          },
          user: userStateStub,
        },
      },
    );

    expect(whosInRowSpy).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        name: 'Alfie',
        profilePictureURI: 'profilePictureURI2',
        timeSlot: 'allDay',
        isCurrentUser: false,
      }),
      {},
    );
    expect(whosInRowSpy).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        name: 'Barry',
        profilePictureURI: 'profilePictureURI3',
        timeSlot: 'allDay',
        isCurrentUser: false,
      }),
      {},
    );
    expect(whosInRowSpy).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        name: 'Zane',
        profilePictureURI: 'profilePictureURI1',
        timeSlot: 'allDay',
        isCurrentUser: true,
      }),
      {},
    );
    expect(getByText('3 ANDis')).toBeTruthy();
  });
  it('shows the correct text when no rows are present', async () => {
    const {getByText} = render(
      <WhosIn bookings={[]} userData={mockUserData} />,
    );

    await waitFor(() => {
      expect(getByText('Be the first to book a desk space!')).toBeTruthy();
    });
    expect(whosInRowSpy).toBeCalledTimes(0);
  });

  describe(' when a visitor has booked ', () => {
    it(' the who is in string lists Andi and Visitor totals and a who is in row with visitor name and default image', async () => {
      const {getByText} = render(
        <WhosIn
          bookings={[
            {
              id: 'id2',
              userId: 'userId2',
              date: '2023-05-11T00:00:00Z',
              timeSlot: TimeSlot.allDay,
              bookingType: BookingType.personal,
              spaceType: SpaceType.desk,
              isReserveSpace: false,
              createdAt: 0,
              updatedAt: 0,
            },
            {
              id: 'id2',
              userId: 'userId2',
              date: '2023-05-11T00:00:00Z',
              timeSlot: TimeSlot.am,
              bookingType: BookingType.guest,
              spaceType: SpaceType.desk,
              isReserveSpace: false,
              createdAt: 0,
              updatedAt: 0,
            },
          ]}
          userData={mockUserData}
        />,
        {
          preloadedState: {
            selectedDayOptions: {
              selectedDay: '2023-06-26',
              selectedSpaceType: SpaceType.desk,
            },
            user: userStateStub,
          },
        },
      );

      expect(whosInRowSpy).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          name: 'Alfie',
          profilePictureURI: 'profilePictureURI2',
          timeSlot: 'allDay',
          isCurrentUser: false,
        }),
        {},
      );
      expect(whosInRowSpy).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          name: "Alfie's Visitor 1",
          profilePictureURI: undefined,
          timeSlot: 'am',
          isCurrentUser: false,
        }),
        {},
      );
      expect(getByText('1 ANDi + 1 visitor')).toBeTruthy();
    });
  });

  describe(' when multiple visitors have booked ', () => {
    it(' the who is in string lists Andi and Visitor totals and the visitor names increment correctly', async () => {
      const {getByText} = render(
        <WhosIn
          bookings={[
            {
              id: 'id2',
              userId: 'userId2',
              date: '2023-05-11T00:00:00Z',
              timeSlot: TimeSlot.allDay,
              bookingType: BookingType.personal,
              spaceType: SpaceType.desk,
              isReserveSpace: false,
              createdAt: 0,
              updatedAt: 0,
            },
            {
              id: 'id2',
              userId: 'userId2',
              date: '2023-05-11T00:00:00Z',
              timeSlot: TimeSlot.am,
              bookingType: BookingType.guest,
              spaceType: SpaceType.desk,
              isReserveSpace: false,
              createdAt: 0,
              updatedAt: 0,
            },
            {
              id: 'id2',
              userId: 'userId2',
              date: '2023-05-11T00:00:00Z',
              timeSlot: TimeSlot.pm,
              bookingType: BookingType.guest,
              spaceType: SpaceType.desk,
              isReserveSpace: false,
              createdAt: 0,
              updatedAt: 0,
            },
            {
              id: 'id3',
              userId: 'userId3',
              date: '2023-05-11T00:00:00Z',
              timeSlot: TimeSlot.allDay,
              bookingType: BookingType.personal,
              spaceType: SpaceType.desk,
              isReserveSpace: false,
              createdAt: 0,
              updatedAt: 0,
            },
            {
              id: 'id3',
              userId: 'userId3',
              date: '2023-05-11T00:00:00Z',
              timeSlot: TimeSlot.am,
              bookingType: BookingType.guest,
              spaceType: SpaceType.desk,
              isReserveSpace: false,
              createdAt: 0,
              updatedAt: 0,
            },
          ]}
          userData={mockUserData}
        />,
        {
          preloadedState: {
            selectedDayOptions: {
              selectedDay: '2023-06-26',
              selectedSpaceType: SpaceType.desk,
            },
            user: userStateStub,
          },
        },
      );

      expect(whosInRowSpy).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          name: 'Alfie',
          profilePictureURI: 'profilePictureURI2',
          timeSlot: 'allDay',
          isCurrentUser: false,
          isReserveSpace: false,
          spaceType: 'desk',
          reserveListPosition: undefined,
        }),
        {},
      );
      expect(whosInRowSpy).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          name: "Alfie's Visitor 1",
          profilePictureURI: undefined,
          timeSlot: 'am',
          isCurrentUser: false,
          isReserveSpace: false,
          spaceType: 'desk',
          reserveListPosition: undefined,
        }),
        {},
      );
      expect(whosInRowSpy).toHaveBeenNthCalledWith(
        3,
        expect.objectContaining({
          name: "Alfie's Visitor 2",
          profilePictureURI: undefined,
          timeSlot: 'pm',
          isCurrentUser: false,
          isReserveSpace: false,
          spaceType: 'desk',
          reserveListPosition: undefined,
        }),
        {},
      );
      expect(whosInRowSpy).toHaveBeenNthCalledWith(
        4,
        expect.objectContaining({
          name: 'Barry',
          profilePictureURI: 'profilePictureURI3',
          timeSlot: 'allDay',
          isCurrentUser: false,
          isReserveSpace: false,
          spaceType: 'desk',
          reserveListPosition: undefined,
        }),
        {},
      );
      expect(whosInRowSpy).toHaveBeenNthCalledWith(
        5,
        expect.objectContaining({
          name: "Barry's Visitor 1",
          profilePictureURI: undefined,
          timeSlot: 'am',
          isCurrentUser: false,
          isReserveSpace: false,
          spaceType: 'desk',
          reserveListPosition: undefined,
        }),
        {},
      );
      expect(getByText('2 ANDis + 3 visitors')).toBeTruthy();
    });
  });

  describe('When some users are on reserve list', () => {
    it('Calculates the position in on the reserve list correctly', async () => {
      const {getByText} = render(
        <WhosIn
          bookings={[
            {
              id: '1',
              userId: 'userId2',
              date: '2023-05-11T00:00:00Z',
              timeSlot: TimeSlot.allDay,
              bookingType: BookingType.personal,
              spaceType: SpaceType.desk,
              isReserveSpace: false,
              createdAt: 0,
              updatedAt: 0,
            },
            {
              id: '2',
              userId: 'userId2',
              date: '2023-05-11T00:00:00Z',
              timeSlot: TimeSlot.am,
              bookingType: BookingType.guest,
              spaceType: SpaceType.desk,
              isReserveSpace: true,
              createdAt: 2, // Second on list
              updatedAt: 2,
            },
            {
              id: '3',
              userId: 'userId2',
              date: '2023-05-11T00:00:00Z',
              timeSlot: TimeSlot.pm,
              bookingType: BookingType.guest,
              spaceType: SpaceType.desk,
              isReserveSpace: true,
              createdAt: 3, // Third on list
              updatedAt: 3,
            },
            {
              id: '4',
              userId: 'userId3',
              date: '2023-05-11T00:00:00Z',
              timeSlot: TimeSlot.allDay,
              bookingType: BookingType.personal,
              spaceType: SpaceType.desk,
              isReserveSpace: true,
              createdAt: 1, // First on list
              updatedAt: 1,
            },
            {
              id: '5',
              userId: 'userId3',
              date: '2023-05-11T00:00:00Z',
              timeSlot: TimeSlot.am,
              bookingType: BookingType.guest,
              spaceType: SpaceType.desk,
              isReserveSpace: false,
              createdAt: 0,
              updatedAt: 0,
            },
          ]}
          userData={mockUserData}
        />,
        {
          preloadedState: {
            selectedDayOptions: {
              selectedDay: '2023-06-26',
              selectedSpaceType: SpaceType.desk,
            },
            user: userStateStub,
          },
        },
      );
      expect(whosInRowSpy).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          name: 'Alfie',
          profilePictureURI: 'profilePictureURI2',
          timeSlot: 'allDay',
          isCurrentUser: false,
          isReserveSpace: false,
          spaceType: 'desk',
          reserveListPosition: undefined,
        }),
        {},
      );
      expect(whosInRowSpy).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          name: "Alfie's Visitor 1",
          profilePictureURI: undefined,
          timeSlot: 'am',
          isCurrentUser: false,
          isReserveSpace: true,
          spaceType: 'desk',
          reserveListPosition: 2,
        }),
        {},
      );
      expect(whosInRowSpy).toHaveBeenNthCalledWith(
        3,
        expect.objectContaining({
          name: "Alfie's Visitor 2",
          profilePictureURI: undefined,
          timeSlot: 'pm',
          isCurrentUser: false,
          isReserveSpace: true,
          spaceType: 'desk',
          reserveListPosition: 3,
        }),
        {},
      );
      expect(whosInRowSpy).toHaveBeenNthCalledWith(
        4,
        expect.objectContaining({
          name: 'Barry',
          profilePictureURI: 'profilePictureURI3',
          timeSlot: 'allDay',
          isCurrentUser: false,
          isReserveSpace: true,
          spaceType: 'desk',
          reserveListPosition: 1,
        }),
        {},
      );
      expect(whosInRowSpy).toHaveBeenNthCalledWith(
        5,
        expect.objectContaining({
          name: "Barry's Visitor 1",
          profilePictureURI: undefined,
          timeSlot: 'am',
          isCurrentUser: false,
          isReserveSpace: false,
          spaceType: 'desk',
          reserveListPosition: undefined,
        }),
        {},
      );
      expect(getByText('2 ANDis + 3 visitors')).toBeTruthy();
    });
  });
});
