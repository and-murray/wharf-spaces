import getBankHolidays from '@api/getBankHolidays';
import dayjs, {Dayjs} from 'dayjs';
import {BankHoliday} from '@customTypes';

export async function getFilteredBankHolidaysFrom(today: Dayjs = dayjs()) {
  const bankHolidays = await getBankHolidays();
  const aMonthAway = today.add(1, 'M');
  return (
    bankHolidays?.['england-and-wales'].events.filter(element => {
      const dateOfBankHoliday = dayjs(element.date);
      const dateIsNotInPast = dateOfBankHoliday.diff(today) >= 0;
      const dateIsNotAMonthAway = dateOfBankHoliday.diff(aMonthAway) <= 0;
      return dateIsNotInPast && dateIsNotAMonthAway;
    }) || []
  );
}

export function isBankHoliday(
  day: string,
  bankHolidays: BankHoliday[],
): boolean {
  let dayIsBankHoliday = false;
  const formattedDay = dayjs(day).format('YYYY/MM/DD');
  bankHolidays.forEach(bankHoliday => {
    const formattedBankHoliday = dayjs(bankHoliday.date).format('YYYY/MM/DD');
    if (formattedDay === formattedBankHoliday) {
      dayIsBankHoliday = true;
    }
  });
  return dayIsBankHoliday;
}
