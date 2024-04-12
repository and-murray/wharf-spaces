import {Button, ButtonText} from '@gluestack-ui/themed';
import React from 'react';

type ButtonSize = 'normal' | 'full';
type ButtonColor = 'grey' | 'red' | 'normal';

type MurrayButtonProps = {
  isDisabled: boolean;
  onPress: () => void;
  buttonText: string;
  size?: ButtonSize;
  color?: ButtonColor;
};

const MurrayButton = ({
  buttonText,
  isDisabled,
  onPress,
  size,
  color,
}: MurrayButtonProps) => {
  const buttonFlex = size === 'full' ? 1 : undefined;
  const buttonColor =
    color === 'grey'
      ? '$otherGreyMid'
      : color === 'red'
      ? '$otherPrimaryRed'
      : undefined;
  const textColor = color ? '$brandWhite' : '$brandCharcoal';

  return (
    <Button
      sx={{':pressed': {opacity: 0.8}, ':disabled': {opacity: 0.6}}}
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={() => onPress()}
      borderRadius={10}
      flex={buttonFlex}
      backgroundColor={buttonColor}>
      <ButtonText
        accessibilityLabel={buttonText}
        px={3}
        py={1}
        fontFamily="$body"
        fontWeight="$normal"
        size="md"
        color={textColor}>
        {buttonText}
      </ButtonText>
    </Button>
  );
};

export default MurrayButton;
