import React from 'react';
import {HStack, Text, View} from 'native-base';
import WarningSymbol, {
  WarningSymbolIcon,
} from '@atoms/Warning/WarningSymbol/WarningSymbol';

export type SimpleInfoMessageType = {
  message: string;
  iconColor?: string;
  iconSize?: number;
};

export const SimpleInfoMessage = ({
  message,
  iconColor = '#434343', // default color
  iconSize,
}: SimpleInfoMessageType) => {
  return (
    <HStack space="xs" alignItems={'flex-start'}>
      <View paddingTop={'0.5'}>
        <WarningSymbol
          symbolToUse={WarningSymbolIcon.infoCircle}
          color={iconColor}
          iconSize={iconSize ? `${iconSize}` : '16'}
        />
      </View>
      <Text
        fontFamily={'body'}
        fontWeight="400"
        fontSize={iconSize ? iconSize - 2 : 14}
        flexGrow="1"
        flexBasis="0"
        testID={'WarningMessage'}>
        {message}
      </Text>
    </HStack>
  );
};

export default SimpleInfoMessage;
