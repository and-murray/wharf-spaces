import React from 'react';
import {act, render} from '@testing-library/react-native';
import AvailableSpaceView from '@molecules/AvailableSpaceView/AvailableSpaceView';
import {TestWrapper} from '@components/TestWrapper';
import {
  guestDeskProps,
  personalDeskProps,
  testBookingsGuest,
  testBookingsPersonal,
  testOptions,
  personalCarProps,
  adminCarProps,
} from '@molecules/AvailableSpaceView/availableSpaceViewTestUtils';
import Booking, {BookingType, SpaceType, TimeSlot} from '@customTypes/booking';
import * as DayTimeSelector from '@atoms/DayTimeSelector/DayTimeSelector';
import * as Warning from '@atoms/Warning/Warning';
import * as BookButton from '@atoms/BookButton/BookButton';
import * as hooks from '@state/utils/hooks';
import * as selectedDayOptions from '@state/reducers/selectedDayOptionsSlice';
import * as UserProfileSection from '@molecules/UserProfileSection/UserProfileSection';
import * as Counter from '@atoms/Counter/Counter';
import * as AlertMessage from '@atoms/AlertMessage/AlertMessage';
import * as SimpleInfoMessage from '@atoms/SimpleInfoIMessage/SimpleInfoMessage';
import * as MurrayButton from '@atoms/MurrayButton/MurrayButton';
import {parseGluestackComponentStyleProps} from '@root/src/util/GluestackUtils/GluestackUtils';

const guestWithBookingsProps = {
  ...guestDeskProps,
  relevantBookings: testBookingsGuest,
};

const personalWithBookingsProps = {
  ...personalDeskProps,
  relevantBookings: testBookingsPersonal,
};
const useAppSelectorSpy = jest.spyOn(hooks, 'useAppSelector');
const deleteBookingsSpy = jest.spyOn(selectedDayOptions, 'deleteBookings');
const dayTimeSelectorSpy = jest.spyOn(DayTimeSelector, 'default');
const postBookingsSpy = jest.spyOn(selectedDayOptions, 'postBookings');
const editBookingsSpy = jest.spyOn(selectedDayOptions, 'editBookings');
const bookButtonSpy = jest.spyOn(BookButton, 'default');
const warningSpy = jest.spyOn(Warning, 'default');
const userProfileSectionSpy = jest.spyOn(UserProfileSection, 'default');
const counterSpy = jest.spyOn(Counter, 'default');
const alertMessageSpy = jest.spyOn(AlertMessage, 'default');
const simpleInfoIMessageSpy = jest.spyOn(SimpleInfoMessage, 'default');
const murrayButtonSpy = jest.spyOn(MurrayButton, 'default');

