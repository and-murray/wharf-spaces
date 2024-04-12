import React from 'react';
import Svg, {Path} from 'react-native-svg';
import {createIcon} from '@gluestack-ui/themed';
import {config} from '@root/gluestack-ui.config';

export const LogoutIcon = createIcon({
  viewBox: '0 0 22 23',
  path: (
    <Svg fill="none">
      <Path
        stroke={config.tokens.colors.otherPrimaryRed}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1}
        d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z"
      />
    </Svg>
  ),
});
