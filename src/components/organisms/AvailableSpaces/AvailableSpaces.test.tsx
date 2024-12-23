import React from 'react';
import {TestWrapper} from '@components/TestWrapper';
import {act, render} from '@testing-library/react-native';
import AvailableSpaces from '@organisms/AvailableSpaces/AvailableSpaces';
import * as useAppSelector from '@state/utils/hooks';
import * as AvailableSpaceView from '@molecules/AvailableSpaceView/AvailableSpaceView';
import * as DateTimeUtils from '@utils/DateTimeUtils/DateTimeUtils';
import Booking, {BookingType, SpaceType, TimeSlot} from '@customTypes/booking';

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
    spaceType: SpaceType.desk,
    isReserveSpace: false,
    userId: 'testUserId2',
    createdAt: 0,
    updatedAt: 0,
    id: 'testId2',
  },
];

const mockUserData = {
  ['testUserId1']: {
    name: 'TestUser1',
    profilePictureURI: 'TestImage1',
    businessUnit: 'murray',
  },
  ['testUserId2']: {
    name: 'TestUser2',
    profilePictureURI: 'TestImage2',
    businessUnit: 'tenzing',
  },
};

const useAppSelectorSpy = jest.spyOn(useAppSelector, 'useAppSelector');
const availableSpaceViewSpy = jest.spyOn(AvailableSpaceView, 'default');
const isCloseToBookingDateSpy = jest.spyOn(
  DateTimeUtils,
  'isCloseToBookingDate',
);
describe('When AvailableSpaces is shown on screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
    availableSpaceViewSpy.mockImplementation();
    isCloseToBookingDateSpy.mockReturnValue(false);
  });

  it('renders correctly', () => {
    const {getByTestId} = render(
      <TestWrapper>
        <AvailableSpaces bookings={[]} userData={{}} />
      </TestWrapper>,
    );

    expect(getByTestId('AvailableSpaces')).toBeTruthy();
  });

  it('displays and hides visitor booking correctly', () => {
    render(
      <TestWrapper>
        <AvailableSpaces bookings={[]} userData={{}} />
      </TestWrapper>,
    );
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
    beforeEach(() => {
      jest.clearAllMocks();
      useAppSelectorSpy.mockReturnValue({
        selectedDayOptions: {selectedSpaceType: 'desk'},
        utils: {
          londonServerTimestamp: '2024-07-05T00:00:00',
          storedDeviceTimestamp: '2024-07-05T00:00:00',
        },
        user: {user: null},
        firebaseRemoteConfig: {deskCapacity: 10, parkingCapacity: 20},
      });
    });
    it('should set capacity to deskCapacity: 10 and space type of desk', () => {
      render(
        <TestWrapper>
          <AvailableSpaces bookings={[]} userData={{}} />
        </TestWrapper>,
      );

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
      render(
        <TestWrapper>
          <AvailableSpaces bookings={[]} userData={{}} />
        </TestWrapper>,
      );

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
      useAppSelectorSpy.mockReturnValue({
        selectedDayOptions: {selectedSpaceType: 'car'},
        user: {user: {businessUnit: 'unknown'}},
        utils: {
          londonServerTimestamp: '2024-07-05T00:00:00',
          storedDeviceTimestamp: '2024-07-05T00:00:00',
        },
        firebaseRemoteConfig: {
          deskCapacity: 10,
          parkingCapacity: {murray: 20, tenzing: 5, adams: 5, unknown: 0},
        },
      });
      render(
        <TestWrapper>
          <AvailableSpaces bookings={[]} userData={{}} />
        </TestWrapper>,
      );

      expect(availableSpaceViewSpy).toBeCalledWith(
        expect.objectContaining({
          capacity: 0,
          spaceType: 'car',
        }),
        {},
      );
    });

    it('should set capacity to combined capacity and space type of car when close to booking date', () => {
      useAppSelectorSpy.mockReturnValue({
        selectedDayOptions: {selectedSpaceType: 'car'},
        user: {user: {businessUnit: 'murray'}},
        utils: {
          londonServerTimestamp: '2024-07-05T00:00:00',
          storedDeviceTimestamp: '2024-07-05T00:00:00',
        },
        firebaseRemoteConfig: {
          deskCapacity: 10,
          parkingCapacity: {murray: 20, tenzing: 5, adams: 5, unknown: 0},
        },
      });
      isCloseToBookingDateSpy.mockReturnValue(true);
      render(
        <TestWrapper>
          <AvailableSpaces bookings={[]} userData={{}} />
        </TestWrapper>,
      );

      expect(availableSpaceViewSpy).toBeCalledWith(
        expect.objectContaining({
          capacity: 30,
          spaceType: 'car',
        }),
        {},
      );
    });

    it('should set capacity to murray capacity and space type of car when not close to booking date and bu is murray', () => {
      useAppSelectorSpy.mockReturnValue({
        selectedDayOptions: {selectedSpaceType: 'car'},
        user: {user: {businessUnit: 'murray'}},
        utils: {
          londonServerTimestamp: '2024-07-05T00:00:00',
          storedDeviceTimestamp: '2024-07-05T00:00:00',
        },
        firebaseRemoteConfig: {
          deskCapacity: 10,
          parkingCapacity: {murray: 20, tenzing: 5, adams: 5, unknown: 0},
        },
      });
      isCloseToBookingDateSpy.mockReturnValue(false);
      render(
        <TestWrapper>
          <AvailableSpaces bookings={[]} userData={{}} />
        </TestWrapper>,
      );

      expect(availableSpaceViewSpy).toBeCalledWith(
        expect.objectContaining({
          capacity: 20,
          spaceType: 'car',
        }),
        {},
      );
    });

    it('should set capacity to tenzing capacity and space type of car when not close to booking date and bu is tenzing', () => {
      useAppSelectorSpy.mockReturnValue({
        selectedDayOptions: {selectedSpaceType: 'car'},
        user: {user: {businessUnit: 'tenzing'}},
        utils: {
          londonServerTimestamp: '2024-07-05T00:00:00',
          storedDeviceTimestamp: '2024-07-05T00:00:00',
        },
        firebaseRemoteConfig: {
          deskCapacity: 10,
          parkingCapacity: {murray: 20, tenzing: 5, adams: 5, unknown: 0},
        },
      });
      isCloseToBookingDateSpy.mockReturnValue(false);
      render(
        <TestWrapper>
          <AvailableSpaces bookings={[]} userData={{}} />
        </TestWrapper>,
      );

      expect(availableSpaceViewSpy).toBeCalledWith(
        expect.objectContaining({
          capacity: 5,
          spaceType: 'car',
        }),
        {},
      );
    });

    it('should set capacity to adams capacity and space type of car when not close to booking date and bu is adams', () => {
      useAppSelectorSpy.mockReturnValue({
        selectedDayOptions: {selectedSpaceType: 'car'},
        user: {user: {businessUnit: 'adams'}},
        utils: {
          londonServerTimestamp: '2024-07-05T00:00:00',
          storedDeviceTimestamp: '2024-07-05T00:00:00',
        },
        firebaseRemoteConfig: {
          deskCapacity: 10,
          parkingCapacity: {murray: 20, tenzing: 5, adams: 5, unknown: 0},
        },
      });
      isCloseToBookingDateSpy.mockReturnValue(false);
      render(
        <TestWrapper>
          <AvailableSpaces bookings={[]} userData={{}} />
        </TestWrapper>,
      );

      expect(availableSpaceViewSpy).toBeCalledWith(
        expect.objectContaining({
          capacity: 5,
          spaceType: 'car',
        }),
        {},
      );
    });

    it('should pass all bookings to AvailableSpaceView when close to booking date', () => {
      useAppSelectorSpy.mockReturnValue({
        selectedDayOptions: {selectedSpaceType: 'car'},
        user: {user: {id: 'testUserId1', businessUnit: 'murray'}},
        utils: {
          londonServerTimestamp: '2024-07-05T00:00:00',
          storedDeviceTimestamp: '2024-07-05T00:00:00',
        },
        firebaseRemoteConfig: {
          deskCapacity: 10,
          parkingCapacity: {murray: 20, tenzing: 5, adams: 5, unknown: 0},
        },
      });
      isCloseToBookingDateSpy.mockReturnValue(true);
      render(
        <TestWrapper>
          <AvailableSpaces bookings={mockBookings} userData={mockUserData} />
        </TestWrapper>,
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
      useAppSelectorSpy.mockReturnValue({
        selectedDayOptions: {selectedSpaceType: 'car'},
        user: {user: {id: 'testUserId1', businessUnit: 'murray'}},
        utils: {
          londonServerTimestamp: '2024-07-05T00:00:00',
          storedDeviceTimestamp: '2024-07-05T00:00:00',
        },
        firebaseRemoteConfig: {
          deskCapacity: 10,
          parkingCapacity: {murray: 20, tenzing: 5, adams: 5, unknown: 0},
        },
      });
      isCloseToBookingDateSpy.mockReturnValue(false);
      render(
        <TestWrapper>
          <AvailableSpaces bookings={mockBookings} userData={mockUserData} />
        </TestWrapper>,
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
      beforeEach(() => {
        jest.clearAllMocks();
        useAppSelectorSpy.mockReturnValue({
          selectedDayOptions: {selectedSpaceType: 'car'},
          user: {user: {businessUnit: 'murray', role: 'admin'}},
          utils: {
            londonServerTimestamp: '2024-07-05T00:00:00',
            storedDeviceTimestamp: '2024-07-05T00:00:00',
          },
          firebaseRemoteConfig: {
            deskCapacity: 10,
            parkingCapacity: {murray: 20},
          },
        });
      });

      it('should set can book guests to true', () => {
        render(
          <TestWrapper>
            <AvailableSpaces bookings={[]} userData={{}} />
          </TestWrapper>,
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
        render(
          <TestWrapper>
            <AvailableSpaces bookings={[]} userData={{}} />
          </TestWrapper>,
        );
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
        useAppSelectorSpy.mockReturnValue({
          selectedDayOptions: {
            selectedDay: '2023-07-05T00:00:00Z',
            selectedSpaceType: 'car',
          },
          user: {user: {businessUnit: 'murray', role: 'user'}},
          utils: {
            londonServerTimestamp: '2024-07-05T00:00:00',
            storedDeviceTimestamp: '2024-07-05T00:00:00',
          },
          firebaseRemoteConfig: {
            deskCapacity: 10,
            parkingCapacity: {murray: 20},
          },
        });
        render(
          <TestWrapper>
            <AvailableSpaces bookings={[]} userData={{}} />
          </TestWrapper>,
        );

        expect(availableSpaceViewSpy).toBeCalledWith(
          expect.objectContaining({
            capacity: 20,
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
      useAppSelectorSpy.mockReturnValue({
        selectedDayOptions: {
          selectedDay: '2023-07-05T00:00:00Z',
          selectedSpaceType: 'car',
        },
        user: {user: {businessUnit: 'unknown'}},
        utils: {
          londonServerTimestamp: '2024-07-05T00:00:00',
          storedDeviceTimestamp: '2024-07-05T00:00:00',
        },
        firebaseRemoteConfig: {
          deskCapacity: 10,
          parkingCapacity: {unknown: 0},
        },
      });
      render(
        <TestWrapper>
          <AvailableSpaces bookings={[]} userData={{}} />
        </TestWrapper>,
      );

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
