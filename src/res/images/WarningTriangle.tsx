import React from 'react';
import Svg, {Path} from 'react-native-svg';
import {StrokeColor} from '@customTypes/index';

export const WarningTriangle = ({color, iconSize}: StrokeColor) => {
  return (
    <Svg
      width={iconSize ?? '24'}
      height={iconSize ?? '24'}
      viewBox="0 0 24 24"
      fill="none">
      <Path
        stroke={color ? color : '#ff7900'}
        d="M1.86548 20.5995L12 3.09961L22.1346 20.5995H1.86548ZM4.45003 19.0995H19.55L12 6.09953L4.45003 19.0995ZM12 17.9072C12.2289 17.9072 12.4207 17.8298 12.5755 17.675C12.7303 17.5202 12.8077 17.3284 12.8077 17.0995C12.8077 16.8707 12.7303 16.6789 12.5755 16.5241C12.4207 16.3693 12.2289 16.2919 12 16.2919C11.7712 16.2919 11.5794 16.3693 11.4246 16.5241C11.2698 16.6789 11.1924 16.8707 11.1924 17.0995C11.1924 17.3284 11.2698 17.5202 11.4246 17.675C11.5794 17.8298 11.7712 17.9072 12 17.9072ZM11.2501 15.2919H12.75V10.2919H11.2501V15.2919Z"
        fill="#A40D1F"
      />
    </Svg>
  );
};