describe('When AvailableSpaceView is on the screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAppSelectorSpy.mockReturnValue({
      selectedDayOptions: {
        selectedDay: '2023-07-05T00:00:00Z',
        selectedTimeSlot: '',
        selectedSpaceType: SpaceType.desk,
      },
      user: {activeBookings: [[], []], user: {id: 'testUserId'}},
      firebaseRemoteConfig: {deskCapacity: 36},
    });
    dayTimeSelectorSpy.mockReturnValue(<></>);
    bookButtonSpy.mockReturnValue(<></>);
    warningSpy.mockReturnValue(<></>);
    userProfileSectionSpy.mockReturnValue(<></>);
    counterSpy.mockReturnValue(<></>);
    alertMessageSpy.mockReturnValue(<></>);
    simpleInfoIMessageSpy.mockReturnValue(<></>);
    murrayButtonSpy.mockReturnValue(<></>);
  });

  describe('When an admin is viewing parking', () => {
    it('renders correctly for personal car with no bookings', () => {
      const {queryByTestId} = render(
        <TestWrapper>
          <AvailableSpaceView {...adminCarProps} />
        </TestWrapper>,
      );
      expect(queryByTestId('OpenGuestBooking')).toBeTruthy();
    });
  });

  it('renders correctly for personal desk with no bookings', () => {
    const {getByTestId, getByText} = render(
      <TestWrapper>
        <AvailableSpaceView {...personalDeskProps} />
      </TestWrapper>,
    );

    expect(getByText('Select a time')).toBeTruthy();
    const styleProps = parseGluestackComponentStyleProps(
      getByTestId('AvailableSpaceView').props.style,
    );
    expect(styleProps.borderColor).toBe('#ECECEC');
    expect(dayTimeSelectorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        capacity: 36,
        heading: 'All Day',
        id: 1,
        isBooked: false,
        isSelected: false,
        spaceLeft: 36,
        timeSlot: 'allDay',
      }),
      {},
    );
    expect(dayTimeSelectorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        capacity: 36,
        heading: 'Morning',
        id: 2,
        isBooked: false,
        isSelected: false,
        spaceLeft: 36,
        timeSlot: 'am',
      }),
      {},
    );
    expect(dayTimeSelectorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        capacity: 36,
        heading: 'Afternoon',
        id: 3,
        isBooked: false,
        isSelected: false,
        spaceLeft: 36,
        timeSlot: 'pm',
      }),
      {},
    );
    expect(userProfileSectionSpy).toHaveBeenCalled();
    expect(bookButtonSpy).toHaveBeenCalled();
    expect(getByTestId('OpenGuestBooking')).toBeTruthy();
  });

  it('renders correctly for personal car with no bookings', () => {
    const x = render(
      <TestWrapper>
        <AvailableSpaceView {...personalCarProps} />
      </TestWrapper>,
    );

    const {getByText, queryByTestId} = x;

    expect(getByText('Select a time')).toBeTruthy();
    expect(dayTimeSelectorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        capacity: 36,
        heading: 'All Day',
        id: 1,
        isBooked: false,
        isSelected: false,
        spaceLeft: 36,
        timeSlot: 'allDay',
      }),
      {},
    );
    expect(dayTimeSelectorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        capacity: 36,
        heading: 'Morning',
        id: 2,
        isBooked: false,
        isSelected: false,
        spaceLeft: 36,
        timeSlot: 'am',
      }),
      {},
    );
    expect(dayTimeSelectorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        capacity: 36,
        heading: 'Afternoon',
        id: 3,
        isBooked: false,
        isSelected: false,
        spaceLeft: 36,
        timeSlot: 'pm',
      }),
      {},
    );
    expect(userProfileSectionSpy).toHaveBeenCalled();
    expect(bookButtonSpy).toHaveBeenCalled();
    expect(queryByTestId('OpenGuestBooking')).toBeNull();
  });

  it('renders correctly for guest desk with no bookings', () => {
    const {getByTestId, getByText} = render(
      <TestWrapper>
        <AvailableSpaceView {...guestDeskProps} />
      </TestWrapper>,
    );

    expect(getByTestId('CloseGuestBooking')).toBeTruthy();
    expect(getByText('Select a time')).toBeTruthy();

    expect(dayTimeSelectorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        capacity: 36,
        heading: 'All Day',
        id: 1,
        isBooked: false,
        isSelected: false,
        spaceLeft: 36,
        timeSlot: 'allDay',
      }),
      {},
    );
    expect(dayTimeSelectorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        capacity: 36,
        heading: 'Morning',
        id: 2,
        isBooked: false,
        isSelected: false,
        spaceLeft: 36,
        timeSlot: 'am',
      }),
      {},
    );
    expect(dayTimeSelectorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        capacity: 36,
        heading: 'Afternoon',
        id: 3,
        isBooked: false,
        isSelected: false,
        spaceLeft: 36,
        timeSlot: 'pm',
      }),
      {},
    );
    expect(counterSpy).toHaveBeenCalled();
    expect(bookButtonSpy).toHaveBeenCalled();
  });

  it('does not show you have booked X visitor spaces text when no spaces are booked for visitors', () => {
    const {queryByTestId} = render(
      <TestWrapper>
        <AvailableSpaceView {...guestDeskProps} />
      </TestWrapper>,
    );
    expect(queryByTestId('GuestBookedID')).toBeFalsy();
  });

  it('sets an option to "selected" when clicked and deselects the option when clicked again', () => {
    render(
      <TestWrapper>
        <AvailableSpaceView {...personalDeskProps} />
      </TestWrapper>,
    );

    expect(dayTimeSelectorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 1,
        isSelected: false,
      }),
      {},
    );
    let update = dayTimeSelectorSpy.mock.calls[0][0].update;
    act(() => {
      update(personalDeskProps.remainingOptions[0].id);
    });

    expect(dayTimeSelectorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 1,
        isSelected: true,
      }),
      {},
    );

    act(() => {
      update(personalDeskProps.remainingOptions[0].id);
    });

    expect(dayTimeSelectorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 1,
        isSelected: false,
      }),
      {},
    );
  });

  it('deselects options when a different option is clicked', () => {
    render(
      <TestWrapper>
        <AvailableSpaceView {...personalDeskProps} />
      </TestWrapper>,
    );

    let update = dayTimeSelectorSpy.mock.calls[0][0].update;
    act(() => {
      update(personalDeskProps.remainingOptions[0].id);
    });
    expect(dayTimeSelectorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 1,
        isSelected: true,
      }),
      {},
    );
    expect(dayTimeSelectorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 2,
        isSelected: false,
      }),
      {},
    );
    expect(dayTimeSelectorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 3,
        isSelected: false,
      }),
      {},
    );

    act(() => {
      update(personalDeskProps.remainingOptions[1].id);
    });
    expect(dayTimeSelectorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 1,
        isSelected: false,
      }),
      {},
    );
    expect(dayTimeSelectorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 2,
        isSelected: true,
      }),
      {},
    );
    expect(dayTimeSelectorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 3,
        isSelected: false,
      }),
      {},
    );
  });

  describe('When there are no remaining spaces', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    const noSpacesRemainingOptions = testOptions.map(option => {
      return {
        ...option,
        spaceLeft: 0,
      };
    });
    const noSpacesRemainingProps = {
      ...personalDeskProps,
      remainingOptions: noSpacesRemainingOptions,
    };
    it('renders with a red border when an orange is selected', () => {
      render(
        <TestWrapper>
          <AvailableSpaceView {...noSpacesRemainingProps} />
        </TestWrapper>,
      );
      let update = dayTimeSelectorSpy.mock.calls[0][0].update;
      act(() => {
        update(noSpacesRemainingProps.remainingOptions[0].id);
      });
    });

    it('displays a warning when a full option is selected', () => {
      render(
        <TestWrapper>
          <AvailableSpaceView {...noSpacesRemainingProps} />
        </TestWrapper>,
      );

      let update = dayTimeSelectorSpy.mock.calls[0][0].update;
      act(() => {
        update(noSpacesRemainingProps.remainingOptions[0].id);
      });
      expect(dayTimeSelectorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          isSelected: true,
          spaceLeft: 0,
        }),
        {},
      );
      expect(warningSpy).toHaveBeenCalled();
    });
  });

  describe("When the user hasn't made a booking for that day", () => {
    it('Should disable the booking button until an option is selected', () => {
      render(
        <TestWrapper>
          <AvailableSpaceView {...personalDeskProps} />
        </TestWrapper>,
      );

      expect(bookButtonSpy).toHaveBeenCalledWith(
        expect.objectContaining({isDisabled: true}),
        {},
      );
      let update = dayTimeSelectorSpy.mock.calls[0][0].update;
      act(() => {
        update(personalDeskProps.remainingOptions[0].id);
      });
      expect(bookButtonSpy).toHaveBeenLastCalledWith(
        expect.objectContaining({isDisabled: false}),
        {},
      );
    });

    it('should disable the book button if counter`s input is invalid', () => {
      render(
        <TestWrapper>
          <AvailableSpaceView {...guestDeskProps} />
        </TestWrapper>,
      );
      let update = dayTimeSelectorSpy.mock.calls[0][0].update;
      act(() => {
        update(guestDeskProps.remainingOptions[0].id);
      });
      expect(bookButtonSpy).toHaveBeenCalledWith(
        expect.objectContaining({isDisabled: false}),
        {},
      );
      let setCountValid = counterSpy.mock.calls[0][0].setCountValid;
      act(() => {
        setCountValid(false);
      });
      expect(bookButtonSpy).toHaveBeenLastCalledWith(
        expect.objectContaining({isDisabled: true}),
        {},
      );
    });

    it('calls post a desk booking when an option is selected and book button is pressed', async () => {
      render(
        <TestWrapper>
          <AvailableSpaceView {...personalDeskProps} />
        </TestWrapper>,
      );

      expect(postBookingsSpy).not.toHaveBeenCalled();
      let update = dayTimeSelectorSpy.mock.calls[0][0].update;
      act(() => {
        update(personalDeskProps.remainingOptions[0].id);
      });
      let book = bookButtonSpy.mock.calls[3][0].onPress;
      act(() => {
        book();
      });
      expect(postBookingsSpy).toHaveBeenCalledWith({
        bookingType: 'personal',
        numberOfBookings: 1,
        selectedDay: '2023-07-05T00:00:00Z',
        spaceType: 'desk',
        timeSlot: 'allDay',
        userId: 'testUserId',
      });
    });

    it('calls post a car booking when an option is selected and book button is pressed', () => {
      render(
        <TestWrapper>
          <AvailableSpaceView
            {...{...personalDeskProps, spaceType: SpaceType.car}}
          />
        </TestWrapper>,
      );

      expect(postBookingsSpy).not.toHaveBeenCalled();
      let update = dayTimeSelectorSpy.mock.calls[0][0].update;
      act(() => {
        update(personalDeskProps.remainingOptions[0].id);
      });
      let book = bookButtonSpy.mock.calls[3][0].onPress;
      act(() => {
        book();
      });
      expect(postBookingsSpy).toHaveBeenCalledWith({
        bookingType: 'personal',
        numberOfBookings: 1,
        selectedDay: '2023-07-05T00:00:00Z',
        spaceType: 'car',
        timeSlot: 'allDay',
        userId: 'testUserId',
      });
    });

    it('posts multiple bookings when booking for more than one guest', async () => {
      render(
        <TestWrapper>
          <AvailableSpaceView {...guestDeskProps} />
        </TestWrapper>,
      );

      expect(postBookingsSpy).not.toHaveBeenCalled();
      let update = dayTimeSelectorSpy.mock.calls[0][0].update;
      act(() => {
        update(personalDeskProps.remainingOptions[0].id);
      });
      let onCountChanged = counterSpy.mock.calls[0][0].onCountChanged;
      act(() => {
        onCountChanged(3);
      });
      let book = bookButtonSpy.mock.calls[4][0].onPress;
      act(() => {
        book();
      });
      expect(postBookingsSpy).toHaveBeenCalledWith({
        selectedDay: '2023-07-05T00:00:00Z',
        userId: 'testUserId',
        timeSlot: 'allDay',
        spaceType: 'desk',
        bookingType: 'guest',
        numberOfBookings: 3,
      });
    });
  });

  it('does not post a car booking when user is unknown and book button is pressed and shows error message', () => {
    useAppSelectorSpy.mockReturnValue({
      selectedDayOptions: {
        selectedDay: '2023-07-05T00:00:00Z',
        selectedSpaceType: 'car',
      },
      user: {user: {businessUnit: 'unknown'}},
    });

    render(
      <TestWrapper>
        <AvailableSpaceView
          {...{...personalDeskProps, spaceType: SpaceType.car}}
        />
      </TestWrapper>,
    );

    expect(postBookingsSpy).not.toHaveBeenCalled();
    let update = dayTimeSelectorSpy.mock.calls[0][0].update;
    act(() => {
      update(personalDeskProps.remainingOptions[0].id);
    });
    let book = bookButtonSpy.mock.calls[3][0].onPress;
    act(() => {
      book();
    });
    expect(alertMessageSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        message:
          'Sorry, only Murray and Tenzing users can book a parking spot.',
      }),
      {},
    );
    expect(postBookingsSpy).not.toHaveBeenCalled();
  });

  describe('has booked is true', () => {
    it('opens confirm delete modal when the cancel button is clicked and calls deleteBookings when confirmed', () => {
      render(
        <TestWrapper>
          <AvailableSpaceView {...personalWithBookingsProps} />
        </TestWrapper>,
      );
      expect(alertMessageSpy).not.toHaveBeenCalled();
      let book = bookButtonSpy.mock.calls[2][0].onPress;
      act(() => {
        book();
      });
      expect(alertMessageSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Confirm cancellation',
        }),
        {},
      );
      const confirmCancel =
        alertMessageSpy.mock.calls[0][0].alertConfig.button1.onPress;
      act(() => {
        confirmCancel();
      });
      expect(deleteBookingsSpy).toHaveBeenCalledWith([
        'testBookingIdPersonalDesk',
      ]);
    });

    it('show you have booked X visitor spaces text', () => {
      const {getByText, queryByTestId} = render(
        <TestWrapper>
          <AvailableSpaceView {...guestWithBookingsProps} />
        </TestWrapper>,
      );
      expect(queryByTestId('GuestBookedID')).toBeTruthy();
      expect(getByText('You have booked 3 visitor spaces')).toBeTruthy();
    });

    it('does not call deleteBookings if the confirm cancellation modal is dismissed', () => {
      render(
        <TestWrapper>
          <AvailableSpaceView {...personalWithBookingsProps} />
        </TestWrapper>,
      );

      let book = bookButtonSpy.mock.calls[2][0].onPress;
      act(() => {
        book();
      });
      expect(alertMessageSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          isOpen: true,
        }),
        {},
      );

      const dismissed =
        alertMessageSpy.mock.calls[0][0].alertConfig.button2?.onPress ??
        jest.fn;

      act(() => {
        dismissed();
      });
      expect(deleteBookingsSpy).not.toHaveBeenCalled();
    });

    it('deletes all guest bookings when cancel is clicked', async () => {
      render(
        <TestWrapper>
          <AvailableSpaceView {...guestWithBookingsProps} />
        </TestWrapper>,
      );
      expect(alertMessageSpy).not.toHaveBeenCalledWith(
        expect.objectContaining({
          isOpen: true,
        }),
      );
      const book = bookButtonSpy.mock.calls[2][0].onPress;
      act(() => {
        book();
      });

      expect(alertMessageSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          isOpen: true,
        }),
        {},
      );

      const confirmCancel =
        alertMessageSpy.mock.calls[0][0].alertConfig.button1.onPress;
      act(() => {
        confirmCancel();
      });
      expect(deleteBookingsSpy).toHaveBeenCalledWith([
        'testBookingIdGuestDesk-1',
        'testBookingIdGuestDesk-2',
        'testBookingIdGuestDesk-3',
      ]);
    });

    it('renders correctly for personal desk', () => {
      const {getByTestId, getByText} = render(
        <TestWrapper>
          <AvailableSpaceView {...personalWithBookingsProps} />
        </TestWrapper>,
      );

      expect(getByText('Selected time:')).toBeTruthy();
      expect(getByText("You've Booked!")).toBeTruthy();
      expect(bookButtonSpy).toHaveBeenCalled();
      expect(getByTestId('OpenGuestBooking')).toBeTruthy();
      expect(dayTimeSelectorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          isBooked: true,
        }),
        {},
      );
      expect(dayTimeSelectorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 2,
          isBooked: false,
        }),
        {},
      );
      expect(dayTimeSelectorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 3,
          isBooked: false,
        }),
        {},
      );
    });

    it("shows the same message 'You have Booked!' for personal desk space when booked in commnunal space", () => {
      const personalWithBookingInCommunalProps = {
        ...personalDeskProps,
        SpaceType: SpaceType.desk,
        relevantBookings: [
          {
            ...testBookingsPersonal[0],
            isReserveSpace: true,
            spaceType: SpaceType.desk,
          },
        ] as Booking[],
      };

      const {getByText} = render(
        <TestWrapper>
          <AvailableSpaceView {...personalWithBookingInCommunalProps} />
        </TestWrapper>,
      );

      expect(getByText('Selected time:')).toBeTruthy();
    });

    it('renders correctly for personal car space when booked in waiting list', () => {
      const personalWithBookingInCommunalProps = {
        ...personalDeskProps,
        spaceType: SpaceType.car,
        relevantBookings: [
          {
            ...testBookingsPersonal[0],
            isReserveSpace: true,
            spaceType: SpaceType.car,
          },
        ] as Booking[],
      };

      const {getByTestId, getByText} = render(
        <TestWrapper>
          <AvailableSpaceView {...personalWithBookingInCommunalProps} />
        </TestWrapper>,
      );

      expect(getByText('Selected time:')).toBeTruthy();
      expect(getByText('You’ve booked onto the waiting list.')).toBeTruthy();
      expect(bookButtonSpy).toHaveBeenCalled();
      expect(getByTestId('OpenGuestBooking')).toBeTruthy();
      expect(dayTimeSelectorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          isBooked: true,
          hasBookedCommunal: true,
        }),
        {},
      );
      expect(dayTimeSelectorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 2,
          isBooked: false,
          hasBookedCommunal: false,
        }),
        {},
      );
      expect(dayTimeSelectorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 3,
          isBooked: false,
          hasBookedCommunal: false,
        }),
        {},
      );
    });

    it('renders message correctly for guest car space when booked in waiting list ', () => {
      const guestWithBookingInCommunalProps = {
        ...guestDeskProps,
        spaceType: SpaceType.car,
        relevantBookings: [
          {
            ...testBookingsGuest[0],
            isReserveSpace: true,
            spaceType: SpaceType.car,
          },
        ] as Booking[],
      };

      const {getByTestId, getByText} = render(
        <TestWrapper>
          <AvailableSpaceView {...guestWithBookingInCommunalProps} />
        </TestWrapper>,
      );

      expect(getByText('Selected time:')).toBeTruthy();
      expect(getByText('You’ve booked onto the waiting list.')).toBeTruthy();
      expect(bookButtonSpy).toHaveBeenCalled();
      expect(getByTestId('CloseGuestBooking')).toBeTruthy();
      expect(dayTimeSelectorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          isBooked: true,
          hasBookedCommunal: true,
        }),
        {},
      );
      expect(dayTimeSelectorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 2,
          isBooked: false,
          hasBookedCommunal: false,
        }),
        {},
      );
      expect(dayTimeSelectorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 3,
          isBooked: false,
          hasBookedCommunal: false,
        }),
        {},
      );
    });

    it('renders correctly for guest desk', () => {
      const {getByTestId, getByText} = render(
        <TestWrapper>
          <AvailableSpaceView {...guestWithBookingsProps} />
        </TestWrapper>,
      );

      expect(getByText('Selected time:')).toBeTruthy();
      expect(getByText("You've Booked!")).toBeTruthy();
      expect(bookButtonSpy).toHaveBeenCalled();
      expect(getByTestId('CloseGuestBooking')).toBeTruthy();
      expect(dayTimeSelectorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          isBooked: true,
        }),
        {},
      );
      expect(dayTimeSelectorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 2,
          isBooked: false,
        }),
        {},
      );
      expect(dayTimeSelectorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 3,
          isBooked: false,
        }),
        {},
      );
    });
  });
  describe('Edit Booking', () => {
    const pmId = testOptions.find(option => option.timeSlot === TimeSlot.pm)!!
      .id;

    it('renders correctly when selected non-booked time slot', () => {
      const selectedNonBooked = {
        ...personalDeskProps,
        relevantBookings: testBookingsPersonal,
      };

      const {getByText} = render(
        <TestWrapper>
          <AvailableSpaceView {...selectedNonBooked} />
        </TestWrapper>,
      );

      expect(simpleInfoIMessageSpy).toHaveBeenCalled();
      //equivalent to selection
      const updateFunc = dayTimeSelectorSpy.mock.calls[0][0].update;
      act(() => {
        updateFunc(pmId);
      });
      expect(getByText('Change booking?')).toBeTruthy();
      expect(murrayButtonSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          buttonText: 'Yes',
        }),
        {},
      );
      expect(murrayButtonSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          buttonText: 'No',
        }),
        {},
      );
      expect(dayTimeSelectorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          id: pmId,
          isBooked: false,
          isBookingEditable: true,
          isSelected: true,
        }),
        {},
      );
    });

    it('edit time slot will be requested when select a new slot and clicked yes', () => {
      const selectedNonBooked = {
        ...personalDeskProps,
        relevantBookings: testBookingsPersonal,
      };

      render(
        <TestWrapper>
          <AvailableSpaceView {...selectedNonBooked} />
        </TestWrapper>,
      );

      //equivalent to selection
      const updateFunc = dayTimeSelectorSpy.mock.calls[0][0].update;
      act(() => {
        updateFunc(pmId);
      });
      const editFunc = murrayButtonSpy.mock.calls[0][0].onPress;
      act(() => {
        editFunc();
      });
      expect(editBookingsSpy).toHaveBeenCalledWith(
        expect.arrayContaining([
          {
            bookingId: testBookingsPersonal[0].id,
            newTimeSlot: TimeSlot.pm,
          },
        ]),
      );
    });

    it('edit time slot will not be requested and selection gets reset when select a new slot and clicked no', () => {
      const selectedNonBooked = {
        ...personalDeskProps,
        relevantBookings: testBookingsPersonal,
      };

      const {getByText} = render(
        <TestWrapper>
          <AvailableSpaceView {...selectedNonBooked} />
        </TestWrapper>,
      );

      //equivalent to selection
      const updateFunc = dayTimeSelectorSpy.mock.calls[0][0].update;
      act(() => {
        updateFunc(pmId);
      });
      const editFunc = murrayButtonSpy.mock.calls[1][0].onPress;
      act(() => {
        editFunc();
      });

      expect(getByText("You've Booked!")).toBeTruthy();
      expect(editBookingsSpy).not.toHaveBeenCalledWith(
        expect.arrayContaining([
          {
            bookingId: testBookingsPersonal[0].id,
            newTimeSlot: TimeSlot.pm,
          },
        ]),
      );
    });

    it('should not enable visitor booking edit if visitor booking param enableVistorEdit is false', () => {
      const selectedNonBooked = {
        ...adminCarProps,
        bookingType: BookingType.guest,
        enableVistorEdit: false,
        relevantBookings: testBookingsGuest,
      };

      const {getByText} = render(
        <TestWrapper>
          <AvailableSpaceView {...selectedNonBooked} />
        </TestWrapper>,
      );

      //equivalent to selection
      const updateFunc = dayTimeSelectorSpy.mock.calls[0][0].update;
      act(() => {
        updateFunc(pmId);
      });

      expect(getByText("You've Booked!")).toBeTruthy();
      expect(editBookingsSpy).not.toHaveBeenCalledWith(
        expect.arrayContaining([
          {
            bookingId: testBookingsPersonal[0].id,
            newTimeSlot: TimeSlot.pm,
          },
        ]),
      );
    });

    it('should enable visitor booking edit if visitor booking param enableVistorEdit is true', () => {
      const selectedNonBooked = {
        ...adminCarProps,
        bookingType: BookingType.guest,
        enableVistorEdit: true,
        relevantBookings: testBookingsGuest,
      };

      const {getByText} = render(
        <TestWrapper>
          <AvailableSpaceView {...selectedNonBooked} />
        </TestWrapper>,
      );

      expect(simpleInfoIMessageSpy).toHaveBeenCalled();
      //equivalent to selection
      const updateFunc = dayTimeSelectorSpy.mock.calls[0][0].update;
      act(() => {
        updateFunc(pmId);
      });
      expect(getByText('Change booking?')).toBeTruthy();
      expect(murrayButtonSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          buttonText: 'Yes',
        }),
        {},
      );
      expect(murrayButtonSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          buttonText: 'No',
        }),
        {},
      );
      expect(dayTimeSelectorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          id: pmId,
          isBooked: false,
          isBookingEditable: true,
          isSelected: true,
        }),
        {},
      );
    });
  });
});
