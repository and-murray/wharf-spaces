import React, {useMemo} from 'react';
import {
  Pressable,
  Text,
  Badge,
  CheckIcon,
} from '@gluestack-ui/themed-native-base';
import {AvailableSpacesOption} from '@customTypes/index';
import CheckToDisplayAsFull from '@atoms/CheckToDisplayAsFull/CheckToDisplayAsFull';

const container = {
  borderRadius: '8px',
  bgColor: 'other.lightGrey',
  py: '11px',
  px: '8px',
  flexGrow: '1',
  flexBasis: '0',
  borderWidth: '0',
  borderColor: 'brand.charcoal',
  m: '0',
  headingTextColor: 'brand.charcoal',
  subheadingTextColor: 'other.greyMid',
  subheadingTextColorFull: 'brand.orange',
};
const selectedContainer = {
  ...container,
  borderWidth: '2px',
  m: '-2px',
};
const selectedFullContainer = {
  ...selectedContainer,
  borderColor: 'brand.orange',
  headingTextColor: 'brand.orange',
  subheadingTextColor: 'brand.orange',
};
const bookedContainer = {
  ...selectedContainer,
  borderColor: 'other.greenAccent',
  headingTextColor: 'other.greenAccent',
};

const editableContainer = {
  ...container,
  bgColor: 'brand.blue',
  headingTextColor: 'brand.white',
};

type DayTimeSelectorProps = {
  update: (id: number) => void;
  capacity: number;
  hasBookedCommunal?: boolean;
  isBookingEditable?: boolean;
} & AvailableSpacesOption;

const DayTimeSelector = ({
  update,
  heading,
  spaceLeft,
  reservedSpaces,
  id,
  isSelected,
  capacity,
  isBooked,
  hasBookedCommunal,
  isBookingEditable,
}: DayTimeSelectorProps) => {
  const {
    borderRadius,
    bgColor,
    py,
    px,
    flexGrow,
    flexBasis,
    borderWidth,
    borderColor,
    m,
    headingTextColor,
    subheadingTextColor,
    subheadingTextColorFull,
  } = useMemo(() => {
    if (isBooked && hasBookedCommunal) {
      return selectedFullContainer;
    } else if (isBooked) {
      return bookedContainer;
    } else if (isSelected && isBookingEditable) {
      return editableContainer;
    } else if (isSelected) {
      return (spaceLeft ?? 1) > 0 ? selectedContainer : selectedFullContainer;
    }

    return container;
  }, [isBooked, hasBookedCommunal, isBookingEditable, isSelected, spaceLeft]);

  return (
    <Pressable
      onPress={() => update(id)}
      borderRadius={borderRadius}
      bgColor={bgColor}
      py={py}
      px={px}
      flexGrow={flexGrow}
      flexBasis={flexBasis}
      borderWidth={borderWidth}
      borderColor={borderColor}
      shadow={2}
      m={m}
      testID={`DayTimeSelectorPressable-${id}`}
      accessibilityRole="button">
      <Text
        fontFamily={'body'}
        fontWeight="500"
        fontSize={16}
        color={headingTextColor}
        testID={`DayTimeSelectorHeading-${id}`}>
        {heading}
      </Text>
      {isBooked || (isBookingEditable && isSelected) ? (
        <Badge
          colorScheme={hasBookedCommunal ? 'warning' : 'success'}
          rounded="full"
          variant="solid"
          w="5"
          h="5"
          borderColor={'white'}
          testID="SelectableDateTick">
          <CheckIcon size="3" color="white" alignSelf="center" />
        </Badge>
      ) : (
        <CheckToDisplayAsFull
          spaceLeft={spaceLeft}
          reservedSpaces={reservedSpaces}
          capacity={capacity}
          subheadingTextColor={subheadingTextColor}
          subheadingTextColorFull={subheadingTextColorFull}
          id={id}
        />
      )}
    </Pressable>
  );
};

export default DayTimeSelector;
