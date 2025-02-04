import * as getBankHolidays from '@api/getBankHolidays';
import {getFilteredBankHolidaysFrom, isBankHoliday} from './BankHolidayUtils';
import {AllBankHolidays} from '@customTypes/index';
import dayjs from 'dayjs';

const mockBankHolidays: AllBankHolidays = {
  'england-and-wales': {
    events: [
      {
        date: '2023-05-23',
        title: 'Bank holiday in past',
      },
      {
        date: '2023-07-01',
        title: 'Valid bank holiday',
      },
      {
        date: '2023-09-01',
        title: 'Bank holiday too far in the future',
      },
    ],
  },
};

describe('getBankHolidaysFrom', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const spy = jest.spyOn(getBankHolidays, 'default');
    spy.mockImplementation(() => Promise.resolve(mockBankHolidays));
  });
  it('excludes dates in the past and too far in the future', async () => {
    const result = await getFilteredBankHolidaysFrom(dayjs('2023-06-30'));
    expect(result).toMatchObject([
      {
        date: '2023-07-01',
        title: 'Valid bank holiday',
      },
    ]);
  });
});

describe('isBankHoliday', () => {
  it('determines that a day is a bank holiday correctly', () => {
    const validBankHolidays = ['2023-05-23', '2023-07-01', '2023-09-01'];
    validBankHolidays.forEach(date => {
      expect(
        isBankHoliday(date, mockBankHolidays['england-and-wales'].events),
      ).toBeTruthy();
    });
  });
  it('determines that a day is not a bank holiday correctly', () => {
    const invalidBankHolidays = ['2023-02-23', '2023-01-01', '2023-10-01'];
    invalidBankHolidays.forEach(date => {
      expect(
        isBankHoliday(date, mockBankHolidays['england-and-wales'].events),
      ).toBeFalsy();
    });
  });
});
