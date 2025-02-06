import React from 'react';
import {TestWrapper} from '@components/TestWrapper';
import {render, waitFor} from '@testing-library/react-native';
import DeskCalendar from './DeskCalendar';
import * as weekNavigationControls from '@atoms/WeekNavigationControls/WeekNavigationControls';
import * as hooks from '@state/utils/hooks';
import {act} from 'react-test-renderer';

jest.mock('@molecules/CalendarWeek/CalendarWeek');

describe('When desk calendar is shown on screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(new Date('2023-06-26'));
  });

  it('Renders Correctly', () => {
    const {getByTestId} = render(
      <TestWrapper>
        <DeskCalendar />
      </TestWrapper>,
    );

    expect(getByTestId('DeskCalendar')).toBeTruthy();
  });

  it('Renders the selected day corectly', async () => {
    jest
      .spyOn(hooks, 'useAppSelector')
      .mockReturnValueOnce({selectedDay: '2023-06-26'});

    const {getByText} = render(
      <TestWrapper>
        <DeskCalendar />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(getByText('Monday, 26 June')).toBeTruthy();
    });
  });

  it('Clears the selected day from the screen when it is unselected', async () => {
    jest
      .spyOn(hooks, 'useAppSelector')
      .mockReturnValueOnce({selectedDay: '2023-06-26'})
      .mockReturnValueOnce({selectedDay: ''});

    const {getByText} = render(
      <TestWrapper>
        <DeskCalendar />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(getByText('Monday, 26 June')).toBeTruthy();
    });

    const {queryByText} = render(
      <TestWrapper>
        <DeskCalendar />
      </TestWrapper>,
    );
    await waitFor(() => {
      expect(queryByText('Monday, 26 June')).toBeNull();
    });
  });

  it('Changes the week offset from 0 to 1 when the change week offset function is called', async () => {
    const mockWeekNavigationControls = jest.spyOn(
      weekNavigationControls,
      'default',
    );
    render(
      <TestWrapper>
        <DeskCalendar />
      </TestWrapper>,
    );
    const weekOffset = mockWeekNavigationControls.mock.calls[0][0].weekOffset;
    const changeWeekOffset =
      mockWeekNavigationControls.mock.calls[0][0].onPress;

    expect(weekOffset).toBe(0);
    act(() => {
      changeWeekOffset();
    });

    await waitFor(() => {
      const updatedWeekOffset =
        mockWeekNavigationControls.mock.calls[1][0].weekOffset;
      expect(updatedWeekOffset).toBe(1);
    });
  });
  it('Changes the week offset from 1 to 0 when the change week offset function is called', async () => {
    const mockWeekNavigationControls = jest.spyOn(
      weekNavigationControls,
      'default',
    );
    render(
      <TestWrapper>
        <DeskCalendar />
      </TestWrapper>,
    );

    const changeWeekOffset =
      mockWeekNavigationControls.mock.calls[0][0].onPress;
    act(() => {
      changeWeekOffset();
    });
    await waitFor(() => {
      const weekOffset = mockWeekNavigationControls.mock.calls[1][0].weekOffset;
      expect(weekOffset).toBe(1);
    });
    const updatedChangeWeekOffset =
      mockWeekNavigationControls.mock.calls[1][0].onPress;
    act(() => {
      updatedChangeWeekOffset();
    });
    await waitFor(() => {
      const updatedWeekOffset =
        mockWeekNavigationControls.mock.calls[2][0].weekOffset;
      expect(updatedWeekOffset).toBe(0);
    });
  });
});
