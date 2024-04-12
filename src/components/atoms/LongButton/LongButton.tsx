import {Button, ButtonText} from '@gluestack-ui/themed';
import React from 'react';

type LongButtonProps = {
  isDisabled: boolean;
  onPress: () => void;
  buttonText: string;
};

const LongButton = ({buttonText, isDisabled, onPress}: LongButtonProps) => {
  return (
    <Button
      $pressed={{opacity: 0.8}}
      accessibilityRole="button"
      backgroundColor="$otherGreyDark"
      borderRadius="$2xl"
      opacity={isDisabled ? 40 : 100}
      height="$12"
      alignItems="center"
      justifyContent="center"
      disabled={isDisabled}
      onPress={() => onPress()}>
      <ButtonText
        accessibilityLabel={buttonText}
        color="$brandWhite"
        fontFamily="$body"
        fontWeight="$medium"
        size="sm">
        {buttonText}
      </ButtonText>
    </Button>
  );
};

export default LongButton;
