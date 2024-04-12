import React, {useMemo} from 'react';
import {AvailableSpacesOption} from '@customTypes/index';
import CheckToDisplayAsFull from '@atoms/CheckToDisplayAsFull/CheckToDisplayAsFull';
import {Badge, CheckIcon, Pressable, Text} from '@gluestack-ui/themed';

const container = {
  bgColor: '$otherLightGrey',
  borderColor: '$brandCharcoal',
  borderRadius: 8,
  borderWidth: 0,
  flexBasis: 0,
  flexGrow: 1,
  headingTextColor: '$brandCharcoal',
  px: 8,
  py: 11,
  subheadingTextColor: '$otherGreyMid',
  subheadingTextColorFull: '$brandOrange',
};
const selectedContainer = {
  ...container,
  borderWidth: 2,
};
const selectedFullContainer = {
  ...selectedContainer,
  borderColor: '$brandOrange',
  headingTextColor: '$brandOrange',
  subheadingTextColor: '$brandOrange',
};
const bookedContainer = {
  ...selectedContainer,
  borderColor: '$otherGreenAccent',
  headingTextColor: '$otherGreenAccent',
};

const editableContainer = {
  ...container,
  bgColor: '$brandBlue',
  headingTextColor: '$brandWhite',
};

type DayTimeSelectorProps = {
  update: (id: number) => void;
  capacity: number;
  hasBookedCommunal?: boolean;
  isBookingEditable?: boolean;
} & AvailableSpacesOption;

const DayTimeSelector = ({
  capacity,
  hasBookedCommunal,
  heading,
  id,
  isBooked,
  isBookingEditable,
  isSelected,
  spaceLeft,
  update,
}: DayTimeSelectorProps) => {
  const {
    borderRadius,
    bgColor,
    py,
    px,
    flexGrow,
    flexBasis,
    borderColor,
    borderWidth,
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
      backgroundColor={bgColor}
      py={py}
      px={px}
      flexGrow={flexGrow}
      flexBasis={flexBasis}
      borderColor={borderColor}
      borderWidth={borderWidth}
      hardShadow="3"
      shadowRadius={'$0.5'}
      testID={`DayTimeSelectorPressable-${id}`}
      accessibilityRole="button">
      <Text
        fontFamily="$body"
        fontWeight="$medium"
        size="md"
        color={headingTextColor}
        testID={`DayTimeSelectorHeading-${id}`}>
        {heading}
      </Text>
      {isBooked || (isBookingEditable && isSelected) ? (
        <Badge
          bgColor={hasBookedCommunal ? '$warning500' : '$success500'}
          rounded="$full"
          variant="solid"
          width="$5"
          height="$5"
          borderColor="white"
          borderWidth={1}
          testID="SelectableDateTick"
          justifyContent="center">
          <CheckIcon size="sm" color="white" alignSelf="center" />
        </Badge>
      ) : (
        <CheckToDisplayAsFull
          spaceLeft={spaceLeft}
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
