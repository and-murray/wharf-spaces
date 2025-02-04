import React from 'react';
import {TestWrapper} from '@components/TestWrapper';
import {render, fireEvent} from '@testing-library/react-native';
import SelectableDate from './SelectableDate';

describe('When a selectable date is on screen ', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Renders Correctly', () => {
    const {getByTestId} = render(
      <TestWrapper>
        <SelectableDate
          date="2023-04-21"
          selected={true}
          disabled={false}
          isCurrentDate={false}
          onPress={jest.fn()}
          isBooked={false}
        />
      </TestWrapper>,
    );

    expect(getByTestId('SelectableDate')).toBeTruthy();
  });

  it('Formats and displays the date correctly', () => {
    const {getByText} = render(
      <TestWrapper>
        <SelectableDate
          date="2023-04-24"
          selected={false}
          disabled={true}
          isCurrentDate={false}
          onPress={jest.fn()}
          isBooked={false}
        />
      </TestWrapper>,
    );

    expect(getByText('Mon')).toBeTruthy();
    expect(getByText('24')).toBeTruthy();
  });

  it('Does not call the onPress when the button is pressed and disabled=true', () => {
    const mockOnPressFunction = jest.fn();

    const {getByTestId} = render(
      <TestWrapper>
        <SelectableDate
          date="2023-04-21"
          selected={false}
          disabled={true}
          isCurrentDate={false}
          onPress={mockOnPressFunction}
          isBooked={false}
        />
      </TestWrapper>,
    );
    fireEvent.press(getByTestId('SelectableDate'));
    expect(mockOnPressFunction).toHaveBeenCalledTimes(0);
  });

  it('Calls the onPress when the button is pressed and disabled=false', () => {
    const mockOnPressFunction = jest.fn();

    const {getByTestId} = render(
      <TestWrapper>
        <SelectableDate
          date="2023-04-21"
          selected={false}
          disabled={false}
          isCurrentDate={false}
          onPress={mockOnPressFunction}
          isBooked={false}
        />
      </TestWrapper>,
    );
    fireEvent.press(getByTestId('SelectableDate'));
    expect(mockOnPressFunction).toHaveBeenCalledTimes(1);
  });

  it('Has the selected styling when selected=true', () => {
    const {getByTestId} = render(
      <TestWrapper>
        <SelectableDate
          date="2023-04-21"
          selected={true}
          disabled={false}
          isCurrentDate={false}
          onPress={jest.fn()}
          isBooked={false}
        />
      </TestWrapper>,
    );

    const selectableDate = getByTestId('SelectableDate');

    expect(selectableDate.props.style.backgroundColor).toBe('#d82036');
    expect(selectableDate.props.style.borderColor).toBe('#d82036');
    expect(selectableDate.props.style.opacity).toBe(1);
    expect(getByTestId('SelectableDateDayName').props.style.color).toBe(
      '#ffffff',
    );
    expect(getByTestId('SelectableDateDayNumber').props.style.color).toBe(
      '#ffffff',
    );
  });

  it('Has the current date styling when isCurrentDate=true', () => {
    const {getByTestId} = render(
      <TestWrapper>
        <SelectableDate
          date="2023-04-21"
          selected={false}
          disabled={false}
          isCurrentDate={true}
          onPress={jest.fn()}
          isBooked={false}
        />
      </TestWrapper>,
    );

    const selectableDate = getByTestId('SelectableDate');

    expect(selectableDate.props.style.backgroundColor).toBe('#ffffff');
    expect(selectableDate.props.style.borderColor).toBe('#d82036');
    expect(selectableDate.props.style.opacity).toBe(1);
    expect(getByTestId('SelectableDateDayName').props.style.color).toBe(
      '#323232',
    );
    expect(getByTestId('SelectableDateDayNumber').props.style.color).toBe(
      '#323232',
    );
  });

  it('Has the default styling when isCurrentDate=false and selected=false', () => {
    const {getByTestId} = render(
      <TestWrapper>
        <SelectableDate
          date="2023-04-21"
          selected={false}
          disabled={false}
          isCurrentDate={false}
          onPress={jest.fn()}
          isBooked={false}
        />
      </TestWrapper>,
    );

    const selectableDate = getByTestId('SelectableDate');

    expect(selectableDate.props.style.backgroundColor).toBe('#f6f6f6');
    expect(selectableDate.props.style.borderColor).toBe('#f6f6f6');
    expect(selectableDate.props.style.opacity).toBe(1);
    expect(getByTestId('SelectableDateDayName').props.style.color).toBe(
      '#757575',
    );
    expect(getByTestId('SelectableDateDayNumber').props.style.color).toBe(
      '#434343',
    );
  });

  it('Has 0.5 opacity when disabled=true', () => {
    const {getByTestId} = render(
      <TestWrapper>
        <SelectableDate
          date="2023-04-21"
          selected={false}
          disabled={true}
          isCurrentDate={false}
          onPress={jest.fn()}
          isBooked={false}
        />
      </TestWrapper>,
    );

    expect(getByTestId('SelectableDate').props.style.opacity).toBe(0.5);
  });

  it('Tick is present when isBooked=true', () => {
    const {getByTestId} = render(
      <TestWrapper>
        <SelectableDate
          date="2023-04-21"
          selected={false}
          disabled={true}
          isCurrentDate={false}
          onPress={jest.fn()}
          isBooked={true}
        />
      </TestWrapper>,
    );

    expect(getByTestId('SelectableDateTick')).toBeTruthy();
  });

  it('Tick is not present when isBooked=false', () => {
    const {queryByTestId} = render(
      <TestWrapper>
        <SelectableDate
          date="2023-04-21"
          selected={false}
          disabled={true}
          isCurrentDate={false}
          onPress={jest.fn()}
          isBooked={false}
        />
      </TestWrapper>,
    );

    expect(queryByTestId('SelectableDateTick')).not.toBeTruthy();
  });
});
