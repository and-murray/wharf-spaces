import React from 'react';
import Svg, {Path, Rect} from 'react-native-svg';
import {config} from '@root/gluestack-ui.config';
import {createIcon} from '@gluestack-ui/themed';

export const Chevron = createIcon({
  viewBox: '0 0 24 24',
  path: (
    <Svg fill="none">
      <Rect
        y="0.111328"
        width="24"
        height="24"
        rx="12"
        fill={config.tokens.colors.otherLightGrey}
      />
      <Path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M8.55355 18.3468C8.19048 17.9838 8.19048 17.3951 8.55355 17.0321L13.4743 12.1113L8.55355 7.19059C8.19048 6.82753 8.19048 6.23888 8.55355 5.87582C8.91662 5.51275 9.50526 5.51275 9.86833 5.87582L15.4465 11.4539C15.6208 11.6283 15.7188 11.8648 15.7188 12.1113C15.7188 12.3579 15.6208 12.5944 15.4465 12.7687L9.86833 18.3468C9.50526 18.7099 8.91661 18.7099 8.55355 18.3468Z"
        fill={config.tokens.colors.brandCharcoal}
      />
    </Svg>
  ),
});
