import React, {useState, useMemo} from 'react';
import dayjs from 'dayjs';
import dayOfYear from 'dayjs/plugin/dayOfYear';
dayjs.extend(dayOfYear);
import {generateDaysFrom} from '@utils/CalendarDayGenerationUtils/CalendarDayGenerationUtils';
import {useAppSelector} from '@state/utils/hooks';
import {CalendarWeek} from '@molecules';
import {WeekNavigationControls} from '@atoms';
import {HStack, Text, View} from '@gluestack-ui/themed';

const DeskCalendar = () => {
  let [weekOffset, setWeekOffset] = useState(0);
  const {selectedDay} = useAppSelector(state => state.selectedDayOptions);

  const changeWeekOffset = () => {
    weekOffset === 0 ? setWeekOffset(1) : setWeekOffset(0);
  };

  const days = useMemo(() => generateDaysFrom(), []);
  const currentDay = weekOffset > 0 ? -1 : dayjs().day() - 1; //Offset 0 to be Monday not default Sunday

  return (
    <View padding="$1" testID="DeskCalendar">
      <HStack
        marginVertical="$2"
        justifyContent="space-between"
        paddingBottom="$1">
        <Text
          fontFamily="$body"
          fontWeight="$medium"
          size="md"
          flex={1}
          accessibilityLabel={dayjs(selectedDay).format('dddd D MMMM')}>
          {selectedDay !== '' ? dayjs(selectedDay).format('dddd, D MMMM') : ''}
        </Text>
        <WeekNavigationControls
          weekOffset={weekOffset}
          onPress={changeWeekOffset}
        />
      </HStack>
      <CalendarWeek
        days={days}
        weekOffset={weekOffset}
        currentDay={currentDay}
      />
    </View>
  );
};

export default DeskCalendar;
