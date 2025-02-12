import {Text, Button} from '@gluestack-ui/themed-native-base';
import React from 'react';

type LongButtonProps = {
  isDisabled: boolean;
  onPress: () => void;
  buttonText: string;
};

const LongButton = ({buttonText, isDisabled, onPress}: LongButtonProps) => {
  return (
    <Button
      _pressed={{opacity: 0.8}}
      accessibilityRole="button"
      backgroundColor="other.greyDark"
      borderRadius="2xl"
      opacity={isDisabled ? 40 : 100}
      height={12}
      alignItems="center"
      justifyContent="center"
      disabled={isDisabled}
      onPress={() => onPress()}>
      <Text
        accessibilityLabel={buttonText}
        color="brand.white"
        fontFamily="body"
        fontWeight={500}
        fontSize={15}>
        {buttonText}
      </Text>
    </Button>
  );
};

export default LongButton;
