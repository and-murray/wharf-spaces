import React from 'react';
import { View} from 'native-base';
import {Text} from '@components/ui'
import {ClockIcon} from '@res/images/ClockIcon';

type ReservedCountProps = {
  count: number | undefined;
};

const ReservedCount = ({count}: ReservedCountProps) => (
  <View
    flexDirection={'row'}
    alignItems={'center'}
    justifyContent={'flex-start'}>
    <Text
      fontFamily={'body'}
      fontWeight="500"
      size="sm"
      color="brand.orange"
      marginRight={0.5}
      testID={'ReserveCountTextId'}>
      {count}
    </Text>
    <ClockIcon iconSize={'16'} />
  </View>
);
export default ReservedCount;
