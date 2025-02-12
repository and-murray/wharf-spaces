import React from 'react';
import {Text, Button} from '@gluestack-ui/themed-native-base';

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
      ? 'other.greyMid'
      : color === 'red'
      ? 'other.primaryRed'
      : undefined;
  const textColor = color ? 'brand.white' : 'brand.charcoal';

  return (
    <Button
      _pressed={{opacity: 0.8}}
      accessibilityRole="button"
      opacity={isDisabled ? '0.6' : '1.0'}
      disabled={isDisabled}
      onPress={() => onPress()}
      borderRadius={10}
      flex={buttonFlex}
      backgroundColor={buttonColor}>
      <Text
        accessibilityLabel={buttonText}
        px={3}
        py={1}
        fontFamily={'body'}
        fontWeight={'500'}
        fontSize={16}
        color={textColor}>
        {buttonText}
      </Text>
    </Button>
  );
};

export default MurrayButton;
