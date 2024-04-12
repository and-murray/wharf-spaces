import React from 'react';
import {TestWrapper} from '@components/TestWrapper';
import {render, fireEvent} from '@testing-library/react-native';
import WeekNavigationControls from './WeekNavigationControls';
import * as ChevronLeft from '@res/images/ChevronLeft';
import * as ChevronRight from '@res/images/ChevronRight';

const chevronLeftSpy = jest.spyOn(ChevronLeft, 'ChevronLeft');
const chevronRightSpy = jest.spyOn(ChevronRight, 'ChevronRight');
describe('When week navigation controls is shown on screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    chevronLeftSpy.mockReturnValue(<></>);
    chevronRightSpy.mockReturnValue(<></>);
  });

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
    expect(chevronRightSpy).toHaveBeenCalled();
  });

  it('Shows the left chevron when weekOffset=1', () => {
    let weekOffset = 1;
    render(
      <TestWrapper>
        <WeekNavigationControls weekOffset={weekOffset} onPress={jest.fn()} />
      </TestWrapper>,
    );
    expect(chevronLeftSpy).toHaveBeenCalled();
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
