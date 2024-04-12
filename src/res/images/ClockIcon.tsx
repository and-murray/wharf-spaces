import React from 'react';
import Svg, {Path, Circle} from 'react-native-svg';
import {createIcon} from '@gluestack-ui/themed';
import {config} from '@root/gluestack-ui.config';

export const ClockIcon = createIcon({
  viewBox: '0 0 24 24',
  path: (
    <Svg fill="none">
      <Circle
        cx="12"
        cy="12"
        r="10"
        stroke={'currentColor' || config.tokens.colors.brandOrange}
        strokeWidth="3"
      />
      <Path
        d="M12 8V12L14.5 14.5"
        stroke={'currentColor' || config.tokens.colors.brandOrange}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  ),
});
