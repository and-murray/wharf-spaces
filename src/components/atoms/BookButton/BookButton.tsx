import React from 'react';
import {DeskIcon, CarIcon} from '@res/images';
import {SpaceType} from '@customTypes/booking';
import {Button, ButtonIcon, ButtonText} from '@gluestack-ui/themed';
type BookButtonProps = {
  onPress: () => void;
  isDisabled: boolean;
  hasBooked: boolean;
  spaceType: SpaceType;
};

const RightIcon = (spaceType: SpaceType) =>
  spaceType === SpaceType.desk ? DeskIcon : CarIcon;

const BookButton = ({
  onPress,
  isDisabled,
  hasBooked,
  spaceType,
}: BookButtonProps) => {
  const text = hasBooked ? 'Cancel' : 'Book';

  return (
    <Button
      opacity={isDisabled ? '$60' : '$100'}
      borderRadius={10}
      isDisabled={isDisabled}
      backgroundColor={hasBooked ? '$otherPrimaryRed' : '$otherGreenAccent'}
      onPress={onPress}
      testID="BookButton">
      <ButtonText
        color="$brandWhite"
        fontFamily="$body"
        fontWeight="$medium"
        size="md">
        {text}
      </ButtonText>
      <ButtonIcon as={RightIcon(spaceType)} color="white" width={33} />
    </Button>
  );
};
export default BookButton;
