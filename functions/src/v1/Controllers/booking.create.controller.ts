import * as functions from 'firebase-functions';
import {checkBookingCapacity} from '../Services/DeskCapacity/checkBookingCapacity';
import {
  Booking,
  BookingInput,
  BookingRequest,
  BusinessUnit,
  User,
  Role,
  SpaceType,
  BookingType,
} from '../Models/booking.model';
import {
  getFirestoreUser,
  getServerTime,
  sendToBookings,
} from '../Services/FirebaseAdminService/firebaseAdminService';
import {v4 as uuidv4} from 'uuid';
import {
  checkDatesBeingBooked,
  checkSpaceTypeBeingBooked,
  isBeforeHawkingJoin,
  isValidCarBookingDate,
} from '../utils/BookingUtils/BookingUtils';
import {isCorrectFunction} from '../utils/IsCorrectFunction';

export const createNewBookings = async (
  req: functions.Request,
  res: functions.Response<any>,
) => {
  let bookingRequest: BookingRequest;
  try {
    bookingRequest = BookingRequest.parse(req.body);

    // CHECK ALL BOOKINGS ARE OF THE SAME DATE AND ERROR OTHERWISE
    const getUniqueBookingDates = checkDatesBeingBooked(bookingRequest);
    const getUniqueBookingSpaceTypes =
      checkSpaceTypeBeingBooked(bookingRequest);

    for (const value of [getUniqueBookingDates, getUniqueBookingSpaceTypes]) {
      if (value.length > 1) {
        res.status(400).send();
        return;
      }
    }

    const dateBeingBooked = getUniqueBookingDates[0];
    const typeBeingBooked = getUniqueBookingSpaceTypes[0];

    if (!isCorrectFunction(typeBeingBooked)) {
      res
        .status(403)
        .send(
          'Incorrect function being used. Car bookings should use the car api and desk bookings should use the desk api',
        );
      return;
    }

    if (
      typeBeingBooked === SpaceType.Enum.car &&
      !isValidCarBookingDate(dateBeingBooked)
    ) {
      res.status(403).send('You can not book this car date yet.');
      return;
    }
    let formattedBookings: Booking[] = [];

    // check if all bookings are for the same user
    const uniqueUserIds = new Set(
      req.body.bookings.map((booking: BookingInput) => booking.userId),
    );

    if (uniqueUserIds.size > 1) {
      // handle the case where there are bookings for different users
      // you might decide to send a 400 error here
      res.status(400).send('Bookings for different users are not allowed');
      return;
    } else {
      // if all bookings are for the same user, get the user just once
      const userId = Array.from(uniqueUserIds)[0] as string;
      let user: User;
      try {
        user = await getFirestoreUser(userId);
      } catch (error) {
        res.status(400).send(error);
        return;
      }

      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }

      if (user.role === Role.Enum.demo) {
        res.status(403).send('Demo accounts cannot place bookings');
        return;
      }

      const businessUnit: BusinessUnit = user.businessUnit;
      const remainingCapacity = await checkBookingCapacity(
        req.body.bookings[0].date,
        req.body.bookings[0].spaceType,
        businessUnit,
      );
      formattedBookings = await Promise.all(
        req.body.bookings.map(async (booking: BookingInput) => {
          if (
            businessUnit === 'hawking' &&
            booking.spaceType === SpaceType.Enum.car &&
            isBeforeHawkingJoin(req.body.bookings[0].date)
          ) {
            res
              .status(403)
              .send(
                'Hawking users are unable to book parking spaces for this date.',
              );
            return;
          }
          if (
            businessUnit === 'unknown' &&
            booking.spaceType === SpaceType.Enum.car
          ) {
            res
              .status(403)
              .send(
                'Only Murray, Hawking, and Tenzing Users can book car spaces. Please speak to a PL or Club Exec',
              );
            return;
          }

          if (
            booking.spaceType === SpaceType.Enum.car &&
            booking.bookingType === BookingType.Enum.guest &&
            user.role !== Role.Enum.admin
          ) {
            res
              .status(403)
              .send('Only admins can book guest spaces for car spots');
            return;
          }

          let id = uuidv4();
          const timestampedBooking: Booking = {
            ...booking,
            id,
            createdAt: getServerTime(),
            updatedAt: getServerTime(),
            isReserveSpace: remainingCapacity[booking.timeSlot] <= 0,
          };

          remainingCapacity[booking.timeSlot] -= 1;
          if (booking.timeSlot === 'allDay') {
            remainingCapacity.am -= 1;
            remainingCapacity.pm -= 1;
          }
          remainingCapacity.allDay = Math.min(
            remainingCapacity.allDay,
            remainingCapacity[booking.timeSlot],
          );

          // decrease capacity left for batch of bookings to take current booking into account
          return timestampedBooking;
        }),
      );
    }
    sendToBookings(formattedBookings.filter(booking => booking !== undefined));
    res.status(201).send();
  } catch (error) {
    res.status(400).send(error);
  }
};

export default createNewBookings;
