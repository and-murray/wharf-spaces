import getBankHolidays from '@api/getBankHolidays';
import dayjs, {Dayjs} from 'dayjs';
import {BankHoliday} from '@customTypes';

export async function getFilteredBankHolidaysFrom(today: Dayjs = dayjs()) {
  let bankHolidays = await getBankHolidays();
  let aMonthAway = today.add(1, 'M');
  return (
    bankHolidays?.['england-and-wales'].events.filter(element => {
      let dateOfBankHoliday = dayjs(element.date);
      let dateIsNotInPast = dateOfBankHoliday.diff(today) >= 0;
      let dateIsNotAMonthAway = dateOfBankHoliday.diff(aMonthAway) <= 0;
      return dateIsNotInPast && dateIsNotAMonthAway;
    }) || []
  );
}

export function isBankHoliday(
  day: string,
  bankHolidays: BankHoliday[],
): boolean {
  let dayIsBankHoliday = false;
  let formattedDay = dayjs(day).format('YYYY/MM/DD');
  bankHolidays.forEach(bankHoliday => {
    let formattedBankHoliday = dayjs(bankHoliday.date).format('YYYY/MM/DD');
    if (formattedDay === formattedBankHoliday) {
      dayIsBankHoliday = true;
    }
  });
  return dayIsBankHoliday;
}
