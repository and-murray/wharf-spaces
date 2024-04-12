import React, {useEffect, useState} from 'react';
import {DimensionValue} from 'react-native';
import {Plus} from '@res/images/Plus';
import {Minus} from '@res/images/Minus';
import {parseInt} from 'lodash';
import {InfoCircle} from '@res/images/InfoCircle';
import {
  Box,
  Input,
  InputField,
  InputSlot,
  Text,
  VStack,
} from '@gluestack-ui/themed';

type CounterProps = {
  upperLimit: number;
  lowerLimit: number;
  initialValue: number;
  onCountChanged: (count: number) => void;
  setCountValid: (isValid: boolean) => void;
  invalidInputWarningWidth: DimensionValue;
};

const Counter = ({
  upperLimit,
  lowerLimit,
  initialValue,
  onCountChanged,
  setCountValid,
  invalidInputWarningWidth,
}: CounterProps) => {
  const [count, setCount] = useState<number>(initialValue);
  const [isInputEmpty, setInputEmpty] = useState<boolean>(false);
  const [isInputValid, setInputValid] = useState<boolean>(true);
  const [isMinusEnabled, setMinusEnabled] = useState<boolean>(
    count > lowerLimit,
  );
  const [isPlusEnabled, setPlusEnabled] = useState<boolean>(count < upperLimit);

  useEffect(() => {
    if (count >= lowerLimit && count <= upperLimit) {
      setInputValid(true);
      setCountValid(true);
      onCountChanged(count);
    } else {
      setInputValid(false);
      setCountValid(false);
    }
    setMinusEnabled(count > lowerLimit ? true : false);
    setPlusEnabled(count < upperLimit ? true : false);
  }, [count, lowerLimit, onCountChanged, setCountValid, upperLimit]);

  return (
    <VStack maxWidth={'$1/2'} flex={1}>
      {!isInputValid && (
        <Box
          display="flex"
          flexDirection="row"
          marginBottom={-5}
          width={invalidInputWarningWidth}>
          <InfoCircle />
          <Text
            testID="CounterInvalidInputWarning"
            marginLeft={2}
            size="xs"
            color="$otherPrimaryRed">
            {`Enter a number betweeen ${lowerLimit} and ${upperLimit}`}
          </Text>
        </Box>
      )}
      <Input
        testID="CounterTextInput"
        variant="rounded"
        borderColor="$otherGrey">
        <InputSlot
          testID="MinusButton"
          accessibilityLabel="Minus"
          accessibilityRole="button"
          disabled={!isMinusEnabled}
          opacity={isMinusEnabled ? 1 : 0.3}
          backgroundColor="$otherGrey"
          onPress={() => {
            setCount(count - 1);
          }}
          padding={'$2'}>
          <Minus />
        </InputSlot>
        <InputField
          value={isInputEmpty ? '' : count.toString()}
          textAlign="center"
          selectTextOnFocus
          fontWeight="$normal"
          keyboardType="numeric"
          onChangeText={text => {
            if (!isNaN(parseInt(text))) {
              setCount(parseInt(text));
              setInputEmpty(false);
            } else if (text === '') {
              setInputEmpty(true);
              setCount(0);
            }
          }}
          onSubmitEditing={() => {
            isInputEmpty ? setCount(initialValue) : null;
            setInputEmpty(false);
          }}
        />
        <InputSlot
          testID="PlusButton"
          accessibilityLabel="Plus"
          accessibilityRole="button"
          disabled={!isPlusEnabled}
          opacity={isPlusEnabled ? 1 : 0.3}
          backgroundColor="$otherGrey"
          onPress={() => {
            setCount(count + 1);
          }}
          padding={'$2'}>
          <Plus />
        </InputSlot>
      </Input>
    </VStack>
  );
};

export default Counter;
