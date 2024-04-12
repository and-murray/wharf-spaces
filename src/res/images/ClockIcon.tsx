import React from 'react';
import Svg, {Path, Circle} from 'react-native-svg';
import {StrokeColor} from '@customTypes/index';

export const ClockIcon = ({color, iconSize}: StrokeColor) => {
  return (
    <Svg
      width={iconSize ?? '24'}
      height={iconSize ?? '24'}
      viewBox="0 0 24 24"
      fill="none">
      <Circle
        cx="12"
        cy="12"
        r="10"
        stroke={color ?? '#ff7900'}
        strokeWidth="3"
      />
      <Path
        d="M12 8V12L14.5 14.5"
        stroke={color ?? '#ff7900'}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
