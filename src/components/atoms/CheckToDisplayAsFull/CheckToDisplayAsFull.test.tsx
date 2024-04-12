import React from 'react';
import CheckToDisplayAsFull from './CheckToDisplayAsFull';
import {TestWrapper} from '@components/TestWrapper';
import {render} from '@testing-library/react-native';
import * as ReservedCount from '@atoms/ReservedCount/ReservedCount';
import {parseGluestackComponentStyleProps} from '@root/src/util/GluestackUtils/GluestackUtils';

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
          subheadingTextColor="$brandRed"
          subheadingTextColorFull="$otherDarkRed"
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
          subheadingTextColor="$brandRed"
          subheadingTextColorFull="$otherDarkRed"
        />
      </TestWrapper>,
    );

    expect(reserveCountSpy).toHaveBeenCalledWith(
      expect.objectContaining({count: expected}),
      {},
    );
  });

  it('will be highlighted in red when the office is full', () => {
    const {getByTestId} = render(
      <TestWrapper>
        <CheckToDisplayAsFull
          id={100}
          capacity={36}
          spaceLeft={0}
          subheadingTextColor="$brandRed"
          subheadingTextColorFull="$otherDarkRed"
        />
      </TestWrapper>,
    );

    const styleProps = parseGluestackComponentStyleProps(
      getByTestId('DayTimeSelectorSubheading-100').props.style,
    );

    expect(styleProps.color).toBe('#ef4444');
  });
});
