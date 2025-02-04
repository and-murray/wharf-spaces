import {
  Booking,
  BusinessUnit,
  TimeSlot,
  User,
} from '../../Models/booking.model';
import {distinctFieldValues} from '../ArrayUtils/ArrayUtils';
import {isBookingDateLimitedToBU} from '../BookingUtils/BookingUtils';

/**
 * FreeSlot holds number of am, pm and allDay on a date.
 */
export type FreeSlot = {
  am: number;
  pm: number;
  allDay: number;
  date: string;
};
/**
 * The type is used for sending notification about the newly become space on a date (due to deletion of others)
 */
export type SpaceNotification = {
  date: string;
  slot: 'am' | 'pm';
  spaceLeft: number;
  userIds: string[];
};

/**
 * Reassignables type is for holding booking list that can be promoted from reserved and can now be assigned space(s)
 * and space notification objects
 */
export type Reassignables = {
  bookings: Booking[];
  notifications: SpaceNotification[] | undefined;
};

/**
 * Based on the desk space availabilites on the dates in freeSlotsList, the function picks bookings (from reserved @param bookings list)
 * that can be promoted from reserved list.
 *
 * The booking list is then bundled into Reassignables and returned
 * @param freeSlotsList
 * @param bookings
 * @returns an instance of Reassignables that holds only the desk booking list that can be promoted.
 */
export const findDeskAssignables = (
  freeSlotsList: FreeSlot[],
  bookings: Booking[],
): Reassignables => {
  const assignableBookings = freeSlotsList.flatMap(freeSlot => {
    const reservedBookings = bookings.filter(
      booking => booking.date === freeSlot.date,
    );
    return findAssignableBookings(freeSlot, reservedBookings);
  });
  return {bookings: assignableBookings} as Reassignables;
};

/**
 * Based on the car space availabilites on the dates in freeSlotsList, the function picks bookings (from reserved @param bookings list)
 * that can be promoted from reserved list.
 * It also extracts out users to whom free car space slots couldn't be assigned due to mismatch time slots.
 * The two items then bundled into Reassignables and returned
 * @param freeSlotsList - all the free slot items
 * @param bookings - reserved bookings
 * @param userBU - Business unit that has prioritity
 * @param prioritizedUsers - list of users that belongs to the same business unit test as @param userBU
 * @returns an instance of Reassignables that holds the car booking list that can be promoted and space notification objects (or undefined)
 */
export const findCarAssignables = (
  freeSlotsList: FreeSlot[],
  bookings: Booking[],
  userBU: BusinessUnit,
  prioritizedUsers: Map<string, User>,
): Reassignables => {
  let assignableBookings: Booking[] = [];
  let spaceNotifications: SpaceNotification[] | undefined;
  freeSlotsList.forEach(freeSlot => {
    let reservedBookings = bookings.filter(
      booking => booking.date === freeSlot.date,
    );

    if (isBookingDateLimitedToBU(freeSlot.date)) {
      reservedBookings = reservedBookings.filter(
        booking =>
          prioritizedUsers.get(booking.userId)?.businessUnit === userBU,
      );
    }

    const assignablesOnDate = findAssignableBookings(
      freeSlot,
      reservedBookings,
    );
    const notificationOnDate = extractSpaceNotificationData(
      freeSlot,
      reservedBookings,
      assignablesOnDate,
    );
    if (notificationOnDate) {
      if (!spaceNotifications) {
        spaceNotifications = [];
      }
      spaceNotifications.push(notificationOnDate);
    }
    assignableBookings = assignableBookings.concat(assignablesOnDate);
  });

  return {
    bookings: assignableBookings,
    notifications: spaceNotifications,
  } as Reassignables;
};

/**
 * Calculates unused free slots on the day using the bookings in @param assignables and the @param freeSlot.
 * If anyone am or pm slot(s) found unused, then unassigned bookings (reserved minus assignables) are searched
 * and then extract out associated users.
 *
 * The users, the free slots info are bundled into space notification object and returned.
 * if any allDay slot(s) is left, the functions assumes there are no bookings that can be promoted and thus not notification needs sending.
 * @param freeSlot
 * @param reserved
 * @param assignables
 * @returns
 */
const extractSpaceNotificationData = (
  freeSlot: FreeSlot,
  reserved: Booking[],
  assignables: Booking[],
): SpaceNotification | undefined => {
  if (reserved.length === assignables.length) {
    return undefined;
  }

  const remainingSlot = {...freeSlot} as FreeSlot;
  assignables.forEach(booking => (remainingSlot[booking.timeSlot] -= 1));
  // if a day slot is remained unassigned, then there shouldn't be any unassigned reserved booking and thus no notification needs sending
  if (remainingSlot.allDay > 0) {
    return undefined;
  }

  const slotLeft = remainingSlot.am + remainingSlot.pm;
  if (slotLeft === 0) {
    return undefined;
  }

  const unassigned = reserved.filter(b => assignables.indexOf(b) === -1);
  if (unassigned.length === 0) {
    return undefined;
  }

  const notificationTimeSlot =
    remainingSlot.am > 0 && remainingSlot.pm > 0
      ? undefined
      : remainingSlot.am > 0
      ? TimeSlot.Enum.am
      : TimeSlot.Enum.pm;
  if (!notificationTimeSlot) {
    return undefined;
  }
  const usersIds = distinctFieldValues(unassigned, booking => booking.userId);

  return {
    date: freeSlot.date,
    slot: notificationTimeSlot,
    spaceLeft: slotLeft,
    userIds: usersIds,
  } as SpaceNotification;
};

