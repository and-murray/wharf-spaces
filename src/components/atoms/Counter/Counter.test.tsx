import {act, fireEvent, render} from '@testing-library/react-native';
import React from 'react';
import {TestWrapper} from '@components/TestWrapper';
import Counter from '@atoms/Counter/Counter';

const counter = (
  <Counter
    upperLimit={100}
    lowerLimit={1}
    initialValue={1}
    onCountChanged={jest.fn()}
    setCountValid={jest.fn()}
    invalidInputWarningWidth={100}
  />
);
describe('when the counter is displayed', () => {
  it('adds one to the count when Plus is clicked', () => {
    const {getByTestId} = render(<TestWrapper>{counter}</TestWrapper>);

    expect(getByTestId('CounterTextInput').props.value).toBe('1');
    act(() => {
      fireEvent.press(getByTestId('PlusButton'));
    });
    expect(getByTestId('CounterTextInput').props.value).toBe('2');
    act(() => {
      fireEvent.press(getByTestId('PlusButton'));
    });
    expect(getByTestId('CounterTextInput').props.value).toBe('3');
  });

  it('subtracts one from the count when Minus is clicked', () => {
    const {getByTestId} = render(<TestWrapper>{counter}</TestWrapper>);

    act(() => {
      fireEvent.changeText(getByTestId('CounterTextInput'), '99');
    });
    expect(getByTestId('CounterTextInput').props.value).toBe('99');

    act(() => {
      fireEvent.press(getByTestId('MinusButton'));
    });
    expect(getByTestId('CounterTextInput').props.value).toBe('98');
    act(() => {
      fireEvent.press(getByTestId('MinusButton'));
    });
    expect(getByTestId('CounterTextInput').props.value).toBe('97');
  });

  it('disables the plus button when upper limit is reached', () => {
    const {getByTestId} = render(<TestWrapper>{counter}</TestWrapper>);

    act(() => {
      fireEvent.changeText(getByTestId('CounterTextInput'), '99');
    });
    expect(getByTestId('CounterTextInput').props.value).toBe('99');

    act(() => {
      fireEvent.press(getByTestId('PlusButton'));
    });
    expect(getByTestId('CounterTextInput').props.value).toBe('100');
    act(() => {
      fireEvent.press(getByTestId('PlusButton'));
    });
    expect(getByTestId('CounterTextInput').props.value).toBe('100');
  });

  it('disables the minus button when lower limit is reached', () => {
    const {getByTestId} = render(<TestWrapper>{counter}</TestWrapper>);

    act(() => {
      fireEvent.press(getByTestId('PlusButton'));
    });
    expect(getByTestId('CounterTextInput').props.value).toBe('2');
    act(() => {
      fireEvent.press(getByTestId('MinusButton'));
    });
    expect(getByTestId('CounterTextInput').props.value).toBe('1');
    act(() => {
      fireEvent.press(getByTestId('MinusButton'));
    });
    expect(getByTestId('CounterTextInput').props.value).toBe('1');
  });

  it('shows warning when input is invalid', () => {
    const {getByTestId, queryByTestId} = render(
      <TestWrapper>{counter}</TestWrapper>,
    );

    expect(queryByTestId('CounterInvalidInputWarning')).toBeFalsy();
    act(() => {
      fireEvent.changeText(getByTestId('CounterTextInput'), '101');
    });
    expect(queryByTestId('CounterInvalidInputWarning')).toBeTruthy();
    act(() => {
      fireEvent.changeText(getByTestId('CounterTextInput'), '0');
    });
    expect(queryByTestId('CounterInvalidInputWarning')).toBeTruthy();
    act(() => {
      fireEvent.changeText(getByTestId('CounterTextInput'), '5');
    });
    expect(queryByTestId('CounterInvalidInputWarning')).toBeFalsy();
  });

  it('does not accept non-numerical input', () => {
    const {getByTestId} = render(<TestWrapper>{counter}</TestWrapper>);

    act(() => {
      fireEvent.changeText(getByTestId('CounterTextInput'), 'p');
    });
    expect(getByTestId('CounterTextInput').props.value).toBe('1');
  });

  it('does allow the user to delete the field`s contents', () => {
    const {getByTestId, queryByTestId} = render(
      <TestWrapper>{counter}</TestWrapper>,
    );
    act(() => {
      fireEvent.changeText(getByTestId('CounterTextInput'), '');
    });
    expect(getByTestId('CounterTextInput').props.value).toBe('');
    expect(queryByTestId('CounterInvalidInputWarning')).toBeTruthy();
  });
});
