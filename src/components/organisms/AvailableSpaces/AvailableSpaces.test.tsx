import React from 'react';
import {act} from '@testing-library/react-native';
import AvailableSpaces from '@organisms/AvailableSpaces/AvailableSpaces';
import * as AvailableSpaceView from '@molecules/AvailableSpaceView/AvailableSpaceView';
import * as DateTimeUtils from '@utils/DateTimeUtils/DateTimeUtils';
import Booking, {BookingType, SpaceType, TimeSlot} from '@customTypes/booking';
import {renderWithProviders as render} from '@root/src/util/test-utils';
import {
  firebaseRemoteConfigStub,
  userStateStub,
  userStub,
  utilsStateStub,
} from '@root/src/util/stubs';
import {BusinessUnit, Role} from '@root/src/types/user';

const preloadedState = {
  selectedDayOptions: {
    selectedDay: '2024-07-05T00:00:00Z',
    selectedSpaceType: SpaceType.desk,
  },
  user: userStateStub,
  utils: utilsStateStub,
  firebaseRemoteConfig: firebaseRemoteConfigStub,
};

const mockBookings: Booking[] = [
  {
    date: Date(),
    timeSlot: TimeSlot.allDay,
    bookingType: BookingType.personal,
    spaceType: SpaceType.desk,
    isReserveSpace: false,
    userId: '001',
    createdAt: 0,
    updatedAt: 0,
    id: 'testId1',
  },
  {
    date: Date(),
    timeSlot: TimeSlot.allDay,
    bookingType: BookingType.personal,
    spaceType: SpaceType.desk,
    isReserveSpace: false,
    userId: '002',
    createdAt: 0,
    updatedAt: 0,
    id: 'testId2',
  },
];

const mockUserData = {
  ['001']: {
    name: `${userStub.firstName} ${userStub.lastName}`,
    profilePictureURI: userStub.profilePicUrl,
    businessUnit: userStub.businessUnit,
  },
  ['002']: {
    name: 'TestUser2',
    profilePictureURI: 'TestImage2',
    businessUnit: 'tenzing',
  },
};

const availableSpaceViewSpy = jest.spyOn(AvailableSpaceView, 'default');
const isCloseToBookingDateSpy = jest.spyOn(
  DateTimeUtils,
  'isCloseToBookingDate',
);

