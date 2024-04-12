import {Icon} from 'native-base';
import React from 'react';
import Svg, {Path} from 'react-native-svg';

export const LogoutIcon = () => (
  <Icon width="22" height="23" viewBox="0 0 22 23" size="20px">
    <Svg fill="none">
      <Path
        stroke="#D82036"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1}
        d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z"
      />
    </Svg>
  </Icon>
);
