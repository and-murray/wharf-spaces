import React from 'react';
import {render, waitFor} from '@testing-library/react-native';
import {TestWrapper} from '../../components/TestWrapper';
import BookingScreen from './BookingScreen';
import * as DeskCalendar from '@organisms/DeskCalendar/DeskCalendar';
import * as EventViewer from '@organisms/EventViewer/EventViewer';
import * as AvailableSpaces from '@organisms/AvailableSpaces/AvailableSpaces';
import * as WhosIn from '@organisms/WhosIn/WhosIn';
import * as BookingsQueryService from '@firebase/firestore/bookingsQueryService';
import * as GetUsers from '@firebase/firestore/getUsers';
import * as SubscribeToNotesCollection from '@firebase/firestore/subscribeToNotesCollection';
import * as useAppSelector from '@state/utils/hooks';
import * as FirebaseUtils from '@utils/FirebaseUtils/FirebaseUtils';
import Booking, {BookingType, SpaceType, TimeSlot} from '@customTypes/booking';
import {ReducedUserData} from '@customTypes';

const mockBookings: Booking[] = [
  {
    date: Date(),
    timeSlot: TimeSlot.allDay,
    bookingType: BookingType.personal,
    spaceType: SpaceType.desk,
    isReserveSpace: false,
    userId: 'testUserId1',
    createdAt: 0,
    updatedAt: 0,
    id: 'testId1',
  },
  {
    date: Date(),
    timeSlot: TimeSlot.allDay,
    bookingType: BookingType.personal,
    spaceType: SpaceType.car,
    isReserveSpace: false,
    userId: 'testUserId2',
    createdAt: 0,
    updatedAt: 0,
    id: 'testId2',
  },
];

const mockUserData: ReducedUserData = {
  ['testUserId1']: {
    name: 'TestUser1',
    profilePictureURI: 'TestImage1',
    businessUnit: 'murray',
  },
};

const deskCalenderSpy = jest.spyOn(DeskCalendar, 'default');
const eventViewerSpy = jest.spyOn(EventViewer, 'default');
const availableSpacesSpy = jest.spyOn(AvailableSpaces, 'default');
const whosInSpy = jest.spyOn(WhosIn, 'default');
const getBookingsOnTheDateSpy = jest.spyOn(
  BookingsQueryService,
  'getBookingsOnTheDate',
);
const getUsersBookedDaysSpy = jest.spyOn(
  BookingsQueryService,
  'getUsersBookedDays',
);
const getUsersSpy = jest.spyOn(GetUsers, 'getUsers');
const subscribeToNotesCollectionSpy = jest.spyOn(
  SubscribeToNotesCollection,
  'default',
);
const useAppSelectorSpy = jest.spyOn(useAppSelector, 'useAppSelector');
const calculateNewUserIdsSpy = jest.spyOn(FirebaseUtils, 'calculateNewUserIds');
jest.mock('@react-native-segmented-control/segmented-control');

describe('When BookingScreen is rendered', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    deskCalenderSpy.mockImplementation();
    eventViewerSpy.mockImplementation();
    availableSpacesSpy.mockImplementation();
    whosInSpy.mockImplementation();
    getBookingsOnTheDateSpy.mockReturnValue(jest.fn());
    getUsersBookedDaysSpy.mockReturnValue(jest.fn());
    getUsersSpy.mockResolvedValue({});
    subscribeToNotesCollectionSpy.mockReturnValue(jest.fn());
    useAppSelectorSpy.mockReturnValue({
      selectedDayOptions: {
        selectedDay: '2024-07-05T00:00:00Z',
        selectedTimeSlot: '',
      },
      utils: {
        londonServerTimestamp: '2024-07-05T00:00:00',
        storedDeviceTimestamp: '2024-07-05T00:00:00',
      },
      user: {activeBookings: [[], []], user: {id: 'testUserId'}},
      firebaseRemoteConfig: {deskCapacity: 36},
    });
    calculateNewUserIdsSpy.mockReturnValue([]);
  });

  it('passes the correct bookings to AvailableSpaceView and WhosInList based on space type', async () => {
    calculateNewUserIdsSpy.mockReturnValue([mockBookings[0].userId]);
    getUsersSpy.mockResolvedValue(mockUserData);
    render(
      <TestWrapper>
        <BookingScreen />
      </TestWrapper>,
    );

    const onSuccess = getBookingsOnTheDateSpy.mock.calls[0][1];
    await waitFor(() => {
      onSuccess(mockBookings);
    });

    expect(availableSpacesSpy).toBeCalledWith(
      expect.objectContaining({
        bookings: [mockBookings[0]],
        userData: mockUserData,
      }),
      {},
    );
    expect(whosInSpy).toBeCalledWith(
      expect.objectContaining({
        bookings: [mockBookings[0]],
        userData: mockUserData,
      }),
      {},
    );
  });
});
