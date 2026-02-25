import {BookingRequest, BusinessUnit} from '../../Models/booking.model';
import admin from 'firebase-admin';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'; // UTC plugin is required before timezone
import timezone from 'dayjs/plugin/timezone';
import {distinctFieldValues} from '../ArrayUtils/ArrayUtils';
import {Config} from '../../Config';
dayjs.extend(utc);
dayjs.extend(timezone);

export const applicationTimezone = 'Europe/London';
//Check if all bookings are of the same day, construct array of all dates being booked
export const checkDatesBeingBooked = (bookingRequest: BookingRequest) => {
  const bookings = bookingRequest.bookings;

  const dateArray = distinctFieldValues(bookings, booking => booking.date);

  return dateArray;
};

//Check if all bookings have the same spaceType
export const checkSpaceTypeBeingBooked = (bookingRequest: BookingRequest) => {
  const bookings = bookingRequest.bookings;

  const spaceTypeArray = distinctFieldValues(
    bookings,
    booking => booking.spaceType,
  );

  return spaceTypeArray;
};

export function calculateCarSpaceCapacity(
  dateToBook: string,
  businessUnit: BusinessUnit | undefined,
  config: Config,
): number {
  if (isBookingDateLimitedToBU(dateToBook) && !businessUnit) {
    throw Error('If booking date is limited to BU then BU is required');
  }
  console.log('Check booking capacity');
  console.log(JSON.stringify(config));
  console.log(JSON.stringify(config.parkingCapacity));
  console.log(JSON.stringify(config.parkingCapacity.murray));
  let remainingCapacity = 0;
  if (businessUnit === 'unknown') {
    remainingCapacity = config.parkingCapacity.unknown;
  } else if (!isBookingDateLimitedToBU(dateToBook)) {
    remainingCapacity =
      config.parkingCapacity.murray +
      config.parkingCapacity.tenzing +
      config.parkingCapacity.adams;
  } else if (businessUnit === 'murray') {
    remainingCapacity = config.parkingCapacity.murray;
  } else if (businessUnit === 'tenzing') {
    remainingCapacity = config.parkingCapacity.tenzing;
  } else if (businessUnit === 'adams') {
    remainingCapacity = config.parkingCapacity.adams;
  }

  return remainingCapacity;
}

export const isBookingDateLimitedToBU = (bookingDate: string): boolean => {
  const getServerTimestamp = admin.firestore.Timestamp.now().toDate();
  const londonServerTimestamp =
    dayjs(getServerTimestamp).tz(applicationTimezone);

  const dateUserBooks = dayjs(bookingDate);
  const isSameDay = londonServerTimestamp.isSame(dateUserBooks, 'day');
  if (isSameDay) {
    return false;
  }
  const isNextDay = londonServerTimestamp
    .add(1, 'day')
    .isSame(dateUserBooks, 'day');
  const isAfter9PM = londonServerTimestamp.hour() >= 21;

  return !(isNextDay && isAfter9PM);
};

export const isValidCarBookingDate = (bookingDate: string): boolean => {
  const getServerTimestamp = admin.firestore.Timestamp.now().toDate();
  const londonServerTimestamp =
    dayjs(getServerTimestamp).tz(applicationTimezone);
  const dateUserBooks = dayjs(bookingDate);

  const isLessThanToday = londonServerTimestamp.isAfter(dateUserBooks, 'day');
  if (isLessThanToday) {
    return false;
  }
  const isCurrentlyBeforeMidday = londonServerTimestamp.hour() < 12;
  if (isCurrentlyBeforeMidday) {
    return (
      londonServerTimestamp.add(6, 'day').isAfter(dateUserBooks, 'day') ||
      londonServerTimestamp.add(6, 'day').isSame(dateUserBooks, 'day')
    );
  } else {
    return (
      londonServerTimestamp.add(7, 'day').isAfter(dateUserBooks, 'day') ||
      londonServerTimestamp.add(7, 'day').isSame(dateUserBooks, 'day')
    );
  }
};
