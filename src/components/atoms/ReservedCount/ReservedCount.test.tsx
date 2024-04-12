import React from 'react';
import {TestWrapper} from '@components/TestWrapper';
import {render} from '@testing-library/react-native';
import ReservedCount from './ReservedCount';
import * as ClockIcon from '@res/images/ClockIcon';

const clockIconSpy = jest.spyOn(ClockIcon, 'ClockIcon');
describe('ReservedCount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clockIconSpy.mockReturnValue(<></>);
  });
  it.each`
    argument | expected
    ${'1'}   | ${'1'}
    ${'2'}   | ${'2'}
  `(
    'should display provided argument $argument as expected text $expected correctly',
    ({argument, expected}) => {
      const {getByTestId} = render(
        <TestWrapper>
          <ReservedCount count={argument} />
        </TestWrapper>,
      );
      expect(clockIconSpy).toBeCalled();
      expect(getByTestId('ReserveCountTextId')).toBeTruthy();
      expect(getByTestId('ReserveCountTextId').children).toContain(expected);
    },
  );
});
