import admin from 'firebase-admin';
import {FieldValue} from 'firebase-admin/firestore';
import {Booking, User} from '../../Models/booking.model';
import createError from 'http-errors';
import {parseBooking} from '../../utils/ParserUtil';
import {CollectionName} from '../CollectionName';
import {isCorrectFunction} from '../../utils/IsCorrectFunction';
import {chunkQuery} from '../../utils/FirebaseUtils/FirebaseUtils';
import {constructError} from '../../utils/ErrorUtil';

const collectionName = 'bookings';

export function sendToBookings(bookings: Booking[]) {
  const db = admin.firestore();
  const batch = db.batch();
  bookings.forEach(booking => {
    const docRef = db.collection(collectionName).doc(booking.id);
    batch.set(docRef, booking);
  });
  batch.commit();
}

export async function deleteBookings(bookingIds: string[], userId: string) {
  const db = admin.firestore();
  const ref = db.collection(collectionName);
  const batch = db.batch();
  const deletedBookings: Booking[] = [];
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
  const bookingSpaceTypesAreIdentical = bookings.every(
    booking => booking.data.spaceType === bookings[0].data.spaceType,
  );
  if (!bookingSpaceTypesAreIdentical) {
    throw constructError(
      new createError.BadRequest(),
      'Deletes are for different space types',
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
      'Bookings are for different users',
    );
  }

  if (userId !== bookings[0].data.userId) {
    const httpError = new createError.Forbidden();
    httpError.message = JSON.stringify({
      message: 'Forbidden from deleting, no bookings were deleted as a result',
    });
    throw httpError;
  }
  bookings.forEach(doc => {
    const booking = doc.data;
    if (userId !== booking.userId) {
      const httpError = new createError.Forbidden();
      httpError.message = JSON.stringify({
        message:
          'Forbidden from deleting, no bookings were deleted as a result',
        failedId: booking.id,
      });
      throw httpError;
    }
    bookingIds = bookingIds.filter(item => item !== booking.id);
    batch.delete(doc.docRef);
    deletedBookings.push(booking);
  });
  if (bookingIds.length === 0) {
    console.log('Batch commit called');
    await batch.commit();
    return deletedBookings;
  } else {
    const httpError = new createError.NotFound();
    httpError.message = JSON.stringify({
      message:
        'Failed to find at least one id, no bookings were deleted as a result.',
      failedIds: bookingIds,
    });
    throw httpError;
  }
}

export async function getFirestoreUser(uid: string): Promise<User> {
  const db = admin.firestore();
  const ref = db.collection(CollectionName.users);
  const userDoc = await ref.doc(uid).get();
  return User.parse(userDoc.data());
}

export function getServerTime(): FieldValue {
  return FieldValue.serverTimestamp();
}
