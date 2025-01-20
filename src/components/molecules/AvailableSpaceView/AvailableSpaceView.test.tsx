import React from 'react';
import {act} from '@testing-library/react-native';
import AvailableSpaceView from '@molecules/AvailableSpaceView/AvailableSpaceView';
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
import {BusinessUnit} from '@customTypes/user';
import * as DayTimeSelector from '@atoms/DayTimeSelector/DayTimeSelector';
import * as Warning from '@atoms/Warning/Warning';
import * as BookButton from '@atoms/BookButton/BookButton';
import * as selectedDayOptions from '@state/reducers/selectedDayOptionsSlice';
import * as UserProfileSection from '@molecules/UserProfileSection/UserProfileSection';
import * as Counter from '@atoms/Counter/Counter';
import * as AlertMessage from '@atoms/AlertMessage/AlertMessage';
import * as SimpleInfoMessage from '@atoms/SimpleInfoIMessage/SimpleInfoMessage';
import * as MurrayButton from '@atoms/MurrayButton/MurrayButton';
import {
  firebaseRemoteConfigStub,
  userStateStub,
  userStub,
  utilsStateStub,
} from '@root/src/util/stubs';
import {renderWithProviders as render} from '@root/src/util/test-utils';

const preloadedState = {
  selectedDayOptions: {
    selectedDay: '2024-07-05T00:00:00Z',
    selectedSpaceType: SpaceType.desk,
  },
  user: userStateStub,
  utils: utilsStateStub,
  firebaseRemoteConfig: firebaseRemoteConfigStub,
};

const guestWithBookingsProps = {
  ...guestDeskProps,
  relevantBookings: testBookingsGuest,
};

