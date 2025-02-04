import admin from 'firebase-admin';
import {Timestamp} from 'firebase-admin/firestore';
import {SpaceType, BusinessUnit, Booking} from '../../Models/booking.model';
import {isBookingDateLimitedToBU} from '../../utils/BookingUtils/BookingUtils';
import {reduceRemainingCapacity} from '../../utils/CapacityUtils/CapacityUtils';
import {BookingCapacity} from '../DeskCapacity/checkBookingCapacity';
import {BOOKING_CAR_REASSIGNED_MESSAGE} from './Notifications';
import {getServerTime} from './firebaseAdminService';
import sendNotifications from './firebaseMessagingService';
import {getReserveBookings} from './getReserveBookings';
import {getUsersFromBookings} from './getUsersFromBookings';
import {canUpdateBooking} from '../../utils/CanUpdateBooking/canUpdateBooking';

/**
 * Tries to reassign people on the reserve list to empty capacity. Will only do exact matches.
 * @param capacity The remaining capacity that can be assigned
 * @param date The date the capacity refers to
 * @param spaceType The space type the capacity refers to
 * @param businessUnit The business unit the capacity refers to
 * @result Returns true if edits took place, false if not
 */
export async function assignEmptySpacesToReserved(
  capacity: BookingCapacity,
  date: string,
  spaceType: SpaceType,
  businessUnit: BusinessUnit | undefined,
) {
  const bookingMap = await getReserveBookings(date, spaceType);
  let bookings: Booking[] = bookingMap.map(object => {
    return object.data;
  });
  if (bookings.length === 0) {
    return false;
  }
  const isLimitedToBU = isBookingDateLimitedToBU(date);

  if (spaceType === SpaceType.Enum.car && isLimitedToBU) {
    if (!businessUnit) {
      return false;
    }
    const users = await getUsersFromBookings(bookings);
    const relevantBUUsers = users.filter(user => {
      return user.businessUnit === businessUnit;
    });
    const relevantBUUserIds: string[] = relevantBUUsers.map(user => {
      return user.id;
    });
    // Sets the bookings array that are valid for an update to be ones from the correct BU
    bookings = bookings.filter(booking => {
      return relevantBUUserIds.includes(booking.userId);
    });
  }

  // Sort the bookings such the first created booking is first in the array
  const orderedBookings = bookings.sort(
    (a: Booking, b: Booking) =>
      (a.createdAt as Timestamp).toMillis() -
      (b.createdAt as Timestamp).toMillis(),
  );
  const db = admin.firestore();
  const batch = db.batch();
  const updatedCarBookings: Booking[] = [];
  let anEditTookPlace = false;
  orderedBookings.forEach(booking => {
    const bookingFromMap = bookingMap.find(
      value => value.data.id === booking.id,
    );
    const docRef = bookingFromMap?.docRef;
    const shouldUpdateBooking = canUpdateBooking(booking, capacity);
    if (shouldUpdateBooking.shouldUpdate && docRef) {
      batch.update(docRef, {
        isReserveSpace: false,
        updatedAt: getServerTime(),
      });
      capacity = reduceRemainingCapacity(
        capacity,
        shouldUpdateBooking.timeSlot,
      );
      anEditTookPlace = true;
      if (spaceType === SpaceType.Enum.car) {
        updatedCarBookings.push(booking);
      }
    }
  });
  await batch.commit();

  updatedCarBookings.forEach(booking => {
    sendNotifications(
      () => BOOKING_CAR_REASSIGNED_MESSAGE(booking),
      [booking.userId],
    );
  });
  return anEditTookPlace;
}
