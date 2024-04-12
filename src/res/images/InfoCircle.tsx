import React from 'react';
import Svg, {Path} from 'react-native-svg';
import {createIcon} from '@gluestack-ui/themed';
import {config} from '@root/gluestack-ui.config';

export const InfoCircle = createIcon({
  viewBox: '0 0 22 23',
  path: (
    <Svg fill="none">
      <Path
        stroke={'currentColor' || config.tokens.colors.otherPrimaryRed}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11 15.274v-4m0-4h.01m9.99 4c0 5.523-4.477 10-10 10s-10-4.477-10-10c0-5.522 4.477-10 10-10s10 4.478 10 10Z"
      />
    </Svg>
  ),
});
