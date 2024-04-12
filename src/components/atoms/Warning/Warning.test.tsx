import React from 'react';
import {render} from '@testing-library/react-native';
import Warning from './Warning';
import {TestWrapper} from '@components/TestWrapper';
import {WarningSymbolIcon} from './WarningSymbol/WarningSymbol';
import * as WarningSymbol from './WarningSymbol/WarningSymbol';

const warningSymbolSpy = jest.spyOn(WarningSymbol, 'default');
describe('When a Warning is on the screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    warningSymbolSpy.mockReturnValue(<></>);
  });
  it('renders correctly', () => {
    const {getByTestId} = render(
      <TestWrapper>
        <Warning
          borderColor="$brandWhite"
          warningMessage="this is a warning"
          symbolToUse={WarningSymbolIcon.infoCircle}
        />
      </TestWrapper>,
    );
    expect(getByTestId('Warning')).toBeTruthy();
    expect(getByTestId('WarningMessage').children).toContain(
      'this is a warning',
    );
  });

  it('renders with the passed props', () => {
    const {getByTestId} = render(
      <TestWrapper>
        <Warning
          borderColor="$brandWhite"
          warningMessage="TEST MESSAGE"
          symbolToUse={WarningSymbolIcon.warningTriangle}
          backgroundColor="#000000"
        />
      </TestWrapper>,
    );
    expect(getByTestId('Warning')).toBeTruthy();
    expect(getByTestId('Warning').props.style.backgroundColor).toBe('#000000');
    expect(getByTestId('WarningMessage').children).toContain('TEST MESSAGE');
    expect(warningSymbolSpy).toBeCalledWith(
      expect.objectContaining({symbolToUse: WarningSymbolIcon.warningTriangle}),
      {},
    );
  });
});