const personalWithBookingsProps = {
  ...personalDeskProps,
  relevantBookings: testBookingsPersonal,
};
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
        <AvailableSpaceView {...adminCarProps} />,
        {preloadedState},
      );
      expect(queryByTestId('OpenGuestBooking')).toBeTruthy();
    });
  });

  it('renders correctly for personal desk with no bookings', () => {
    const {getByTestId, getByText} = render(
      <AvailableSpaceView {...personalDeskProps} />,
      {preloadedState},
    );

    expect(getByText('Select a time')).toBeTruthy();
    expect(getByTestId('AvailableSpaceView').props.style.borderColor).toBe(
      '#ECECEC',
    );
    expect(dayTimeSelectorSpy).toBeCalledWith(
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
    expect(dayTimeSelectorSpy).toBeCalledWith(
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
    expect(dayTimeSelectorSpy).toBeCalledWith(
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
    const {getByTestId, getByText, queryByTestId} = render(
      <AvailableSpaceView {...personalCarProps} />,
      {preloadedState},
    );

    expect(getByText('Select a time')).toBeTruthy();
    expect(getByTestId('AvailableSpaceView').props.style.borderColor).toBe(
      '#ECECEC',
    );
    expect(dayTimeSelectorSpy).toBeCalledWith(
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
    expect(dayTimeSelectorSpy).toBeCalledWith(
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
    expect(dayTimeSelectorSpy).toBeCalledWith(
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
      <AvailableSpaceView {...guestDeskProps} />,
      {preloadedState},
    );

    expect(getByTestId('CloseGuestBooking')).toBeTruthy();
    expect(getByText('Select a time')).toBeTruthy();
    expect(getByTestId('AvailableSpaceView').props.style.borderColor).toBe(
      '#ECECEC',
    );
    expect(dayTimeSelectorSpy).toBeCalledWith(
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
    expect(dayTimeSelectorSpy).toBeCalledWith(
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
    expect(dayTimeSelectorSpy).toBeCalledWith(
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
    const {queryByTestId} = render(<AvailableSpaceView {...guestDeskProps} />, {
      preloadedState,
    });
    expect(queryByTestId('GuestBookedID')).toBeFalsy();
  });

  it('sets an option to "selected" when clicked and deselects the option when clicked again', () => {
    render(<AvailableSpaceView {...personalDeskProps} />, {preloadedState});

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
    render(<AvailableSpaceView {...personalDeskProps} />, {preloadedState});

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
      const {getByTestId} = render(
        <AvailableSpaceView {...noSpacesRemainingProps} />,
        {preloadedState},
      );
      let update = dayTimeSelectorSpy.mock.calls[0][0].update;
      act(() => {
        update(noSpacesRemainingProps.remainingOptions[0].id);
      });

      expect(getByTestId('AvailableSpaceView').props.style.borderColor).toBe(
        '#ff7900',
      );
    });

    it('displays a warning when a full option is selected', () => {
      render(<AvailableSpaceView {...noSpacesRemainingProps} />, {
        preloadedState,
      });

      let update = dayTimeSelectorSpy.mock.calls[0][0].update;
      act(() => {
        update(noSpacesRemainingProps.remainingOptions[0].id);
      });
      expect(dayTimeSelectorSpy).toBeCalledWith(
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
      render(<AvailableSpaceView {...personalDeskProps} />, {preloadedState});

      expect(bookButtonSpy).toBeCalledWith(
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
      render(<AvailableSpaceView {...guestDeskProps} />, {preloadedState});
      let update = dayTimeSelectorSpy.mock.calls[0][0].update;
      act(() => {
        update(guestDeskProps.remainingOptions[0].id);
      });
      expect(bookButtonSpy).toBeCalledWith(
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
      render(<AvailableSpaceView {...personalDeskProps} />, {preloadedState});

      expect(postBookingsSpy).not.toBeCalled();
      let update = dayTimeSelectorSpy.mock.calls[0][0].update;
      act(() => {
        update(personalDeskProps.remainingOptions[0].id);
      });
      let book = bookButtonSpy.mock.calls[3][0].onPress;
      act(() => {
        book();
      });
      expect(postBookingsSpy).toBeCalledWith({
        bookingType: 'personal',
        numberOfBookings: 1,
        selectedDay: '2024-07-05T00:00:00Z',
        spaceType: 'desk',
        timeSlot: 'allDay',
        userId: '001',
      });
    });

    it('calls post a car booking when an option is selected and book button is pressed', () => {
      render(
        <AvailableSpaceView
          {...{...personalDeskProps, spaceType: SpaceType.car}}
        />,
        {preloadedState},
      );

      expect(postBookingsSpy).not.toBeCalled();
      let update = dayTimeSelectorSpy.mock.calls[0][0].update;
      act(() => {
        update(personalDeskProps.remainingOptions[0].id);
      });
      let book = bookButtonSpy.mock.calls[3][0].onPress;
      act(() => {
        book();
      });
      expect(postBookingsSpy).toBeCalledWith({
        bookingType: 'personal',
        numberOfBookings: 1,
        selectedDay: '2024-07-05T00:00:00Z',
        spaceType: 'car',
        timeSlot: 'allDay',
        userId: '001',
      });
    });

    it('posts multiple bookings when booking for more than one guest', async () => {
      render(<AvailableSpaceView {...guestDeskProps} />, {preloadedState});

      expect(postBookingsSpy).not.toBeCalled();
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
      expect(postBookingsSpy).toBeCalledWith({
        selectedDay: '2024-07-05T00:00:00Z',
        userId: '001',
        timeSlot: 'allDay',
        spaceType: 'desk',
        bookingType: 'guest',
        numberOfBookings: 3,
      });
    });
  });

  it('does not post a car booking when user is unknown and book button is pressed and shows error message', () => {
    render(
      <AvailableSpaceView
        {...{...personalDeskProps, spaceType: SpaceType.car}}
      />,
      {
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
      },
    );

    expect(postBookingsSpy).not.toBeCalled();
    let update = dayTimeSelectorSpy.mock.calls[0][0].update;
    act(() => {
      update(personalDeskProps.remainingOptions[0].id);
    });
    let book = bookButtonSpy.mock.calls[3][0].onPress;
    act(() => {
      book();
    });
    expect(alertMessageSpy).toBeCalledWith(
      expect.objectContaining({
        message:
          'Sorry, only Murray, Adams, and Tenzing users can book a parking spot.',
      }),
      {},
    );
    expect(postBookingsSpy).not.toBeCalled();
  });

  describe('has booked is true', () => {
    it('opens confirm delete modal when the cancel button is clicked and calls deleteBookings when confirmed', () => {
      render(<AvailableSpaceView {...personalWithBookingsProps} />, {
        preloadedState,
      });
      expect(alertMessageSpy).not.toBeCalled();
      let book = bookButtonSpy.mock.calls[2][0].onPress;
      act(() => {
        book();
      });
      expect(alertMessageSpy).toBeCalledWith(
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
      expect(deleteBookingsSpy).toBeCalledWith(['testBookingIdPersonalDesk']);
    });

    it('show you have booked X visitor spaces text', () => {
      const {getByText, queryByTestId} = render(
        <AvailableSpaceView {...guestWithBookingsProps} />,
        {preloadedState},
      );
      expect(queryByTestId('GuestBookedID')).toBeTruthy();
      expect(getByText('You have booked 3 visitor spaces')).toBeTruthy();
    });

    it('does not call deleteBookings if the confirm cancellation modal is dismissed', () => {
      render(<AvailableSpaceView {...personalWithBookingsProps} />, {
        preloadedState,
      });

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
      expect(deleteBookingsSpy).not.toBeCalled();
    });

    it('deletes all guest bookings when cancel is clicked', async () => {
      render(<AvailableSpaceView {...guestWithBookingsProps} />, {
        preloadedState,
      });
      expect(alertMessageSpy).not.toHaveBeenCalledWith(
        expect.objectContaining({
          isOpen: true,
        }),
      );
      const book = bookButtonSpy.mock.calls[1][0].onPress;
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
      expect(deleteBookingsSpy).toBeCalledWith([
        'testBookingIdGuestDesk-1',
        'testBookingIdGuestDesk-2',
        'testBookingIdGuestDesk-3',
      ]);
    });

    it('renders correctly for personal desk', () => {
      const {getByTestId, getByText} = render(
        <AvailableSpaceView {...personalWithBookingsProps} />,
        {preloadedState},
      );

      expect(getByText('Selected time:')).toBeTruthy();
      expect(getByText("You've Booked!")).toBeTruthy();
      expect(bookButtonSpy).toHaveBeenCalled();
      expect(getByTestId('OpenGuestBooking')).toBeTruthy();
      expect(dayTimeSelectorSpy).toBeCalledWith(
        expect.objectContaining({
          id: 1,
          isBooked: true,
        }),
        {},
      );
      expect(dayTimeSelectorSpy).toBeCalledWith(
        expect.objectContaining({
          id: 2,
          isBooked: false,
        }),
        {},
      );
      expect(dayTimeSelectorSpy).toBeCalledWith(
        expect.objectContaining({
          id: 3,
          isBooked: false,
        }),
        {},
      );
      expect(getByTestId('AvailableSpaceView').props.style.borderColor).toBe(
        '#43A813',
      );
      expect(
        getByTestId('AvailableSpaceView').props.style.backgroundColor,
      ).toBe('#43A8131a');
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
        <AvailableSpaceView {...personalWithBookingInCommunalProps} />,
        {preloadedState},
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
        <AvailableSpaceView {...personalWithBookingInCommunalProps} />,
        {preloadedState},
      );

      expect(getByText('Selected time:')).toBeTruthy();
      expect(getByText('You’ve booked onto the waiting list.')).toBeTruthy();
      expect(bookButtonSpy).toHaveBeenCalled();
      expect(getByTestId('OpenGuestBooking')).toBeTruthy();
      expect(dayTimeSelectorSpy).toBeCalledWith(
        expect.objectContaining({
          id: 1,
          isBooked: true,
          hasBookedCommunal: true,
        }),
        {},
      );
      expect(dayTimeSelectorSpy).toBeCalledWith(
        expect.objectContaining({
          id: 2,
          isBooked: false,
          hasBookedCommunal: false,
        }),
        {},
      );
      expect(dayTimeSelectorSpy).toBeCalledWith(
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
        <AvailableSpaceView {...guestWithBookingInCommunalProps} />,
        {preloadedState},
      );

      expect(getByText('Selected time:')).toBeTruthy();
      expect(getByText('You’ve booked onto the waiting list.')).toBeTruthy();
      expect(bookButtonSpy).toHaveBeenCalled();
      expect(getByTestId('CloseGuestBooking')).toBeTruthy();
      expect(dayTimeSelectorSpy).toBeCalledWith(
        expect.objectContaining({
          id: 1,
          isBooked: true,
          hasBookedCommunal: true,
        }),
        {},
      );
      expect(dayTimeSelectorSpy).toBeCalledWith(
        expect.objectContaining({
          id: 2,
          isBooked: false,
          hasBookedCommunal: false,
        }),
        {},
      );
      expect(dayTimeSelectorSpy).toBeCalledWith(
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
        <AvailableSpaceView {...guestWithBookingsProps} />,
        {preloadedState},
      );

      expect(getByText('Selected time:')).toBeTruthy();
      expect(getByText("You've Booked!")).toBeTruthy();
      expect(bookButtonSpy).toHaveBeenCalled();
      expect(getByTestId('CloseGuestBooking')).toBeTruthy();
      expect(dayTimeSelectorSpy).toBeCalledWith(
        expect.objectContaining({
          id: 1,
          isBooked: true,
        }),
        {},
      );
      expect(dayTimeSelectorSpy).toBeCalledWith(
        expect.objectContaining({
          id: 2,
          isBooked: false,
        }),
        {},
      );
      expect(dayTimeSelectorSpy).toBeCalledWith(
        expect.objectContaining({
          id: 3,
          isBooked: false,
        }),
        {},
      );
      expect(getByTestId('AvailableSpaceView').props.style.borderColor).toBe(
        '#43A813',
      );
      expect(
        getByTestId('AvailableSpaceView').props.style.backgroundColor,
      ).toBe('#43A8131a');
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
        <AvailableSpaceView {...selectedNonBooked} />,
        {preloadedState},
      );

      expect(simpleInfoIMessageSpy).toBeCalled();
      //equivalent to selection
      const updateFunc = dayTimeSelectorSpy.mock.calls[0][0].update;
      act(() => {
        updateFunc(pmId);
      });
      expect(getByText('Change booking?')).toBeTruthy();
      expect(murrayButtonSpy).toBeCalledWith(
        expect.objectContaining({
          buttonText: 'Yes',
        }),
        {},
      );
      expect(murrayButtonSpy).toBeCalledWith(
        expect.objectContaining({
          buttonText: 'No',
        }),
        {},
      );
      expect(dayTimeSelectorSpy).toBeCalledWith(
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

      render(<AvailableSpaceView {...selectedNonBooked} />, {preloadedState});

      //equivalent to selection
      const updateFunc = dayTimeSelectorSpy.mock.calls[0][0].update;
      act(() => {
        updateFunc(pmId);
      });
      const editFunc = murrayButtonSpy.mock.calls[0][0].onPress;
      act(() => {
        editFunc();
      });
      expect(editBookingsSpy).toBeCalledWith(
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
        <AvailableSpaceView {...selectedNonBooked} />,
        {preloadedState},
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
      expect(editBookingsSpy).not.toBeCalledWith(
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
        <AvailableSpaceView {...selectedNonBooked} />,
        {preloadedState},
      );

      //equivalent to selection
      const updateFunc = dayTimeSelectorSpy.mock.calls[0][0].update;
      act(() => {
        updateFunc(pmId);
      });

      expect(getByText("You've Booked!")).toBeTruthy();
      expect(editBookingsSpy).not.toBeCalledWith(
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
        <AvailableSpaceView {...selectedNonBooked} />,
        {preloadedState},
      );

      expect(simpleInfoIMessageSpy).toBeCalled();
      //equivalent to selection
      const updateFunc = dayTimeSelectorSpy.mock.calls[0][0].update;
      act(() => {
        updateFunc(pmId);
      });
      expect(getByText('Change booking?')).toBeTruthy();
      expect(murrayButtonSpy).toBeCalledWith(
        expect.objectContaining({
          buttonText: 'Yes',
        }),
        {},
      );
      expect(murrayButtonSpy).toBeCalledWith(
        expect.objectContaining({
          buttonText: 'No',
        }),
        {},
      );
      expect(dayTimeSelectorSpy).toBeCalledWith(
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
