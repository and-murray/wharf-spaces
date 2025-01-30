import React from 'react';
import {waitFor} from '@testing-library/react-native';
import BookingScreen from './BookingScreen';
import * as DeskCalendar from '@organisms/DeskCalendar/DeskCalendar';
import * as EventViewer from '@organisms/EventViewer/EventViewer';
import * as AvailableSpaces from '@organisms/AvailableSpaces/AvailableSpaces';
import * as WhosIn from '@organisms/WhosIn/WhosIn';
import * as BookingsQueryService from '@firebase/firestore/bookingsQueryService';
import * as GetUsers from '@firebase/firestore/getUsers';
import * as SubscribeToNotesCollection from '@firebase/firestore/subscribeToNotesCollection';
import * as FirebaseUtils from '@utils/FirebaseUtils/FirebaseUtils';
import Booking, {BookingType, SpaceType, TimeSlot} from '@customTypes/booking';
import {ReducedUserData} from '@customTypes';
import {renderWithProviders as render} from '@root/src/util/test-utils';
import {BusinessUnit, Role} from '@root/src/types/user';
import {Timestamp} from '@google-cloud/firestore';

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
    calculateNewUserIdsSpy.mockReturnValue([]);
  });

  it('passes the correct bookings to AvailableSpaceView and WhosInList based on space type', async () => {
    calculateNewUserIdsSpy.mockReturnValue([mockBookings[0].userId]);
    getUsersSpy.mockResolvedValue(mockUserData);

    render(<BookingScreen />, {
      preloadedState: {
        selectedDayOptions: {
          selectedDay: '2024-07-05T00:00:00Z',
          selectedSpaceType: SpaceType.desk,
        },
        utils: {
          londonServerTimestamp: '2024-07-05T00:00:00',
          storedDeviceTimestamp: '2024-07-05T00:00:00',
        },
        user: {
          activeBookingDates: [],
          user: {
            id: 'testUserId1',
            firstName: 'john',
            lastName: 'jones',
            email: 'jones',
            profilePicUrl: 'TestImage1',
            role: Role.user,
            businessUnit: BusinessUnit.murray,
            createdAt: undefined as unknown as Timestamp, // real Timestamp value is non-serializable
            updatedAt: undefined as unknown as Timestamp, // using undefined to avoid error
          },
        },
        firebaseRemoteConfig: {
          isDemoLoginEnabled: false,
          deskCapacity: 36,
          parkingCapacity: {
            murray: 10,
            tenzing: 4,
            unknown: 0,
            adams: 5,
          },
          featureFlags: undefined,
        },
      },
    });

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
