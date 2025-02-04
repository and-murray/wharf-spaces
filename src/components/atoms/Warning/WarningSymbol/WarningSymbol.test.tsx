import WarningSymbol from './WarningSymbol';
import React from 'react';
import {render} from '@testing-library/react-native';
import {TestWrapper} from '@components/TestWrapper';
import {WarningSymbolIcon} from './WarningSymbol';
import * as InfoCircle from '@res/images/InfoCircle';
import * as WarningTriangle from '@res/images/WarningTriangle';

const infoCircleSpy = jest.spyOn(InfoCircle, 'InfoCircle');
const warningTriangleSpy = jest.spyOn(WarningTriangle, 'WarningTriangle');
describe('Warning Symbol', () => {
  beforeAll(() => {
    infoCircleSpy.mockReturnValue(<></>);
    warningTriangleSpy.mockReturnValue(<></>);
  });
  it('renders correctly', () => {
    render(
      <TestWrapper>
        <WarningSymbol
          symbolToUse={WarningSymbolIcon.warningTriangle}
          color="#434343"
        />
      </TestWrapper>,
    );
    expect(warningTriangleSpy).toHaveBeenCalled();
  });

  it('renders InfoCircle when passed a symbol prop of InfoCircle', () => {
    render(
      <TestWrapper>
        <WarningSymbol
          symbolToUse={WarningSymbolIcon.infoCircle}
          color="#434343"
        />
      </TestWrapper>,
    );
    expect(infoCircleSpy).toHaveBeenCalled();
  });
});
