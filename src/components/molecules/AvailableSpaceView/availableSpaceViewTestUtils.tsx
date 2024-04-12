import Booking, {BookingType, SpaceType, TimeSlot} from '@customTypes/booking';
import {AvailableSpacesOption} from '@customTypes';

export const testBookingsPersonal: Booking[] = [
  {
    bookingType: BookingType.personal,
    createdAt: 1687869713,
    date: '2023-06-27T00:00:00Z',
    id: 'testBookingIdPersonalDesk',
    isReserveSpace: false,
    spaceType: SpaceType.desk,
    timeSlot: TimeSlot.allDay,
    updatedAt: 1687869713,
    userId: 'testUserId',
  },
];

export const testBookingsGuest: Booking[] = [
  {
    bookingType: BookingType.guest,
    createdAt: 1687869713,
    date: '2023-06-27T00:00:00Z',
    id: 'testBookingIdGuestDesk-1',
    isReserveSpace: false,
    spaceType: SpaceType.desk,
    timeSlot: TimeSlot.allDay,
    updatedAt: 1687869713,
    userId: 'testUserId',
  },
  {
    bookingType: BookingType.guest,
    createdAt: 1687869713,
    date: '2023-06-27T00:00:00Z',
    id: 'testBookingIdGuestDesk-2',
    isReserveSpace: false,
    spaceType: SpaceType.desk,
    timeSlot: TimeSlot.allDay,
    updatedAt: 1687869713,
    userId: 'testUserId',
  },
  {
    bookingType: BookingType.guest,
    createdAt: 1687869713,
    date: '2023-06-27T00:00:00Z',
    id: 'testBookingIdGuestDesk-3',
    isReserveSpace: false,
    spaceType: SpaceType.desk,
    timeSlot: TimeSlot.allDay,
    updatedAt: 1687869713,
    userId: 'testUserId',
  },
];

export const testOptions: AvailableSpacesOption[] = [
  {
    id: 1,
    heading: 'All Day',
    spaceLeft: 36,
    timeSlot: TimeSlot.allDay,
    isSelected: false,
    isBooked: false,
  },
  {
    id: 2,
    heading: 'Morning',
    spaceLeft: 36,
    timeSlot: TimeSlot.am,
    isSelected: false,
    isBooked: false,
  },
  {
    id: 3,
    heading: 'Afternoon',
    spaceLeft: 36,
    timeSlot: TimeSlot.pm,
    isSelected: false,
    isBooked: false,
  },
];

export const personalDeskProps = {
  bookingType: BookingType.personal,
  spaceType: SpaceType.desk,
  relevantBookings: [],
  showGuestSpaces: false,
  canBookGuests: true,
  toggleDisplayGuestBooking: jest.fn(),
  capacity: 36,
  remainingOptions: testOptions,
  userId: 'testUserId',
};

export const personalCarProps = {
  bookingType: BookingType.personal,
  spaceType: SpaceType.car,
  relevantBookings: [],
  showGuestSpaces: false,
  canBookGuests: false,
  toggleDisplayGuestBooking: jest.fn(),
  capacity: 36,
  remainingOptions: testOptions,
  userId: 'testUserId',
};

export const adminCarProps = {
  bookingType: BookingType.personal,
  spaceType: SpaceType.car,
  relevantBookings: [],
  showGuestSpaces: false,
  canBookGuests: true,
  toggleDisplayGuestBooking: jest.fn(),
  capacity: 36,
  remainingOptions: testOptions,
  userId: 'testUserId',
};

export const guestDeskProps = {
  bookingType: BookingType.guest,
  spaceType: SpaceType.desk,
  relevantBookings: [],
  showGuestSpaces: true,
  canBookGuests: true,
  toggleDisplayGuestBooking: jest.fn(),
  capacity: 36,
  remainingOptions: testOptions,
  userId: 'testUserId',
};
