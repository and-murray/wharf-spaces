import React from 'react';
import Svg, {Path} from 'react-native-svg';
import {StrokeColor} from '@customTypes/index';
import {Icon} from '@gluestack-ui/themed-native-base';

export const DeskIcon = ({
  iconSize,
  iconViewBox,
  color,
  iconWidth,
  iconHeight,
  strokeWidth,
}: StrokeColor) => {
  return (
    <Icon
      size={iconSize ? iconSize : '2xl'}
      viewBox={iconViewBox ? iconViewBox : '0 0 33 32'}>
      <Svg
        stroke={color ? color : '#434343'}
        strokeWidth={strokeWidth ? strokeWidth : '1'}
        width={iconWidth ? iconWidth : '33'}
        height={iconHeight ? iconHeight : '32'}
        fill="none">
        <Path
          d="M11.167 28H21.8337M16.5003 22.6667V28M9.56699 22.6667H23.4337C25.6739 22.6667 26.794 22.6667 27.6496 22.2307C28.4023 21.8472 29.0142 21.2353 29.3977 20.4826C29.8337 19.627 29.8337 18.5069 29.8337 16.2667V10.4C29.8337 8.15979 29.8337 7.03969 29.3977 6.18404C29.0142 5.43139 28.4023 4.81947 27.6496 4.43597C26.794 4 25.6739 4 23.4337 4H9.56699C7.32678 4 6.20668 4 5.35103 4.43597C4.59838 4.81947 3.98646 5.43139 3.60297 6.18404C3.16699 7.03969 3.16699 8.15979 3.16699 10.4V16.2667C3.16699 18.5069 3.16699 19.627 3.60297 20.4826C3.98646 21.2353 4.59838 21.8472 5.35103 22.2307C6.20668 22.6667 7.32678 22.6667 9.56699 22.6667Z"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </Svg>
    </Icon>
  );
};
