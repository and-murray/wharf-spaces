import React from 'react';
import {Text} from '@gluestack-ui/themed-native-base';
import {StyleSheet} from 'react-native';

const BoldText = (props: {children: any}) => (
  <Text style={style.textBold}>{props.children}</Text>
);

const style = StyleSheet.create({
  textBold: {
    fontWeight: 'bold',
  },
});
export default BoldText;
