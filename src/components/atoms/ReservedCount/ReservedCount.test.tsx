import React from 'react';
import {TestWrapper} from '@components/TestWrapper';
import {render} from '@testing-library/react-native';
import ReservedCount from './ReservedCount';
import {ClockIcon} from '@res/images';

jest.mock('@res/images', () => ({
  ClockIcon: jest.fn(),
}));

describe('ReservedCount', () => {
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
      expect(ClockIcon).toHaveBeenCalled();
      expect(getByTestId('ReserveCountTextId')).toBeTruthy();
      expect(getByTestId('ReserveCountTextId').children).toContain(expected);
    },
  );
});
