import React, {useMemo, useState} from 'react';
import {useAppDispatch, useAppSelector} from '@state/utils/hooks';
import {storeSelectedDay} from '@state/reducers/selectedDayOptionsSlice';
import {HStack} from 'native-base';
import {
  getFilteredBankHolidaysFrom,
  isBankHoliday,
} from '@utils/BankHolidayUtils/BankHolidayUtils';
import {SelectableDate} from '@atoms';
import dayjs from 'dayjs';
import {BankHoliday} from '@customTypes';
import {formatToBookingDateUTC} from '@utils/DateTimeUtils/DateTimeUtils';

type CalendarWeekProps = {
  days: string[];
  weekOffset: number;
  currentDay: number;
};

const CalendarWeek = ({days, weekOffset, currentDay}: CalendarWeekProps) => {
  let [selectedIndex, setSelectedIndex] = useState<number>(currentDay);
  let [bankHolidays, setBankHolidays] = useState<BankHoliday[]>([]);
  let {activeBookingDates} = useAppSelector(state => state.user);
  const dispatch = useAppDispatch();

  const parsedBookedDays = useMemo(() => {
    return (
      activeBookingDates.map(bookingDate =>
        formatToBookingDateUTC(dayjs(bookingDate), false),
      ) || []
    );
  }, [activeBookingDates]);

  useMemo(() => {
    async function setupBankHolidays() {
      setBankHolidays(await getFilteredBankHolidaysFrom());
    }
    setupBankHolidays();
  }, []);

  const dateOnPress = (index: number) => {
    const isAlreadySelected = selectedIndex === index;
    if (!isAlreadySelected) {
      dispatch(
        storeSelectedDay(formatToBookingDateUTC(dayjs(days[index]), false)),
      );
      setSelectedIndex(index);
    }
  };

  let daysView = days.map((day, index) => {
    return (
      <SelectableDate
        key={index}
        date={day}
        isBooked={parsedBookedDays.includes(day)}
        selected={index === selectedIndex}
        isCurrentDate={index === currentDay}
        disabled={index < currentDay || isBankHoliday(day, bankHolidays)}
        onPress={() => {
          dateOnPress(index);
        }}
      />
    );
  });

  let firstWeek = daysView.slice(0, 5);
  let secondWeek = daysView.slice(5, 10);

  return (
    <HStack
      justifyContent={'space-between'}
      width={'100%'}
      space={2}
      testID="CalendarWeek">
      {weekOffset === 0 ? firstWeek : secondWeek}
    </HStack>
  );
};

export default CalendarWeek;
