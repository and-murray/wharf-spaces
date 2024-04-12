import React from 'react';
import {Text, Pressable, Badge, CheckIcon} from 'native-base';
import dayjs from 'dayjs';
import {
  defaultColors,
  isSelectedColors,
  currentDateColors,
} from './SelectableDateColors';

const viewState = {
  normal: defaultColors,
  selected: isSelectedColors,
  currentDate: currentDateColors,
};

type SelectableDateProps = {
  date: string;
  selected: boolean;
  disabled: boolean;
  isCurrentDate: boolean;
  isBooked: boolean;
  onPress: () => void;
};

const SelectableDate = ({
  date,
  selected,
  disabled,
  isCurrentDate,
  isBooked,
  onPress,
}: SelectableDateProps) => {
  let styling = viewState.normal;
  if (selected) {
    styling = viewState.selected;
  } else if (isCurrentDate) {
    styling = viewState.currentDate;
  }

  return (
    <Pressable
      onPress={() => {
        !disabled && onPress();
      }}
      accessibilityLabel={dayjs(date).format('dddd D MMMM')}
      accessibilityState={{
        disabled: disabled,
        selected: selected,
      }}
      accessibilityRole="button"
      flexBasis={0}
      flexGrow={1}
      justifyContent={'center'}
      alignItems={'center'}
      padding={2}
      rounded={16}
      borderWidth={1}
      backgroundColor={styling.boxColour}
      borderColor={styling.borderColour}
      opacity={disabled ? 0.5 : 1}
      testID="SelectableDate">
      <Text
        color={styling.dayTextColour}
        fontFamily={'body'}
        fontWeight={500}
        fontStyle={'normal'}
        fontSize={16}
        numberOfLines={1}
        adjustsFontSizeToFit={true}
        testID="SelectableDateDayName">
        {dayjs(date).format('ddd')}
      </Text>
      <Text
        color={styling.dateTextColour}
        fontFamily={'body'}
        fontWeight={500}
        fontStyle={'normal'}
        fontSize={16}
        testID="SelectableDateDayNumber">
        {dayjs(date).format('D')}
      </Text>
      {isBooked && (
        <Badge
          colorScheme="success"
          rounded="full"
          right="-12px"
          bottom="-12px"
          zIndex={1}
          variant="solid"
          w="24px"
          h="24px"
          position="absolute"
          testID="SelectableDateTick">
          <CheckIcon size="4" color="white" alignSelf="center" />
        </Badge>
      )}
    </Pressable>
  );
};

export default SelectableDate;
