import React from 'react';
import {TestWrapper} from '@components/TestWrapper';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import CalendarWeek from '@molecules/CalendarWeek/CalendarWeek';
import * as selectedDaySlice from '@state/reducers/selectedDayOptionsSlice';
import * as bankHolidayUtils from '@utils/BankHolidayUtils/BankHolidayUtils';
import * as selectableDate from '@atoms/SelectableDate/SelectableDate';
import * as useAppSelector from '@state/utils/hooks';
import {Dayjs} from 'dayjs';
import {BankHoliday} from '@customTypes/index';

describe('When the calendar week is on screen', () => {
  let bankHolidaysSpy: jest.SpyInstance<
    Promise<BankHoliday[]>,
    [today?: Dayjs | undefined],
    any
  >;

  let useAppSelectorSpy: jest.SpyInstance;
  beforeEach(() => {
    jest.clearAllMocks();
    bankHolidaysSpy = jest.spyOn(
      bankHolidayUtils,
      'getFilteredBankHolidaysFrom',
    );
    bankHolidaysSpy.mockResolvedValue([]);
    useAppSelectorSpy = jest.spyOn(useAppSelector, 'useAppSelector');
  });

  let testDays = [
    '2023-06-26T00:00:00Z',
    '2023-06-27T00:00:00Z',
    '2023-06-28T00:00:00Z',
    '2023-06-29T00:00:00Z',
    '2023-06-30T00:00:00Z',
    '2023-07-03T00:00:00Z',
    '2023-07-04T00:00:00Z',
    '2023-07-05T00:00:00Z',
    '2023-07-06T00:00:00Z',
    '2023-07-07T00:00:00Z',
  ];

  it('Renders Correctly', async () => {
    const {getByTestId, getByText} = render(
      <TestWrapper>
        <CalendarWeek days={testDays} weekOffset={0} currentDay={0} />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(bankHolidaysSpy).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(getByText('Mon')).toBeTruthy();
      expect(getByText('Tue')).toBeTruthy();
      expect(getByText('Wed')).toBeTruthy();
      expect(getByText('Thu')).toBeTruthy();
      expect(getByText('Fri')).toBeTruthy();

      expect(getByTestId('CalendarWeek')).toBeTruthy();
    });
  });

  it('Shows the first 5 five days if weekOffset=0', async () => {
    const {getByText} = render(
      <TestWrapper>
        <CalendarWeek days={testDays} weekOffset={0} currentDay={0} />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(bankHolidaysSpy).toHaveBeenCalled();
    });

    expect(getByText('26')).toBeTruthy();
    expect(getByText('27')).toBeTruthy();
    expect(getByText('28')).toBeTruthy();
    expect(getByText('29')).toBeTruthy();
    expect(getByText('30')).toBeTruthy();
  });

  it('Shows the last 5 five days if weekOffset=1', async () => {
    const {getByText} = render(
      <TestWrapper>
        <CalendarWeek days={testDays} weekOffset={1} currentDay={0} />
      </TestWrapper>,
    );
    await waitFor(() => {
      expect(bankHolidaysSpy).toHaveBeenCalled();
    });
    expect(getByText('3')).toBeTruthy();
    expect(getByText('4')).toBeTruthy();
    expect(getByText('5')).toBeTruthy();
    expect(getByText('6')).toBeTruthy();
    expect(getByText('7')).toBeTruthy();
  });

  it('Updates the selected day accordingly when a day is pressed and not already selected', async () => {
    const storeSelectedDaySpy = jest.spyOn(
      selectedDaySlice,
      'storeSelectedDay',
    );

    const {getByText} = render(
      <TestWrapper>
        <CalendarWeek days={testDays} weekOffset={0} currentDay={1} />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(bankHolidaysSpy).toHaveBeenCalled();
    });

    fireEvent.press(getByText('Fri'));
    expect(storeSelectedDaySpy).toBeCalledWith('2023-06-30T00:00:00Z');
  });

  it('Disables the SelectableDate component if it is in the past', async () => {
    let selectableDateSpy = jest.spyOn(selectableDate, 'default');

    render(
      <TestWrapper>
        <CalendarWeek days={testDays} weekOffset={0} currentDay={2} />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(bankHolidaysSpy).toHaveBeenCalled();
    });

    let expectedDisabledValues = [true, true, false, false, false];
    expectedDisabledValues.forEach((value, index) => {
      expect(selectableDateSpy).toBeCalledWith(
        expect.objectContaining({date: testDays[index], disabled: value}),
        {},
      );
    });
  });
  it('Disables the SelectableDate component if it is a bank holiday', async () => {
    bankHolidaysSpy.mockResolvedValue([
      {
        date: '2023-06-28',
        title: 'Valid bank holiday',
      },
    ]);
    let selectableDateSpy = jest.spyOn(selectableDate, 'default');
    render(
      <TestWrapper>
        <CalendarWeek days={testDays} weekOffset={0} currentDay={0} />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(bankHolidaysSpy).toHaveBeenCalled();
    });

    let expectedDisabledValues = [false, false, true, false, false];
    expectedDisabledValues.forEach(async (value, index) => {
      await waitFor(() => {
        expect(selectableDateSpy).toBeCalledWith(
          expect.objectContaining({date: testDays[index], disabled: value}),
          {},
        );
      });
    });
  });

  it('Enables the SelectableDate component if it is not in the past and not a bank holiday', async () => {
    let selectableDateSpy = jest.spyOn(selectableDate, 'default');
    render(
      <TestWrapper>
        <CalendarWeek days={testDays} weekOffset={0} currentDay={0} />
      </TestWrapper>,
    );
    await waitFor(() => {
      expect(bankHolidaysSpy).toHaveBeenCalled();
    });
    let expectedDisabledValues = [false, false, false, false, false];
    expectedDisabledValues.forEach((value, index) => {
      expect(selectableDateSpy).toBeCalledWith(
        expect.objectContaining({date: testDays[index], disabled: value}),
        {},
      );
    });
  });

  it('sets the selectableDate if the user has booked the day', async () => {
    const days: [string, boolean][] = [
      ['2023-06-26T00:00:00Z', true],
      ['2023-06-27T00:00:00Z', true],
      ['2023-06-28T00:00:00Z', false],
      ['2023-06-29T00:00:00Z', false],
    ];
    const activeBookingDates = ['2023-06-26T00:00:00Z', '2023-06-27T00:00:00Z'];
    useAppSelectorSpy.mockReturnValue({
      activeBookingDates,
    });
    let selectableDateSpy = jest.spyOn(selectableDate, 'default');
    render(
      <TestWrapper>
        <CalendarWeek
          days={days.map(day => day[0])}
          weekOffset={0}
          currentDay={0}
        />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(bankHolidaysSpy).toHaveBeenCalled();
    });

    days.forEach(([day, expectation], index) => {
      expect(selectableDateSpy).toHaveBeenNthCalledWith(
        index + 1,
        expect.objectContaining({isBooked: expectation, date: day}),
        {},
      );
    });
  });
});
