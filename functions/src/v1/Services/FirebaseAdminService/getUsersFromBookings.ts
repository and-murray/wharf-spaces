import admin from 'firebase-admin';
import {chunkQuery} from '../../utils/FirebaseUtils/FirebaseUtils';
import {parseUser} from '../../utils/ParserUtil';
import {CollectionName} from '../CollectionName';
import {Booking, User} from '../../Models/booking.model';
import {distinctFieldValues} from '../../utils/ArrayUtils/ArrayUtils';

export async function getUsersFromBookings(
  bookings: Booking[],
): Promise<User[]> {
  const userIds: string[] = distinctFieldValues(
    bookings,
    booking => booking.userId,
  );
  const ref = admin.firestore().collection(CollectionName.users);

  const unparsedUsers = await chunkQuery<User>(ref, 'id', userIds);
  const users: User[] = unparsedUsers.map(user => {
    return parseUser(user.data);
  });

  return users;
}
