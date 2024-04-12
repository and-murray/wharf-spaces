import React from 'react';
import {TestWrapper} from '@components/TestWrapper';
import {render, waitFor} from '@testing-library/react-native';
import WhosIn from './WhosIn';
import * as WhosInRow from '@molecules/WhosInRow/WhosInRow';
import * as Hooks from '@state/utils/hooks';
import Booking, {TimeSlot, BookingType, SpaceType} from '@customTypes/booking';

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
const mockUser = {
  id: 'userId1',
  firstName: 'john',
  lastName: 'jones',
  email: 'jones',
  profilePicUrl: '1',
  role: 'user',
  businessUnit: 'murray',
};
const useAppSelectorSpy = jest.spyOn(Hooks, 'useAppSelector');
jest.mock('@utils/TimeSlotUtils/TimeSlotUtils', () => ({
  TimeSlotUtils: {
    toString: jest.fn().mockImplementation(timeSlot => timeSlot),
  },
}));

describe('When WhosIn is on screen ', () => {
  describe('For Desk Booking', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      whosInRowSpy.mockImplementation();
      useAppSelectorSpy.mockReturnValue({
        selectedDayOptions: {selectedSpaceType: 'desk'},
        user: {user: {id: 'userId1'}},
      });
    });

    it('Renders Correctly', () => {
      const {getByText} = render(
        <TestWrapper>
          <WhosIn bookings={[]} userData={{}} />
        </TestWrapper>,
      );

      expect(getByText("Who's in?")).toBeTruthy();
      expect(getByText('0 ANDis')).toBeTruthy();
    });

    it('Creates a single standard row correctly', async () => {
      const {getByText} = render(
        <TestWrapper>
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
          />
        </TestWrapper>,
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
        <TestWrapper>
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
          />
        </TestWrapper>,
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
        <TestWrapper>
          <WhosIn
            bookings={[
              {
                id: 'id1',
                userId: 'userId1',
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
          />
        </TestWrapper>,
      );

      expect(whosInRowSpy).toBeCalledWith(
        expect.objectContaining({
          name: 'Zane',
          profilePictureURI: 'profilePictureURI1',
          timeSlot: 'am',
          isCurrentUser: true,
        }),
        {},
      );
    });

    it('shows the correct text when no rows are present', async () => {
      const {getByText} = render(
        <TestWrapper>
          <WhosIn bookings={[]} userData={mockUserData} />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(getByText('Be the first to book a desk space!')).toBeTruthy();
      });
      expect(whosInRowSpy).toBeCalledTimes(0);
    });

    describe(' when a visitor has booked ', () => {
      it(' the who is in string lists Andi and Visitor totals and a who is in row with visitor name and default image', async () => {
        const {getByText} = render(
          <TestWrapper>
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
            />
          </TestWrapper>,
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
          <TestWrapper>
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
            />
          </TestWrapper>,
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
          <TestWrapper>
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
            />
          </TestWrapper>,
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
});

// describe('For Confirmed Car Bookings', () => {
//   beforeEach(() => {
//     whosInRowSpy.mockImplementation();
//     useAppSelectorSpy.mockReturnValue({
//       user: {id: 'userId1'},
//       selectedDayOptions: {selectedSpaceType: 'car'},
//     });
//   });
// });

describe('For Reserve List Car Bookings', () => {
  const bookings: Booking[] = [
    {
      id: 'id1',
      userId: 'userId1',
      date: '2023-05-11T00:00:00Z',
      timeSlot: TimeSlot.allDay,
      bookingType: BookingType.personal,
      spaceType: SpaceType.car,
      isReserveSpace: true,
      createdAt: 3, // should be last
      updatedAt: 0,
    },
    {
      id: 'id3',
      userId: 'userId3',
      date: '2023-05-11T00:00:00Z',
      timeSlot: TimeSlot.allDay,
      bookingType: BookingType.personal,
      spaceType: SpaceType.car,
      isReserveSpace: true,
      createdAt: 1, //should be first
      updatedAt: 0,
    },
    {
      id: 'id2',
      userId: 'userId2',
      date: '2023-05-11T00:00:00Z',
      timeSlot: TimeSlot.allDay,
      bookingType: BookingType.personal,
      spaceType: SpaceType.car,
      isReserveSpace: true,
      createdAt: 2, //should be 2nd
      updatedAt: 0,
    },
  ];
  beforeEach(() => {
    jest.clearAllMocks();
    whosInRowSpy.mockImplementation();
    useAppSelectorSpy.mockReturnValue({
      user: {user: mockUser},
      selectedDayOptions: {selectedSpaceType: 'car'},
    });
  });

  it('Renders Correctly', async () => {
    const {getByText} = render(
      <TestWrapper>
        <WhosIn bookings={bookings} userData={mockUserData} />
      </TestWrapper>,
    );

    expect(getByText("Who's waiting?")).toBeTruthy();
    expect(getByText('3 ANDis')).toBeTruthy();
  });

  it('correctly orders the whos in list by waiting list position', async () => {
    const {getByText} = render(
      <TestWrapper>
        <WhosIn bookings={bookings} userData={mockUserData} />
      </TestWrapper>,
    );

    expect(whosInRowSpy).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        name: 'Barry',
        profilePictureURI: 'profilePictureURI3',
        timeSlot: 'allDay',
        isCurrentUser: false,
      }),
      {},
    );
    expect(whosInRowSpy).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        name: 'Alfie',
        profilePictureURI: 'profilePictureURI2',
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
});
