import dayjs, {Dayjs} from 'dayjs';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import {
  formatToBookingDateUTC,
  sanitiseDate,
} from '../DateTimeUtils/DateTimeUtils';
dayjs.extend(dayOfYear);

export function generateDaysFrom(today: Dayjs = dayjs()) {
  // Ensure days are generated form 00:00 time instead of current local time
  const sanitisedToday = sanitiseDate(today);

  let dateValues: string[] = [];
  for (let weekIndex = 0; weekIndex < 2; weekIndex++) {
    let dayPositionInYear = sanitisedToday.dayOfYear() + 7 * weekIndex;
    let dayPositionInWeek = sanitisedToday.day();
    for (let dayOffset = 1; dayOffset < 6; dayOffset++) {
      let dayOfWeek = dayPositionInYear - (dayPositionInWeek - dayOffset);
      dateValues.push(
        formatToBookingDateUTC(sanitisedToday.dayOfYear(dayOfWeek), true),
      );
    }
  }
  return dateValues;
}
