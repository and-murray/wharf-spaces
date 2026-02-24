import React, {useEffect, useState} from 'react';
import {Platform} from 'react-native';
import {Flex, VStack, Input, Pressable, Text, View} from 'native-base';
import {Plus} from '@res/images/Plus';
import {Minus} from '@res/images/Minus';
import {parseInt} from 'lodash';
import {InfoCircle} from '@res/images/InfoCircle';

type CounterProps = {
  upperLimit: number;
  lowerLimit: number;
  initialValue: number;
  onCountChanged: (count: number) => void;
  setCountValid: (isValid: boolean) => void;
  invalidInputWarningWidth: React.CSSProperties['width'];
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
    <VStack>
      {!isInputValid && (
        <Flex
          direction="row"
          marginBottom={-5}
          width={invalidInputWarningWidth}>
          <InfoCircle />
          <Text
            testID="CounterInvalidInputWarning"
            marginLeft={2}
            fontSize={12}
            color="other.primaryRed">
            {`Enter a number betweeen ${lowerLimit} and ${upperLimit}`}
          </Text>
        </Flex>
      )}
      <View
        marginTop={8}
        width={40}
        height={12}
        borderWidth={2}
        borderColor="other.grey"
        backgroundColor="brand.white"
        borderRadius={50}
        justifyContent="center"
        alignItems="center">
        <View flexDirection="row" height="90%" width="97%">
          <View flex={1} backgroundColor="other.grey" borderLeftRadius={50}>
            <Pressable
              testID="MinusButton"
              accessibilityLabel="Minus"
              accessibilityRole="button"
              disabled={!isMinusEnabled}
              opacity={isMinusEnabled ? 1 : 0.3}
              height="100%"
              width="100%"
              borderLeftRadius={50}
              alignItems="center"
              justifyContent="center"
              backgroundColor="other.grey"
              onPress={() => {
                setCount(count - 1);
              }}>
              <Minus />
            </Pressable>
          </View>
          <View flex={1.2} backgroundColor="brand.white">
            <Input
              testID="CounterTextInput"
              keyboardType="numeric"
              variant="unstyled"
              padding={0}
              marginTop={Platform.OS === 'android' ? 0.5 : 0}
              height="100%"
              width="100%"
              textAlign="center"
              fontWeight="400"
              fontSize={20}
              selectTextOnFocus
              value={isInputEmpty ? '' : count.toString()}
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
          </View>
          <View
            flex={1}
            backgroundColor={'other.grey'}
            height="100%"
            width="100%"
            borderRightRadius={50}>
            <Pressable
              testID="PlusButton"
              accessibilityLabel="Plus"
              accessibilityRole="button"
              disabled={!isPlusEnabled}
              opacity={isPlusEnabled ? 1 : 0.3}
              height="100%"
              width="100%"
              borderRightRadius={50}
              alignItems="center"
              justifyContent="center"
              backgroundColor="other.grey"
              onPress={() => {
                setCount(count + 1);
              }}>
              <Plus />
            </Pressable>
          </View>
        </View>
      </View>
    </VStack>
  );
};

export default Counter;
