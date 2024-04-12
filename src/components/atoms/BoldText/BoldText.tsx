import {Text} from '@gluestack-ui/themed';
import React from 'react';
import {TextProps} from 'react-native';

const BoldText = (props: TextProps) => (
  <Text fontWeight="$bold">{props.children}</Text>
);

export default BoldText;
