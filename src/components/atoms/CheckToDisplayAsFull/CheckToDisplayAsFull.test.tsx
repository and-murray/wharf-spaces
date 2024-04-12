import React from 'react';
import CheckToDisplayAsFull from './CheckToDisplayAsFull';
import {TestWrapper} from '@components/TestWrapper';
import {render} from '@testing-library/react-native';
import * as ReservedCount from '@atoms/ReservedCount/ReservedCount';

const reserveCountSpy = jest.spyOn(ReservedCount, 'default');
describe('Check To Display As Full tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each`
    argument     | expected
    ${undefined} | ${' '}
    ${2}         | ${'2/36'}
    ${1}         | ${'1/36'}
    ${0}         | ${'Full'}
  `('displays $expected when desks is $argument', ({argument, expected}) => {
    const itemId = 100;

    reserveCountSpy.mockReturnValue(<></>);
    const {getByTestId} = render(
      <TestWrapper>
        <CheckToDisplayAsFull
          id={itemId}
          capacity={36}
          spaceLeft={argument}
          subheadingTextColor="brand.red"
          subheadingTextColorFull="other.darkRed"
        />
      </TestWrapper>,
    );
    expect(getByTestId('DayTimeSelectorSubheading-100').children).toContain(
      expected,
    );
  });

  it.each`
    argument | expected
    ${-1}    | ${'1'}
    ${-2}    | ${'2'}
  `('displays $expected when desks is $argument', ({argument, expected}) => {
    const itemId = 100;

    render(
      <TestWrapper>
        <CheckToDisplayAsFull
          id={itemId}
          capacity={36}
          spaceLeft={argument}
          subheadingTextColor="brand.red"
          subheadingTextColorFull="other.darkRed"
        />
      </TestWrapper>,
    );

    expect(reserveCountSpy).toBeCalledWith(
      expect.objectContaining({count: expected}),
      {},
    );
  });

  it('will be highlighted in red when the office is full', () => {
    const itemId = 100;
    const {getByTestId} = render(
      <TestWrapper>
        <CheckToDisplayAsFull
          id={itemId}
          capacity={36}
          spaceLeft={0}
          subheadingTextColor="brand.red"
          subheadingTextColorFull="other.darkRed"
        />
      </TestWrapper>,
    );
    expect(getByTestId('DayTimeSelectorSubheading-100').props.style.color).toBe(
      '#ef4444',
    );
  });
});
