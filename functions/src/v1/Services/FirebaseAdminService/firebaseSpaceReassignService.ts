import admin from 'firebase-admin';
import {
  Booking,
  BusinessUnit,
  SpaceType,
  User,
} from '../../Models/booking.model';
import {CollectionName} from '../CollectionName';
import {parseBooking} from '../../utils/ParserUtil';
import {distinctFieldValues} from '../../utils/ArrayUtils/ArrayUtils';
import sendNotifications from './firebaseMessagingService';
import {
  BOOKING_CAR_REASSIGNED_MESSAGE,
  BOOKING_CAR_REASSIGN_AVAILABLE_MESSAGE,
} from './Notifications';
import {isBookingDateLimitedToBU} from '../../utils/BookingUtils/BookingUtils';
import {getFirestoreUser} from './firebaseAdminService';
import {
  findCarAssignables,
  findDeskAssignables,
  Reassignables,
  FreeSlot,
} from '../../utils/SpaceReassignUtils/SpaceReassignUtils';
import {checkBookingCapacity} from '../DeskCapacity/checkBookingCapacity';

/**
 * Goes through the deleted bookings and extract out free time slots that are now assignable to the bookings in reserved space.
 *
 * @param deleted
 * @returns true if found and assigned free slot to reserved or false otherwise
 */
export async function assignSpacesToReserved(deleted: Booking[]) {
  const nonReservedBookings = deleted.filter(
    booking => !booking.isReserveSpace,
  );
  if (nonReservedBookings.length === 0) {
    return false;
  }

  const spaceTypes = distinctFieldValues(
    nonReservedBookings,
    (item: Booking) => item.spaceType,
  );
  // Making sure only bookings with one space type are handled
  if (spaceTypes.length !== 1) {
    return false;
  }

  const deletedBookingUserIds = distinctFieldValues(
    nonReservedBookings,
    (item: Booking) => item.userId,
  );
  // Making sure only deleted bookings belong to the same user
  if (deletedBookingUserIds.length !== 1) {
    return false;
  }

  const spaceType = spaceTypes[0];
  const user = await getFirestoreUser(deletedBookingUserIds[0]);

  const freeSlots: FreeSlot[] = [];
  /**  Amending freeslot functionality due to issues with allDay reservations
   * FreeSlots previously were only taking into account the timeSlot of the actual deletion
   * whereas it was not calculation for any possible other availabilities that could also be caused
   * such as if a pm slot is deleted then an allDay could potentially be available for a reserve to take
   */
  for (let i = 0; i < deleted.length; i++) {
    const remainingCapacity = await checkBookingCapacity(
      deleted[i].date,
      deleted[i].spaceType,
      user.businessUnit,
    );
    freeSlots.push({...remainingCapacity, date: deleted[i].date});
  }

  const queryDates = distinctFieldValues(
    deleted,
    deletedBooking => deletedBooking.date,
  );

  const db = admin.firestore();
  const docs = (
    await db
      .collection(CollectionName.bookings)
      .where('date', 'in', queryDates)
      .where('isReserveSpace', '==', true)
      .where('spaceType', '==', spaceType)
      .get()
  ).docs;

  if (docs.length === 0) {
    return false;
  }

  const bookingMap = new Map(
    docs.map(doc => {
      const booking = parseBooking(doc.data());
      return [booking, doc.ref];
    }),
  );
  const bookings = Array.from(bookingMap.keys());

  let reassignables: Reassignables;
  if (spaceType === SpaceType.Enum.car) {
    if (!user) {
      return false;
    }
    const prioritizedUsers = await getPrioritizedBUUsers(
      bookings,
      user.businessUnit,
    );

    reassignables = findCarAssignables(
      freeSlots,
      bookings,
      user.businessUnit,
      prioritizedUsers,
    );
  } else {
    reassignables = findDeskAssignables(freeSlots, bookings);
  }

  const batch = db.batch();
  reassignables.bookings.forEach(booking => {
    const bookingRef = bookingMap.get(booking);
    if (bookingRef) {
      batch.update(bookingRef, {isReserveSpace: false});
      if (spaceType === SpaceType.Enum.car) {
        sendNotifications(
          () => BOOKING_CAR_REASSIGNED_MESSAGE(booking),
          [booking.userId],
        );
      }
    }
  });
  batch.commit();

  reassignables.notifications?.forEach(n => {
    sendNotifications(
      () => BOOKING_CAR_REASSIGN_AVAILABLE_MESSAGE(n.date, n.slot),
      n.userIds,
    );
  });
  return true;
}

const getPrioritizedBUUsers = async (
  bookings: Booking[],
  businessUnit: BusinessUnit,
) => {
  const userMap: Map<string, User> = new Map();
  const bookingsForPriotisedUser = bookings.filter(booking =>
    isBookingDateLimitedToBU(booking.date),
  );
  if (bookingsForPriotisedUser.length > 0) {
    const prioritizedUserIds = distinctFieldValues(
      bookingsForPriotisedUser,
      (item: Booking) => item.userId,
    );
    (
      await admin
        .firestore()
        .collection(CollectionName.users)
        .where('id', 'in', prioritizedUserIds)
        .where('businessUnit', '==', businessUnit)
        .get()
    ).docs.forEach(doc => {
      const user = User.parse(doc.data());
      userMap.set(user.id, user);
    });
  }

  return userMap;
};
