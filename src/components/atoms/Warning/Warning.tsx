import React from 'react';
import WarningSymbol from './WarningSymbol/WarningSymbol';
import {WarningSymbolKey} from './WarningSymbol/WarningSymbol';
import {getHexValue} from '@root/gluestack-ui.config';
import {Box, HStack, Text} from '@gluestack-ui/themed';

export type WarningProps = {
  warningMessage: string;
  backgroundColor?: string;
  symbolToUse: WarningSymbolKey;
  borderColor: string;
};

const Warning = ({
  warningMessage,
  backgroundColor,
  symbolToUse,
  borderColor,
}: WarningProps) => {
  return (
    <Box
      borderColor={borderColor}
      borderWidth={1}
      p="$4"
      borderRadius="$xl"
      backgroundColor={backgroundColor}
      testID="Warning"
      accessible={true}>
      <HStack space="sm" alignItems="center">
        <WarningSymbol
          iconSize={20}
          symbolToUse={symbolToUse}
          color={getHexValue(borderColor)}
        />
        <Text
          fontFamily="$body"
          fontWeight="$medium"
          size="sm"
          flexGrow={1}
          flexBasis={0}
          testID="WarningMessage">
          {warningMessage}
        </Text>
      </HStack>
    </Box>
  );
};

export default Warning;
