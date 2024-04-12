import React from 'react';
import Svg, {Path} from 'react-native-svg';
import {createIcon} from '@gluestack-ui/themed';
import {config} from '@root/gluestack-ui.config';

export const Cross = createIcon({
  viewBox: '0 0 21 21',
  path: (
    <Svg fill="none">
      <Path
        d="M13.0275 14.2769L14.1942 13.1102L11.2952 10.2112L14.212 7.29436L13.0275 6.10982L10.1107 9.02663L7.12343 6.03939L5.9567 7.20612L8.94395 10.1934L5.9567 13.1806L7.14125 14.3651L10.1285 11.3779L13.0275 14.2769ZM17.1115 17.2646C16.1334 18.2426 15.0314 18.9732 13.8056 19.4563C12.58 19.9397 11.3249 20.1814 10.0402 20.1814C8.75557 20.1814 7.50046 19.9397 6.2749 19.4563C5.04906 18.9732 3.94711 18.2426 2.96904 17.2646C1.99097 16.2865 1.25741 15.1816 0.768378 13.9498C0.279061 12.7183 0.0373712 11.4632 0.0433108 10.1844C0.0492505 8.90572 0.29391 7.65357 0.777288 6.42802C1.26038 5.20218 1.99097 4.10022 2.96904 3.12215C3.94711 2.14408 5.05203 1.41053 6.28381 0.921493C7.51531 0.432176 8.76745 0.187516 10.0402 0.187516C11.313 0.187516 12.5652 0.432175 13.7967 0.921493C15.0285 1.41053 16.1334 2.14408 17.1115 3.12215C18.0895 4.10022 18.8201 5.20218 19.3032 6.42802C19.7866 7.65357 20.0312 8.90572 20.0372 10.1844C20.0431 11.4632 19.8014 12.7183 19.3121 13.9498C18.8231 15.1816 18.0895 16.2865 17.1115 17.2646ZM15.9269 16.08C17.5651 14.4418 18.3841 12.4796 18.3838 10.1934C18.3841 7.90714 17.5651 5.94492 15.9269 4.3067C14.2887 2.66847 12.3294 1.84653 10.0492 1.84087C7.76859 1.83493 5.8034 2.65687 4.15358 4.3067C2.51536 5.94492 1.69341 7.90417 1.68776 10.1844C1.68182 12.465 2.50376 14.4302 4.15358 16.08C5.79181 17.7182 7.75403 18.5372 10.0402 18.5369C12.3265 18.5372 14.2887 17.7182 15.9269 16.08Z"
        fill={'currentColor' || config.tokens.colors.brandBlue}
      />
    </Svg>
  ),
});
