import React from 'react';
import {WarningTriangle} from '@res/images/WarningTriangle';
import {InfoCircle} from '@res/images/InfoCircle';

export enum WarningSymbolIcon {
  warningTriangle = 'WarningTriangle',
  infoCircle = 'InfoCircle',
}

type WarningSymbolProps = {
  symbolToUse: WarningSymbolIcon;
  color: string;
  iconSize?: string;
};

const WarningSymbol = ({symbolToUse, color, iconSize}: WarningSymbolProps) => {
  switch (symbolToUse) {
    case 'WarningTriangle':
      return <WarningTriangle color={color} iconSize={iconSize} />;
    case 'InfoCircle':
    default: //#2897ff
      return <InfoCircle color={color} iconSize={iconSize} />;
  }
};
export default WarningSymbol;