/**
 * Searches and filters n (or less) number of am, pm or allDay (these numbers are in freeSlots field)
 * bookings from the reserved space bookings (currentResereves)
 *
 * @param freeSlots
 * @param currentResereves
 * @returns assignable bookings
 */
export const findAssignableBookings = (
  freeSlots: FreeSlot,
  currentResereves: Booking[],
) => {
  let assignableBookings: Booking[] = [];
  if (currentResereves.length === 0) {
    return assignableBookings;
  }
  const amBookings = filterAssignableBookings(
    currentResereves,
    freeSlots.am,
    TimeSlot.Enum.am,
    booking => booking.timeSlot === TimeSlot.Enum.am,
  );
  assignableBookings = assignableBookings.concat(amBookings);
  const pmBookings = filterAssignableBookings(
    currentResereves,
    freeSlots.pm,
    TimeSlot.Enum.pm,
    booking => booking.timeSlot === TimeSlot.Enum.pm,
  );
  assignableBookings = assignableBookings.concat(pmBookings);
  const allDaysAndOthers = filterAssignableBookings(
    currentResereves,
    freeSlots.allDay,
    TimeSlot.Enum.allDay,
    booking => !assignableBookings.includes(booking),
  );
  return assignableBookings.concat(allDaysAndOthers);
};

const sortBookingFn = (a: Booking, b: Booking) => {
  return a.createdAt < b.createdAt ? -1 : a.createdAt === b.createdAt ? 0 : 1;
};

/**
 * Searches the bookings with given type (freeSlotType) that fulfills the filter predicate. And from this list,
 * top (based on created Date) n number of free slots (freeSlots) are filtered and returned.
 *
 * If the provided free slot type is allDay and if not all available time slots used, then it searches through more bookings
 * and added into assignable bookings.
 *
 * @param bookings that belongs to same day
 * @param freeSlots number of free slots that become vailable (due to deletion)
 * @param freeSlotType am, pm or allDay
 * @param predicate for filter
 * @returns assignable bookings
 */
export const filterAssignableBookings = (
  bookings: Booking[],
  freeSlots: number,
  freeSlotType: TimeSlot,
  predicate: (booking: Booking) => boolean,
): Booking[] => {
  if (freeSlots === 0) {
    return [];
  }
  const filtered = bookings.filter(predicate).sort(sortBookingFn);
  const sliceableCount = Math.min(freeSlots, filtered.length);
  let assignables = filtered.slice(0, sliceableCount);

  if (freeSlotType === TimeSlot.Enum.allDay && filtered.length > freeSlots) {
    const notAssigned = filtered.filter(
      booking => !assignables.includes(booking),
    );
    const moreAssignables = findMoreAssignables(assignables, notAssigned);
    assignables = assignables.concat(moreAssignables);
  }

  return assignables;
};
/**
 * Searches through am and pm bookings that are assigned allDay and extract out remainings and allocate them to bookings in
 * from list.
 * @param allDayAssigned
 * @param from
 * @returns assignable bookings from from list
 */
const findMoreAssignables = (
  allDayAssigned: Booking[],
  from: Booking[],
): Booking[] => {
  if (from.length === 0) {
    return [];
  }
  const amAvailable = from
    .filter(booking => booking.timeSlot === TimeSlot.Enum.am)
    .sort(sortBookingFn);
  const pmAvailables = from
    .filter(booking => booking.timeSlot === TimeSlot.Enum.pm)
    .sort(sortBookingFn);
  const allDayAvailables = from
    .filter(booking => booking.timeSlot === TimeSlot.Enum.allDay)
    .sort(sortBookingFn);

  const pmAssignableCounts = allDayAssigned.reduce((n, booking) => {
    return n + (booking.timeSlot === TimeSlot.Enum.am ? 1 : 0);
  }, 0);
  const amAssignableCounts = allDayAssigned.reduce((n, booking) => {
    return n + (booking.timeSlot === TimeSlot.Enum.pm ? 1 : 0);
  }, 0);

  const sliceableAmCounts = Math.min(amAvailable.length, amAssignableCounts);
  const sliceablePmCounts = Math.min(pmAvailables.length, pmAssignableCounts);

  const amAssignables = amAvailable.slice(0, sliceableAmCounts);
  const pmAssignables = pmAvailables.slice(0, sliceablePmCounts);

  const mergeableCount = Math.min(
    amAssignableCounts - amAssignables.length,
    pmAssignableCounts - pmAssignables.length,
  );

  const allDayAssignables = allDayAvailables.slice(0, mergeableCount);
  return amAssignables.concat(pmAssignables).concat(allDayAssignables);
};
