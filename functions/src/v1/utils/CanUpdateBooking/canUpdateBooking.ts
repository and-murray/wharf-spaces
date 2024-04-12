import {Booking, TimeSlot} from '../../Models/booking.model';
import {BookingCapacity} from '../../Services/DeskCapacity/checkBookingCapacity';

/**
 * Determine if we can update a booking. Only returns true if there is an exact opening matching the booking. E.g Booking is for AM and we have AM capacity. It won't return true if the booking is All Day and we have an AM slot available.
 * @param booking The booking that we wish to try update
 * @param capacity The capacity we are comparing against
 * @returns An object containing a boolean if we should update and the time slot it relates to from the booking.
 */
export function canUpdateBooking(
  booking: Booking,
  capacity: BookingCapacity,
): {shouldUpdate: boolean; timeSlot: TimeSlot} {
  switch (booking.timeSlot) {
    case TimeSlot.Enum.am:
      if (capacity.am > 0) {
        return {shouldUpdate: true, timeSlot: TimeSlot.Enum.am};
      }
      break;
    case TimeSlot.Enum.pm:
      if (capacity.pm > 0) {
        return {shouldUpdate: true, timeSlot: TimeSlot.Enum.pm};
      }
      break;
    case TimeSlot.Enum.allDay:
      if (capacity.allDay > 0) {
        return {shouldUpdate: true, timeSlot: TimeSlot.Enum.allDay};
      }
      break;
  }
  return {shouldUpdate: false, timeSlot: TimeSlot.enum.allDay};
}
