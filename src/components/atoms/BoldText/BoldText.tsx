import React from 'react';
import {Text, ITextProps} from '@gluestack-ui/themed-native-base';
import {StyleSheet} from 'react-native';

const BoldText = (props: ITextProps) => (
  <Text style={style.textBold}>{props.children}</Text>
);

const style = StyleSheet.create({
  textBold: {
    fontWeight: 'bold',
  },
});
export default BoldText;
