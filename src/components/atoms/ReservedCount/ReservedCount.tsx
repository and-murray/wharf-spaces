import React from 'react';
import {ClockIcon} from '@res/images';
import {Text, View} from '@gluestack-ui/themed';

type ReservedCountProps = {
  count: string;
};

const ReservedCount = ({count}: ReservedCountProps) => (
  <View flexDirection="row" alignItems="center" justifyContent="flex-start">
    <Text
      fontFamily="$body"
      fontWeight="$medium"
      size="sm"
      color="$brandOrange"
      marginRight={0.5}
      testID="ReserveCountTextId">
      {count}
    </Text>
    <ClockIcon />
  </View>
);
export default ReservedCount;
