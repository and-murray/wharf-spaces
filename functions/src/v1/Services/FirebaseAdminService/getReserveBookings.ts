import {DocumentReference} from 'firebase-admin/firestore';
import {SpaceType, Booking} from '../../Models/booking.model';
import {CollectionName} from '../CollectionName';
import {parseBooking} from '../../utils/ParserUtil';
import admin from 'firebase-admin';
import {sanitiseDate} from '../../utils/DateTimeUtils';
import dayjs from 'dayjs';

export async function getReserveBookings(
  date: string,
  spaceType: SpaceType,
): Promise<{docRef: DocumentReference; data: Booking}[]> {
  const db = admin.firestore();
  const midnightDate = sanitiseDate(dayjs(date)).format(
    'YYYY-MM-DDT00:00:00[Z]',
  );
  const docs = (
    await db
      .collection(CollectionName.bookings)
      .where('date', '==', midnightDate)
      .where('isReserveSpace', '==', true)
      .where('spaceType', '==', spaceType)
      .get()
  ).docs;
  return docs.map(doc => ({
    docRef: doc.ref,
    data: parseBooking(doc.data()),
  }));
}
