import {Booking, TimeSlot} from '../../../Models/booking.model';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
dayjs.extend(advancedFormat);

const displayTimeSlotString = (timeSlot: TimeSlot): string => {
  switch (timeSlot) {
    case TimeSlot.Enum.allDay:
      return 'All Day';
    case TimeSlot.Enum.am:
      return 'Morning';
    case TimeSlot.Enum.pm:
      return 'Afternoon';
  }
};

export const BOOKING_CAR_REASSIGNED_MESSAGE = (booking: Booking) => ({
  notification: {
    title: 'Car park booking updated',
    body: `You’re no longer on the waiting list! Your ${displayTimeSlotString(
      booking.timeSlot,
    )} booking for ${dayjs(booking.date).format(
      'MMMM Do',
    )} has now been confirmed. See you soon! 🚗`,
  },
});

export const BOOKING_CAR_REASSIGN_AVAILABLE_MESSAGE = (
  date: string,
  slot: 'am' | 'pm',
) => ({
  notification: {
    title: 'Car park booking updated',
    body: `You’re currently on the waiting list for ${dayjs(date).format(
      'MMMM Do',
    )} for a ${slot.toLocaleUpperCase()} slot, however a space for an ${displayTimeSlotString(
      slot,
    )} slot has become available! Update your booking on the app before it goes!`,
  },
});
