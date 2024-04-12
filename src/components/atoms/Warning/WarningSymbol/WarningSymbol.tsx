import React from 'react';
import {WarningTriangle} from '@res/images/WarningTriangle';
import {InfoCircle} from '@res/images/InfoCircle';
import {DimensionValue} from 'react-native';

export const WarningSymbolIcon = {
  warningTriangle: WarningTriangle,
  infoCircle: InfoCircle,
};

export type WarningSymbolKey = keyof typeof WarningSymbolIcon;

type WarningSymbolProps = {
  symbolToUse: WarningSymbolKey;
  color: string;
  iconSize?: DimensionValue;
};

const WarningSymbol = ({symbolToUse, color, iconSize}: WarningSymbolProps) => {
  const SymbolComponent = WarningSymbolIcon[symbolToUse] || InfoCircle; // Default to InfoCircle if icon invalid or missing

  return <SymbolComponent color={color} height={iconSize} width={iconSize} />;
};

export default WarningSymbol;
