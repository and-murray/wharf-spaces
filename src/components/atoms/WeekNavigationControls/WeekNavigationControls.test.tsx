import React from 'react';
import {TestWrapper} from '@components/TestWrapper';
import {render, fireEvent} from '@testing-library/react-native';
import WeekNavigationControls from './WeekNavigationControls';
import {Chevron} from '@res/images';

jest.mock('@res/images', () => ({
  Chevron: jest.fn(),
}));

describe('When week navigation controls is shown on screen', () => {
  it('Renders Correctly', () => {
    const {getByTestId} = render(
      <TestWrapper>
        <WeekNavigationControls weekOffset={0} onPress={jest.fn()} />
      </TestWrapper>,
    );
    expect(getByTestId('WeekNavigationControls')).toBeTruthy();
  });

  it('Shows next week when weekOffset=0', () => {
    let weekOffset = 0;

    const {getByText} = render(
      <TestWrapper>
        <WeekNavigationControls weekOffset={weekOffset} onPress={jest.fn()} />
      </TestWrapper>,
    );
    expect(getByText('Next Week')).toBeTruthy();
  });

  it('Shows previous week when weekOffset=1', () => {
    let weekOffset = 1;

    const {getByText} = render(
      <TestWrapper>
        <WeekNavigationControls weekOffset={weekOffset} onPress={jest.fn()} />
      </TestWrapper>,
    );
    expect(getByText('Previous Week')).toBeTruthy();
  });

  it('Shows the right chevron when weekOffset=0', () => {
    let weekOffset = 0;
    render(
      <TestWrapper>
        <WeekNavigationControls weekOffset={weekOffset} onPress={jest.fn()} />
      </TestWrapper>,
    );
    expect(Chevron).toHaveBeenCalled();
  });

  it('Shows the left chevron when weekOffset=1', () => {
    let weekOffset = 1;
    render(
      <TestWrapper>
        <WeekNavigationControls weekOffset={weekOffset} onPress={jest.fn()} />
      </TestWrapper>,
    );
    expect(Chevron).toHaveBeenCalled();
  });

  it('Calls the onPress function when pressed', () => {
    const testOnPressFunction = jest.fn();

    const {getByTestId} = render(
      <TestWrapper>
        <WeekNavigationControls weekOffset={0} onPress={testOnPressFunction} />
      </TestWrapper>,
    );
    fireEvent.press(getByTestId('WeekNavigationControls'));
    expect(testOnPressFunction).toHaveBeenCalledTimes(1);
  });
});
