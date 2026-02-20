import admin from 'firebase-admin';
import {BookingEdit, Booking} from '../../Models/booking.model';
import {
  increaseRemainingCapacity,
  reduceRemainingCapacity,
} from '../../utils/CapacityUtils/CapacityUtils';
import {chunkQuery} from '../../utils/FirebaseUtils/FirebaseUtils';
import {parseBooking} from '../../utils/ParserUtil';
import {checkBookingCapacity} from '../DeskCapacity/checkBookingCapacity';
import {assignEmptySpacesToReserved} from './assignEmptySpacesToReserved';
import {getFirestoreUser, getServerTime} from './firebaseAdminService';
import createError from 'http-errors';
import {isCorrectFunction} from '../../utils/IsCorrectFunction';
import {constructError} from '../../utils/ErrorUtil';
import {Config} from '../../Config';

const collectionName = 'bookings';

export async function editExistingBookings(
  edits: BookingEdit[],
  userId: string,
  config: Config,
) {
  const db = admin.firestore();
  const ref = db.collection(collectionName);
  const batch = db.batch();
  const bookingIds = edits.map(edit => edit.bookingId);
  const unparsedBookings = await chunkQuery<Booking>(ref, 'id', bookingIds);
  const bookings = unparsedBookings.map(booking => ({
    docRef: booking.docRef,
    data: parseBooking(booking.data),
  }));
  if (bookings.length === 0) {
    throw constructError(
      new createError.BadRequest(),
      'No bookings could be found for given Ids',
    );
  }
  const bookingDatesAreIdentical = bookings.every(
    booking => booking.data.date === bookings[0].data.date,
  );
  if (!bookingDatesAreIdentical) {
    throw constructError(
      new createError.BadRequest(),
      'Edits are on different days',
    );
  }
  const bookingSpaceTypesAreIdentical = bookings.every(
    booking => booking.data.spaceType === bookings[0].data.spaceType,
  );
  if (!bookingSpaceTypesAreIdentical) {
    throw constructError(
      new createError.BadRequest(),
      'Edits are for different space types',
    );
  }
  if (!isCorrectFunction(bookings[0].data.spaceType)) {
    const httpError = new createError.Forbidden();
    httpError.message = JSON.stringify({
      message:
        'Incorrect function being used. Car bookings should use the car api and desk bookings should use the desk api',
    });
    throw httpError;
  }
  const bookingsBelongToOneUser = bookings.every(
    booking => booking.data.userId === bookings[0].data.userId,
  );

  if (!bookingsBelongToOneUser) {
    throw constructError(
      new createError.BadRequest(),
      'Edits are for different users',
    );
  }

  const user = await getFirestoreUser(bookings[0].data.userId);

  let remainingCapacity = await checkBookingCapacity(
    bookings[0].data.date,
    bookings[0].data.spaceType,
    user.businessUnit,
    config,
  );

  for (const edit of edits) {
    const booking = bookings.find(value => value.data.id === edit.bookingId);
    const bookingData = booking?.data;
    if (!booking || !bookingData) {
      throw constructError(
        new createError.BadRequest(),
        'Booking does not exist',
        edit.bookingId,
      );
    }
    if (userId !== bookingData.userId) {
      throw constructError(
        new createError.Forbidden(),
        'Forbidden from editing, no bookings were edited as a result',
        edit.bookingId,
      );
    }
    if (edit.newTimeSlot !== bookingData.timeSlot) {
      remainingCapacity = increaseRemainingCapacity(
        remainingCapacity,
        bookingData.timeSlot,
      );
      if (
        remainingCapacity[edit.newTimeSlot] <= 0 &&
        !bookingData.isReserveSpace
      ) {
        batch.update(booking.docRef, {
          isReserveSpace: true,
          timeSlot: edit.newTimeSlot,
          updatedAt: getServerTime(),
        });
      } else {
        batch.update(booking.docRef, {
          timeSlot: edit.newTimeSlot,
          updatedAt: getServerTime(),
        });
        remainingCapacity = reduceRemainingCapacity(
          remainingCapacity,
          edit.newTimeSlot,
        );
      }
    }
  }
  try {
    await batch.commit();
  } catch (error) {
    console.log(error);
  }
  await assignEmptySpacesToReserved(
    remainingCapacity,
    bookings[0].data.date,
    bookings[0].data.spaceType,
    user.businessUnit,
  );
}
