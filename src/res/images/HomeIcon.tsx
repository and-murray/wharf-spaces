import React from 'react';
import Svg, {Path} from 'react-native-svg';
import {createIcon} from '@gluestack-ui/themed';
import {config} from '@root/gluestack-ui.config';

export const HomeIcon = createIcon({
  viewBox: '0 0 33 32',
  path: (
    <Svg fill="none">
      <Path
        d="M28.5 13.3337H4.5M21.8333 2.66699V8.00033M11.1667 2.66699V8.00033M12.5 21.3337L15.1667 24.0003L21.1667 18.0003M10.9 29.3337H22.1C24.3402 29.3337 25.4603 29.3337 26.316 28.8977C27.0686 28.5142 27.6805 27.9023 28.064 27.1496C28.5 26.294 28.5 25.1739 28.5 22.9337V11.7337C28.5 9.49345 28.5 8.37334 28.064 7.5177C27.6805 6.76505 27.0686 6.15313 26.316 5.76963C25.4603 5.33366 24.3402 5.33366 22.1 5.33366H10.9C8.65979 5.33366 7.53969 5.33366 6.68404 5.76963C5.93139 6.15313 5.31947 6.76505 4.93597 7.5177C4.5 8.37334 4.5 9.49345 4.5 11.7337V22.9337C4.5 25.1739 4.5 26.294 4.93597 27.1496C5.31947 27.9023 5.93139 28.5142 6.68404 28.8977C7.53969 29.3337 8.65979 29.3337 10.9 29.3337Z"
        stroke={'currentColor' || config.tokens.colors.otherGreyDark}
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </Svg>
  ),
});
