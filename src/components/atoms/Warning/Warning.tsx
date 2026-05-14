import React from 'react';
import {Box, HStack} from 'native-base';
import { Text } from '@components/ui';
import WarningSymbol from './WarningSymbol/WarningSymbol';
import {WarningSymbolIcon} from './WarningSymbol/WarningSymbol';
import {getHexValue} from '@root/theme';

type WarningProps = {
  warningMessage: string;
  backgroundColor?: string;
  symbolToUse: WarningSymbolIcon;
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
      borderWidth={'1px'}
      p={'4'}
      borderRadius="xl"
      backgroundColor={backgroundColor}
      testID={'Warning'}
      accessible={true}>
      <HStack space="sm" alignItems={'center'}>
        <WarningSymbol
          symbolToUse={symbolToUse}
          color={getHexValue(borderColor)}
        />
        <Text
          fontFamily={'body'}
          fontWeight="400"
          size="sm"
          flexGrow="1"
          flexBasis="0"
          testID={'WarningMessage'}>
          {warningMessage}
        </Text>
      </HStack>
    </Box>
  );
};

export default Warning;
