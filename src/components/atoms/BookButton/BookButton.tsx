import {Icon, Text} from '@gluestack-ui/themed-native-base';
import {Button} from '@gluestack-ui/themed';
import React from 'react';
import {DeskIcon} from '@res/images/DeskIcon';
import {SpaceType} from '@customTypes/booking';
import {CarIcon} from '@res/images/CarIcon';
type BookButtonProps = {
  onPress: () => void;
  isDisabled: boolean;
  hasBooked: boolean;
  spaceType: SpaceType;
};

const RightIcon = (spaceType: SpaceType) => {
  if (spaceType === SpaceType.desk) {
    return (
      <Icon as={<DeskIcon color="white" iconWidth={33} strokeWidth={2.5} />} />
    );
  } else {
    return (
      <Icon as={<CarIcon color="white" iconWidth={33} strokeWidth={2.5} />} />
    );
  }
};

const BookButton = ({
  onPress,
  isDisabled,
  hasBooked,
  spaceType,
}: BookButtonProps) => {
  const text = hasBooked ? 'Cancel' : 'Book';

  return (
    <Button
      // rightIcon={RightIcon(spaceType)}

      opacity={isDisabled ? '$60' : '$100'}
      borderRadius={10}
      isDisabled={isDisabled}
      backgroundColor={hasBooked ? 'other.primaryRed' : 'other.greyMid'}
      onPress={onPress}
      testID="BookButton">
      <Text
        color={'brand.white'}
        fontFamily={'body'}
        fontWeight={500}
        fontStyle={'normal'}
        fontSize={16}>
        {text}
      </Text>
    </Button>
  );
};
export default BookButton;
