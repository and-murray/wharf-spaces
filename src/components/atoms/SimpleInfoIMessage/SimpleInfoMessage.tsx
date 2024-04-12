import React from 'react';
import WarningSymbol from '@atoms/Warning/WarningSymbol/WarningSymbol';
import {HStack, Text, View} from '@gluestack-ui/themed';
import {DimensionValue} from 'react-native';

export type SimpleInfoMessageType = {
  message: string;
  iconColor?: string;
  iconSize?: DimensionValue;
};

export const SimpleInfoMessage = ({
  message,
  iconColor = '$otherGreyDark',
  iconSize,
}: SimpleInfoMessageType) => {
  return (
    <HStack space="xs" alignItems="flex-start">
      <View paddingTop={'$1'}>
        <WarningSymbol
          symbolToUse="infoCircle"
          color={iconColor}
          iconSize={iconSize ? iconSize : 16}
        />
      </View>
      <Text
        fontFamily="$body"
        fontWeight="$normal"
        size="sm" //TODO: Previously we had this set to iconSize ? iconSize - 2 : 14, gluestack by default does not accept numbers as size - Either customise Text to accept size as a number or create a size selector to pick the closest size alias
        flexGrow={1}
        flexBasis={0}
        testID="WarningMessage">
        {message}
      </Text>
    </HStack>
  );
};

export default SimpleInfoMessage;
