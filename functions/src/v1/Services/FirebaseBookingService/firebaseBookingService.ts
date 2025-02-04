import admin from 'firebase-admin';
import {Booking, SpaceType} from '../../Models/booking.model';

const collectionName = 'bookings';
export async function getNonReservedBookingsOnDate(
  date: string,
  spaceType: SpaceType,
): Promise<Booking[]> {
  const db = admin.firestore();
  const ref = db.collection(collectionName);
  const bookingData: Booking[] = [];
  try {
    // Search for all bookings where they are of the same date as that trying to be booked
    const snapshot = await ref
      .where('date', '==', date)
      .where('spaceType', '==', spaceType)
      .where('isReserveSpace', '==', false)
      .get();
    snapshot.forEach(booking => {
      // Create a cumulative total of all bookings made on specified date
      bookingData.push(booking.data() as Booking);
    });
  } catch (error) {
    throw new Error('Invalid Date Selection ' + error);
  }
  return bookingData;
}
