import dayjs, {Dayjs} from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

export enum DateFormat {
  dddd_DD_MMMM = 'dddd, DD MMMM',
  londonServerTimestampFormat = 'YYYY-MM-DDTHH:mm:ss',
}

export const formatDate = (
  format: string,
  day: Dayjs = dayjs(),
  keepLocal: boolean = true,
) => day.utc(keepLocal).format(format);

//using utc plugin to get non-local variant of utc time as dayjs documentation dictates
export const formatToBookingDateUTC = (
  day: Dayjs = new Dayjs(),
  keepLocal: boolean,
) => day.utc(keepLocal).format();

export const sanitiseDate = (day: Dayjs = new Dayjs()) => {
  const midnightDate = dayjs(day)
    .set('hour', 0)
    .set('minute', 0)
    .set('second', 0)
    .set('millisecond', 0);

  return dayjs(midnightDate);
};

export const getTodaysUTCDateMidnightString = (): string =>
  dayjs().format('YYYY-MM-DDT00:00:00[Z]');

export const isCloseToBookingDate = (
  londonServerTimestamp: Dayjs,
  storedDeviceTimestamp: Dayjs,
  currentDeviceTimestamp: Dayjs,
  bookingDate: Dayjs,
): boolean => {
  const updatedLondonDate = updatedLondonTime(
    dayjs(londonServerTimestamp),
    dayjs(storedDeviceTimestamp),
    currentDeviceTimestamp,
  );
  const isSameDay = updatedLondonDate.isSame(bookingDate, 'day');
  const isNextDay = updatedLondonDate.add(1, 'day').isSame(bookingDate, 'day');
  const isAfter9PM = updatedLondonDate.hour() >= 21;
  return isSameDay || (isNextDay && isAfter9PM);
};

/**
 * Determines if it's a valid date that we can book parking on
 * @param serverLondonTimestamp - The time stored in state at app foregrounding as received from the server that is the time in London.
 * @param storedDeviceTimestamp - The time store in state at app foregrounding as received from the device.
 * @param currentDeviceTimestamp - The current time the device is displaying
 * @param bookingDate - The current time the device has.
 * @returns - Boolean true if you can book this date
 */
export const isValidParkingDate = (
  londonServerTimestamp: Dayjs,
  storedDeviceTimestamp: Dayjs,
  currentDeviceTimestamp: Dayjs,
  bookingDate: Dayjs,
): boolean => {
  const updatedLondonDate = updatedLondonTime(
    dayjs(londonServerTimestamp),
    dayjs(storedDeviceTimestamp),
    currentDeviceTimestamp,
  );
  const isLessThanToday = updatedLondonDate.isAfter(bookingDate, 'day');
  if (isLessThanToday) {
    return false;
  }
  const isCurrentlyBeforeMidday = updatedLondonDate.hour() < 12;
  if (isCurrentlyBeforeMidday) {
    return (
      updatedLondonDate.add(6, 'day').isAfter(bookingDate, 'day') ||
      updatedLondonDate.add(6, 'day').isSame(bookingDate, 'day')
    );
  } else {
    return (
      updatedLondonDate.add(7, 'day').isAfter(bookingDate, 'day') ||
      updatedLondonDate.add(7, 'day').isSame(bookingDate, 'day')
    );
  }
};
/**
 * Calculated the current london time using the serverLondonTime, storedDeviceTime and the current device time.
 * @param serverLondonTime - The time stored in state at app foregrounding as received from the server that is the time in London.
 * @param storedDeviceTime - The time store in state at app foregrounding as received from the device.
 * @param currentDeviceTime - The current time the device has.
 * @returns - The current london time.
 */
export const updatedLondonTime = (
  serverLondonTime: Dayjs,
  storedDeviceTime: Dayjs,
  currentDeviceTime: Dayjs,
): Dayjs => {
  const timeDiff = currentDeviceTime.diff(storedDeviceTime);
  const londonTimeNow = serverLondonTime.add(timeDiff);
  return londonTimeNow;
};
