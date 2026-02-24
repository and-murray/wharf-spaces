import React from 'react';
import {Text, View} from '@gluestack-ui/themed-native-base';
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
      fontSize={14}
      color="brand.orange"
      marginRight={0.5}
      testID={'ReserveCountTextId'}>
      {count}
    </Text>
    <ClockIcon iconSize={'16'} />
  </View>
);
export default ReservedCount;
