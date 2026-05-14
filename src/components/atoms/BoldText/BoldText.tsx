import React from 'react';
import {Text, ITextProps} from '@components/ui';

const BoldText = (props: ITextProps) => (
  <Text bold>{props.children}</Text>
);

export default BoldText;
