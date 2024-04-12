import {getNonReservedBookingsOnDate} from '../FirebaseBookingService/firebaseBookingService';
import {defaults} from '../Defaults/defaults';
import {BusinessUnit, SpaceType} from '../../Models/booking.model';
import {
  calculateCarSpaceCapacity,
  isBookingDateLimitedToBU,
} from '../../utils/BookingUtils/BookingUtils';
import {getFirestoreUser} from '../FirebaseAdminService/firebaseAdminService';
import {reduceRemainingCapacity} from '../../utils/CapacityUtils/CapacityUtils';

export type BookingCapacity = {
  am: number;
  pm: number;
  allDay: number;
};

export const checkBookingCapacity = async (
  dateToBook: string,
  spaceType: SpaceType,
  businessUnit: BusinessUnit | undefined,
): Promise<BookingCapacity> => {
  if (isBookingDateLimitedToBU(dateToBook) && !businessUnit) {
    throw new Error(
      'If booking date is limited to BU then business unit is required',
    );
  }
  let remainingCapacity: BookingCapacity = {
    am: defaults.deskCapacity,
    pm: defaults.deskCapacity,
    allDay: defaults.deskCapacity,
  };
  if (spaceType === 'car' && businessUnit === 'unknown') {
    return {am: 0, pm: 0, allDay: 0};
  }

  let bookingsOnDay = await getNonReservedBookingsOnDate(dateToBook, spaceType);

  const isLimited = isBookingDateLimitedToBU(dateToBook);
  if (spaceType === SpaceType.Enum.car) {
    const maxCarCapacity = calculateCarSpaceCapacity(dateToBook, businessUnit);
    remainingCapacity = {
      am: maxCarCapacity,
      pm: maxCarCapacity,
      allDay: maxCarCapacity,
    };
    for (const booking of bookingsOnDay) {
      const user = await getFirestoreUser(booking.userId);
      if (isLimited && user.businessUnit === businessUnit) {
        remainingCapacity = reduceRemainingCapacity(
          remainingCapacity,
          booking.timeSlot,
        );
      } else if (!isLimited) {
        remainingCapacity = reduceRemainingCapacity(
          remainingCapacity,
          booking.timeSlot,
        );
      }
    }
    return remainingCapacity;
  } else {
    for (const booking of bookingsOnDay) {
      remainingCapacity = reduceRemainingCapacity(
        remainingCapacity,
        booking.timeSlot,
      );
    }
    return remainingCapacity;
  }
};