describe('When AvailableSpaces is shown on screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    availableSpaceViewSpy.mockImplementation();
    isCloseToBookingDateSpy.mockReturnValue(false);
  });

  it('renders correctly', () => {
    const {getByTestId} = render(
      <AvailableSpaces bookings={[]} userData={{}} />,
      {preloadedState},
    );

    expect(getByTestId('AvailableSpaces')).toBeTruthy();
  });

  it('displays and hides visitor booking correctly', () => {
    render(<AvailableSpaces bookings={[]} userData={{}} />, {preloadedState});
    let availableSpaceViewInstanceProps =
      availableSpaceViewSpy.mock.calls[0][0];
    expect(availableSpaceViewInstanceProps.showGuestSpaces).toBeFalsy();
    act(() => {
      availableSpaceViewInstanceProps.toggleDisplayGuestBooking();
    });
    availableSpaceViewInstanceProps = availableSpaceViewSpy.mock.calls[2][0];
    expect(availableSpaceViewInstanceProps.showGuestSpaces).toBeTruthy();
    act(() => {
      availableSpaceViewInstanceProps.toggleDisplayGuestBooking();
    });
    availableSpaceViewInstanceProps = availableSpaceViewSpy.mock.calls[4][0];
    expect(availableSpaceViewInstanceProps.showGuestSpaces).toBeFalsy();
  });

  describe('and desk is selected on the segment control', () => {
    it('should set capacity to deskCapacity: 10 and space type of desk', () => {
      render(<AvailableSpaces bookings={[]} userData={{}} />, {preloadedState});

      expect(availableSpaceViewSpy).toBeCalledWith(
        expect.objectContaining({
          capacity: 10,
          spaceType: 'desk',
          canBookGuests: true,
        }),
        {},
      );
    });

    it('should show visitor AvailableSpaceView component and enableVistorEdit set to false', () => {
      render(<AvailableSpaces bookings={[]} userData={{}} />, {preloadedState});

      const toggleFunc =
        availableSpaceViewSpy.mock.calls[0][0].toggleDisplayGuestBooking;
      act(() => {
        toggleFunc();
      });

      expect(availableSpaceViewSpy).toBeCalledWith(
        expect.objectContaining({
          capacity: 10,
          spaceType: 'desk',
          bookingType: BookingType.guest,
          enableVistorEdit: false,
        }),
        {},
      );
    });
  });

  describe('and car is selected on the segment control', () => {
    it('should set capacity to unknown capacity and space type of car when bu is unknown', () => {
      render(<AvailableSpaces bookings={[]} userData={{}} />, {
        preloadedState: {
          ...preloadedState,
          selectedDayOptions: {
            selectedDay: '2024-07-05T00:00:00Z',
            selectedSpaceType: SpaceType.car,
          },
          user: {
            activeBookingDates: [],
            user: {
              ...userStub,
              businessUnit: BusinessUnit.unknown,
            },
          },
        },
      });

      expect(availableSpaceViewSpy).toBeCalledWith(
        expect.objectContaining({
          capacity: 0,
          spaceType: 'car',
        }),
        {},
      );
    });

    it('should set capacity to combined capacity and space type of car when close to booking date', () => {
      isCloseToBookingDateSpy.mockReturnValue(true);
      render(<AvailableSpaces bookings={[]} userData={{}} />, {
        preloadedState: {
          ...preloadedState,
          selectedDayOptions: {
            selectedDay: '2024-07-05T00:00:00Z',
            selectedSpaceType: SpaceType.car,
          },
        },
      });

      expect(availableSpaceViewSpy).toBeCalledWith(
        expect.objectContaining({
          capacity: 30,
          spaceType: 'car',
        }),
        {},
      );
    });

    it('should set capacity to murray capacity and space type of car when not close to booking date and bu is murray', () => {
      isCloseToBookingDateSpy.mockReturnValue(false);
      render(<AvailableSpaces bookings={[]} userData={{}} />, {
        preloadedState: {
          ...preloadedState,
          selectedDayOptions: {
            selectedDay: '2024-07-05T00:00:00Z',
            selectedSpaceType: SpaceType.car,
          },
        },
      });

      expect(availableSpaceViewSpy).toBeCalledWith(
        expect.objectContaining({
          capacity: 20,
          spaceType: 'car',
        }),
        {},
      );
    });

    it('should set capacity to tenzing capacity and space type of car when not close to booking date and bu is tenzing', () => {
      isCloseToBookingDateSpy.mockReturnValue(false);
      render(<AvailableSpaces bookings={[]} userData={{}} />, {
        preloadedState: {
          ...preloadedState,
          user: {
            user: {
              ...userStub,
              businessUnit: BusinessUnit.tenzing,
            },
            activeBookingDates: [],
          },
          selectedDayOptions: {
            selectedDay: '2024-07-05T00:00:00Z',
            selectedSpaceType: SpaceType.car,
          },
        },
      });

      expect(availableSpaceViewSpy).toBeCalledWith(
        expect.objectContaining({
          capacity: 5,
          spaceType: 'car',
        }),
        {},
      );
    });

    it('should set capacity to adams capacity and space type of car when not close to booking date and bu is adams', () => {
      isCloseToBookingDateSpy.mockReturnValue(false);
      render(<AvailableSpaces bookings={[]} userData={{}} />, {
        preloadedState: {
          ...preloadedState,
          selectedDayOptions: {
            selectedDay: '2024-07-05T00:00:00Z',
            selectedSpaceType: SpaceType.car,
          },
          user: {
            activeBookingDates: [],
            user: {
              ...userStub,
              businessUnit: BusinessUnit.adams,
            },
          },
        },
      });

      expect(availableSpaceViewSpy).toBeCalledWith(
        expect.objectContaining({
          capacity: 5,
          spaceType: 'car',
        }),
        {},
      );
    });

    it('should pass all bookings to AvailableSpaceView when close to booking date', () => {
      isCloseToBookingDateSpy.mockReturnValue(true);
      render(
        <AvailableSpaces bookings={mockBookings} userData={mockUserData} />,
        {
          preloadedState: {
            ...preloadedState,
            selectedDayOptions: {
              selectedDay: '2024-07-05T00:00:00Z',
              selectedSpaceType: SpaceType.car,
            },
          },
        },
      );

      expect(availableSpaceViewSpy).toBeCalledWith(
        expect.objectContaining({
          remainingOptions: [
            {
              heading: 'All Day',
              id: 1,
              isBooked: false,
              isSelected: false,
              spaceLeft: 28,
              timeSlot: 'allDay',
            },
            {
              heading: 'AM',
              id: 2,
              isBooked: false,
              isSelected: false,
              spaceLeft: 28,
              timeSlot: 'am',
            },
            {
              heading: 'PM',
              id: 3,
              isBooked: false,
              isSelected: false,
              spaceLeft: 28,
              timeSlot: 'pm',
            },
          ],
        }),
        {},
      );
    });

    it('should pass relevant bookings to users bu to AvailableSpaceView when not close to booking date', () => {
      isCloseToBookingDateSpy.mockReturnValue(false);
      render(
        <AvailableSpaces bookings={mockBookings} userData={mockUserData} />,
        {
          preloadedState: {
            ...preloadedState,
            selectedDayOptions: {
              selectedDay: '2024-07-05T00:00:00Z',
              selectedSpaceType: SpaceType.car,
            },
          },
        },
      );

      expect(availableSpaceViewSpy).toBeCalledWith(
        expect.objectContaining({
          remainingOptions: [
            {
              heading: 'All Day',
              id: 1,
              isBooked: false,
              isSelected: false,
              spaceLeft: 19,
              timeSlot: 'allDay',
            },
            {
              heading: 'AM',
              id: 2,
              isBooked: false,
              isSelected: false,
              spaceLeft: 19,
              timeSlot: 'am',
            },
            {
              heading: 'PM',
              id: 3,
              isBooked: false,
              isSelected: false,
              spaceLeft: 19,
              timeSlot: 'pm',
            },
          ],
        }),
        {},
      );
    });

    describe('an admin is viewing the screen', () => {
      it('should set can book guests to true', () => {
        render(
          <AvailableSpaces bookings={mockBookings} userData={mockUserData} />,
          {
            preloadedState: {
              ...preloadedState,
              user: {
                activeBookingDates: [],
                user: {...userStub, role: Role.admin},
              },
              selectedDayOptions: {
                selectedDay: '2024-07-05T00:00:00Z',
                selectedSpaceType: SpaceType.car,
              },
            },
          },
        );
        expect(availableSpaceViewSpy).toBeCalledWith(
          expect.objectContaining({
            capacity: 20,
            spaceType: 'car',
            canBookGuests: true,
          }),
          {},
        );
      });

      it('should show visitor AvailableSpaceView component and enableVistorEdit set to true', () => {
        render(<AvailableSpaces bookings={[]} userData={{}} />, {
          preloadedState: {
            ...preloadedState,
            user: {
              activeBookingDates: [],
              user: {...userStub, role: Role.admin},
            },
            selectedDayOptions: {
              selectedDay: '2024-07-05T00:00:00Z',
              selectedSpaceType: SpaceType.car,
            },
          },
        });
        const toggleFunc =
          availableSpaceViewSpy.mock.calls[0][0].toggleDisplayGuestBooking;
        act(() => {
          toggleFunc();
        });

        expect(availableSpaceViewSpy).toBeCalledWith(
          expect.objectContaining({
            capacity: 20,
            spaceType: 'car',
            bookingType: BookingType.guest,
            enableVistorEdit: true,
          }),
          {},
        );
      });
    });

    describe('a none admin is viewing the screen', () => {
      it('should set can book guests to false', () => {
        render(<AvailableSpaces bookings={[]} userData={{}} />, {
          preloadedState: {
            ...preloadedState,
            selectedDayOptions: {
              selectedDay: '2024-07-05T00:00:00Z',
              selectedSpaceType: SpaceType.car,
            },
          },
        });

        expect(availableSpaceViewSpy).toBeCalledWith(
          expect.objectContaining({
            spaceType: 'car',
            canBookGuests: false,
          }),
          {},
        );
      });
    });
  });

  describe('and car is selected on the segment control as an unknown user', () => {
    it('should set capacity to parkingCapacity: 0 and space type of car', () => {
      render(<AvailableSpaces bookings={[]} userData={{}} />, {
        preloadedState: {
          ...preloadedState,
          user: {
            user: {
              ...userStub,
              businessUnit: BusinessUnit.unknown,
            },
            activeBookingDates: [],
          },
          selectedDayOptions: {
            selectedDay: '2024-07-05T00:00:00Z',
            selectedSpaceType: SpaceType.car,
          },
        },
      });

      expect(availableSpaceViewSpy).toBeCalledWith(
        expect.objectContaining({
          capacity: 0,
          spaceType: 'car',
        }),
        {},
      );
    });
  });
});
