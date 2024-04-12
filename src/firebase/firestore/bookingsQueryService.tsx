import {Booking} from '@customTypes/.';
import {db} from './Database';
import {CollectionName} from './CollectionName';
import {getTodaysUTCDateMidnightString} from '@utils/DateTimeUtils/DateTimeUtils';

export const getBookingsOnTheDate = (
  date: string,
  onSuccess: (bookings: Booking[]) => void,
  onError?: (error: Error) => void,
) => getBookings(date, onSuccess, onError);

/**
 *
 * @param date format: yyyy-MM-ddTHH:MM:SSZ
 * @param onSuccess callback that gets updates when detected changes in bookings' snapshot
 * @param onError error callback
 * @returns unsubscriber - Function object that stop listening to the bookings' snapshot
 */
const getBookings = (
  date: string,
  onSuccess: (bookings: Booking[]) => void,
  onError?: (error: Error) => void,
): (() => void) => {
  return db
    .collection(CollectionName.bookings)
    .where('date', '==', date)
    .onSnapshot(qSnapshot => {
      if (!qSnapshot) {
        onSuccess([]);
      }
      const bookings = qSnapshot.docs.map(doc => {
        const booking = doc.data();
        return {
          ...booking,
          updatedAt: booking.updatedAt.seconds,
          createdAt: booking.createdAt.seconds,
        } as Booking;
      });
      onSuccess(bookings);
    }, onError);
};

/**
 *
 * @param spaceType the current user's id
 * @param onSuccess callback that gets updates when detected changes in bookings' snapshot
 * @returns unsubscriber - Function object that stop listening to the bookings' snapshot
 */
export const getUsersBookedDays = (
  userId: string,
  onSuccess: (activeBookingDates: string[]) => void,
) =>
  db
    .collection(CollectionName.bookings)
    .where('date', '>=', getTodaysUTCDateMidnightString())
    .where('userId', '==', userId)
    .onSnapshot(
      snapshot => {
        const bookingDates = snapshot.docs.map(doc => {
          return (doc.data() as Booking).date;
        });
        onSuccess(bookingDates);
      },
      () => {},
    );
