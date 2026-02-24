import {Icon} from '@gluestack-ui/themed-native-base';
import React from 'react';
import Svg, {Path} from 'react-native-svg';
import {StrokeColor} from '@customTypes/index';

export const InfoCircle = ({color, iconSize}: StrokeColor) => (
  <Icon
    accessibilityLabel="Warning"
    width="22"
    height="23"
    viewBox="0 0 22 23"
    size={iconSize ? `${iconSize}px` : '20px'}>
    <Svg fill="none">
      <Path
        stroke={color ? color : '#D82036'}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11 15.274v-4m0-4h.01m9.99 4c0 5.523-4.477 10-10 10s-10-4.477-10-10c0-5.522 4.477-10 10-10s10 4.478 10 10Z"
      />
    </Svg>
  </Icon>
);
