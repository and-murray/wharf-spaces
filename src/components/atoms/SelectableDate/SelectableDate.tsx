import React from 'react';
import dayjs from 'dayjs';
import {
  defaultColors,
  isSelectedColors,
  currentDateColors,
} from './SelectableDateColors';
import {Badge, CheckIcon, Pressable, Text} from '@gluestack-ui/themed';

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
      justifyContent="center"
      alignItems="center"
      padding={2}
      rounded={16}
      borderWidth={1}
      backgroundColor={styling.boxColour}
      borderColor={styling.borderColour}
      opacity={disabled ? 0.5 : 1}
      testID="SelectableDate">
      <Text
        color={styling.dayTextColour}
        fontFamily="$body"
        fontWeight="$medium"
        size="md"
        numberOfLines={1}
        adjustsFontSizeToFit={true}
        testID="SelectableDateDayName">
        {dayjs(date).format('ddd')}
      </Text>
      <Text
        color={styling.dateTextColour}
        fontFamily="$body"
        fontWeight="$medium"
        size="md"
        testID="SelectableDateDayNumber">
        {dayjs(date).format('D')}
      </Text>
      {isBooked && (
        <Badge
          bgColor="success"
          rounded="$full"
          right={-12}
          bottom={-12}
          zIndex={1}
          variant="solid"
          width={24}
          height={24}
          position="absolute"
          testID="SelectableDateTick">
          <CheckIcon size="sm" color="white" alignSelf="center" />
        </Badge>
      )}
    </Pressable>
  );
};

export default SelectableDate;
