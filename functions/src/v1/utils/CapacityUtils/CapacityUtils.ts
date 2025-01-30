import {TimeSlot} from '../../Models/booking.model';
import {BookingCapacity} from '../../Services/DeskCapacity/checkBookingCapacity';

/**
 * Removes a booking to the capacity resulting in an increased capacity given the timeslot that has been added.
 * @param remainingCapacity The remaining capacity in which to perform the calculations on.
 * @param timeSlot The timeslot of the booking that has been removed
 * @returns A modified remaining capacity object. This will have increased capacity because we have removed a booking.
 */
export function increaseRemainingCapacity(
  remainingCapacity: BookingCapacity,
  timeSlot: TimeSlot,
): BookingCapacity {
  remainingCapacity[timeSlot] += 1;
  if (timeSlot === 'allDay') {
    remainingCapacity.am += 1;
    remainingCapacity.pm += 1;
  }
  remainingCapacity.allDay = Math.max(
    remainingCapacity.allDay,
    Math.min(remainingCapacity.am, remainingCapacity.pm),
  );
  return remainingCapacity;
}

/**
 * Adds a booking to the capacity resulting in a reduced capacity given the timeslot that has been added.
 * @param remainingCapacity The remaining capacity in which to perform the calculations on.
 * @param timeSlot The timeslot of the booking that has been added
 * @returns A modified remaining capacity object. This will have decreased capacity because we have added a booking.
 */
export function reduceRemainingCapacity(
  remainingCapacity: BookingCapacity,
  timeSlot: TimeSlot,
): BookingCapacity {
  remainingCapacity[timeSlot] -= 1;
  if (timeSlot === 'allDay') {
    remainingCapacity.am -= 1;
    remainingCapacity.pm -= 1;
  }
  remainingCapacity.allDay = Math.min(
    remainingCapacity.allDay,
    remainingCapacity[timeSlot],
  );
  return remainingCapacity;
}
